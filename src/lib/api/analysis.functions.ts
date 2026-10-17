import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { getAnthropicClient, CLAUDE_MODEL } from "../ai/anthropic.server";
import {
  ResumeAnalysisSchema,
  CoreReportSchema,
  ResumeFeedbackSchema,
  RolesAndPlanSchema,
  type CoreReportOutput,
  type ResumeFeedbackOutput,
  type RolesAndPlanOutput,
} from "../ai/schemas";
import {
  parseResume as fallbackParseResume,
  buildReport as fallbackBuildReport,
  getRecommendations as fallbackGetRecommendations,
} from "../humi/engine";
import {
  buildCounselling as fallbackBuildCounselling,
  type Counselling,
} from "../humi/counselling";
import { hasResume, NO_RESUME_PROMPT } from "../humi/intake-copy";
import type { ParsedResume, Recommendation, Report, SignupData } from "../humi/types";

const signupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  careerStage: z.string(),
  consent: z.boolean(),
});

const analyzeInputSchema = z.object({
  resumeText: z.string().optional(),
  intakeMethod: z.enum(["resume", "linkedin", "typed", "voice"]).optional(),
  manual: z.object({
    recentRole: z.string(),
    experienceSummary: z.string(),
    keySkills: z.string(),
    industries: z.string(),
  }),
  signup: signupSchema,
});

function fallbackAnalyze(data: z.infer<typeof analyzeInputSchema>) {
  const parsed = fallbackParseResume(
    { ...data.manual, resumeText: data.resumeText },
    data.signup as SignupData,
  );
  const recommendations = fallbackGetRecommendations(parsed.familyKey);
  return { parsed, recommendations };
}

const INTAKE_NOTES = {
  resume: "",
  linkedin:
    "an excerpt of the candidate's public LinkedIn profile (headline and short summary only — it " +
    "is much thinner than a full resume, so infer conservatively and do not invent employers, " +
    "titles or years of experience that the text does not support).",
  typed:
    "the candidate typed a short self-description instead of uploading a resume — informal and " +
    "possibly incomplete, so infer conservatively and do not invent details they did not state.",
  voice:
    "the candidate narrated their background aloud and it was transcribed by speech recognition — " +
    "expect informal phrasing, filler words and possible mis-heard words; interpret the intent " +
    "sensibly and do not invent details they did not state.",
} as const;

export const analyzeResume = createServerFn({ method: "POST" })
  .validator(analyzeInputSchema)
  .handler(
    async ({ data }): Promise<{ parsed: ParsedResume; recommendations: Recommendation[] }> => {
      const resumeText = (data.resumeText ?? "").trim();
      const intakeNote = INTAKE_NOTES[data.intakeMethod ?? "resume"];
      const manualBlob = [
        data.manual.recentRole,
        data.manual.experienceSummary,
        data.manual.keySkills,
        data.manual.industries,
      ]
        .filter(Boolean)
        .join("\n");

      if (!resumeText && !manualBlob) {
        return fallbackAnalyze(data);
      }

      try {
        const client = getAnthropicClient();
        const response = await client.messages.parse({
          model: CLAUDE_MODEL,
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          output_config: { format: zodOutputFormat(ResumeAnalysisSchema), effort: "high" },
          system:
            "You are a career analyst for an AI-career-evolution platform. Read this candidate's resume " +
            "and produce an honest, specific analysis. Calibrate everything to their ACTUAL seniority and " +
            "evidenced skills — a 10-year veteran and a fresh graduate must get visibly different depth, role " +
            "ambition and vocabulary. Recommend roles appropriately ambitious for their real level: never " +
            "recommend entry-level roles to a senior expert, and never recommend roles beyond what a junior " +
            "candidate's evidence supports. Never output generic filler — every sentence should reflect this " +
            "specific resume, not a template.",
          messages: [
            {
              role: "user",
              content: [
                `Candidate self-reported career stage: ${data.signup.careerStage || "not specified"}`,
                intakeNote ? `How this background was provided: ${intakeNote}` : null,
                resumeText ? `Resume text:\n${resumeText}` : null,
                manualBlob ? `Manually entered background:\n${manualBlob}` : null,
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
        });

        const out = response.parsed_output;
        if (!out) throw new Error("Model did not return parseable output");

        const parsed: ParsedResume = {
          recentRole: out.recentRole,
          primaryFunction: out.primaryFunction,
          yearsExperience: out.yearsExperience,
          industryExposure: out.industryExposure,
          summary: out.summary,
          skills: out.skills,
        };

        return { parsed, recommendations: out.recommendations };
      } catch (error) {
        console.error("analyzeResume: falling back to deterministic engine", error);
        return fallbackAnalyze(data);
      }
    },
  );

const parsedResumeSchema = z.object({
  fileName: z.string().optional(),
  recentRole: z.string(),
  primaryFunction: z.string(),
  yearsExperience: z.string(),
  industryExposure: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
});

const interestSchema = z.object({
  chosenRole: z.string(),
  notes: z.string(),
  industry: z.string(),
});

const reportInputSchema = z.object({
  intakeMethod: z.enum(["resume", "linkedin", "typed", "voice"]).optional(),
  parsed: parsedResumeSchema,
  interest: interestSchema,
  signup: signupSchema,
});

function fallbackGenerate(data: z.infer<typeof reportInputSchema>) {
  const report = fallbackBuildReport(
    data.parsed as ParsedResume,
    data.interest,
    data.signup as SignupData,
  );
  const counselling = fallbackBuildCounselling(
    data.parsed as ParsedResume,
    data.interest,
    data.signup as SignupData,
    report,
  );
  return { report, counselling };
}

// Generating the report used to be one server function awaiting all three
// AI calls together, so the UI had nothing to show until every call had
// finished — a single long, uninterrupted wait. Each stage below is now its
// own server function, independently callable (and still fired in parallel
// from the client), so the UI can reveal each stage's content - with its own
// short "Continue" step - as soon as that stage's call resolves, instead of
// making the candidate wait through one long spinner for all three.
const REPORT_SYSTEM_PROMPT =
  "You are a career counsellor generating part of a personalized AI-career-evolution report. " +
  "Calibrate every section to this specific candidate's ACTUAL seniority and evidenced skills — " +
  "a senior expert should see advanced, ambitious content; a junior candidate should see " +
  "foundational, encouraging content. Never write generic, one-size-fits-all advice — every " +
  "recommendation, project, and bullet point must plausibly connect to THIS candidate's real " +
  "background and chosen direction. Be concrete and specific, not vague.";

function reportSystemPrompt(data: z.infer<typeof reportInputSchema>) {
  return hasResume(data.intakeMethod)
    ? REPORT_SYSTEM_PROMPT
    : `${REPORT_SYSTEM_PROMPT} ${NO_RESUME_PROMPT}`;
}

function reportUserContent(data: z.infer<typeof reportInputSchema>) {
  return JSON.stringify({
    candidateBackground: data.parsed,
    chosenDirection: data.interest,
    careerStage: data.signup.careerStage,
  });
}

export const generateCoreStage = createServerFn({ method: "POST" })
  .validator(reportInputSchema)
  .handler(async ({ data }): Promise<{ ok: true; core: CoreReportOutput } | { ok: false }> => {
    try {
      const client = getAnthropicClient();
      const response = await client.messages.parse({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { format: zodOutputFormat(CoreReportSchema), effort: "high" },
        system: reportSystemPrompt(data),
        messages: [{ role: "user", content: reportUserContent(data) }],
      });
      const core = response.parsed_output;
      if (!core) throw new Error("Model did not return parseable output");
      return { ok: true, core };
    } catch (error) {
      console.error("generateCoreStage failed", error);
      return { ok: false };
    }
  });

export const generateResumeFeedbackStage = createServerFn({ method: "POST" })
  .validator(reportInputSchema)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; resumeFeedback: ResumeFeedbackOutput } | { ok: false }> => {
      try {
        const client = getAnthropicClient();
        const response = await client.messages.parse({
          model: CLAUDE_MODEL,
          max_tokens: 16000,
          thinking: { type: "adaptive" },
          output_config: { format: zodOutputFormat(ResumeFeedbackSchema), effort: "high" },
          system: reportSystemPrompt(data),
          messages: [{ role: "user", content: reportUserContent(data) }],
        });
        const resumeFeedback = response.parsed_output;
        if (!resumeFeedback) throw new Error("Model did not return parseable output");
        return { ok: true, resumeFeedback };
      } catch (error) {
        console.error("generateResumeFeedbackStage failed", error);
        return { ok: false };
      }
    },
  );

export const generateRolesAndPlanStage = createServerFn({ method: "POST" })
  .validator(reportInputSchema)
  .handler(
    async ({ data }): Promise<{ ok: true; rolesAndPlan: RolesAndPlanOutput } | { ok: false }> => {
      try {
        const client = getAnthropicClient();
        const response = await client.messages.parse({
          model: CLAUDE_MODEL,
          max_tokens: 16000,
          thinking: { type: "adaptive" },
          output_config: { format: zodOutputFormat(RolesAndPlanSchema), effort: "high" },
          system: reportSystemPrompt(data),
          messages: [{ role: "user", content: reportUserContent(data) }],
        });
        const rolesAndPlan = response.parsed_output;
        if (!rolesAndPlan) throw new Error("Model did not return parseable output");
        return { ok: true, rolesAndPlan };
      } catch (error) {
        console.error("generateRolesAndPlanStage failed", error);
        return { ok: false };
      }
    },
  );

// Used when any one stage's AI call fails - rather than show a jarring mix
// of AI-quality and generic content, the whole report degrades together to
// the deterministic engine, same as the original all-or-nothing behavior.
export const generateFallbackReport = createServerFn({ method: "POST" })
  .validator(reportInputSchema)
  .handler(async ({ data }): Promise<{ report: Report; counselling: Counselling }> => {
    return fallbackGenerate(data);
  });
