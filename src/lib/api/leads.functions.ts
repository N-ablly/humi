import { createServerFn } from "@tanstack/react-start";

import { getSupabaseAdmin } from "../humi/supabase.server";
import { requireAdminSession } from "../humi/session.server";
import { getCandidateSession } from "../humi/candidate-session.server";
import type { Counselling } from "../humi/counselling";
import type { IntakeMethod, ParsedResume, Report, SignupData } from "../humi/types";

const RESUME_BUCKET = "resumes";

// Columns added for the event intake flow. If the database hasn't been
// migrated yet (or its schema cache is stale), lead capture must still work,
// so a write that trips over them is retried without them.
const INTAKE_COLUMNS = ["intake_method", "linkedin_url", "source"] as const;

function isMissingIntakeColumn(message: string) {
  return new RegExp(`\\b(${INTAKE_COLUMNS.join("|")})\\b`).test(message);
}

function withoutIntakeColumns(payload: Record<string, unknown>) {
  const rest = { ...payload };
  for (const c of INTAKE_COLUMNS) delete rest[c];
  return rest;
}

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected form data");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const session = await getCandidateSession();

    const firstName = String(data.get("firstName") ?? "");
    const lastName = String(data.get("lastName") ?? "");
    const email = String(data.get("email") ?? "");
    const phone = String(data.get("phone") ?? "");
    const careerStage = String(data.get("careerStage") ?? "");
    const recommendedRole = String(data.get("recommendedRole") ?? "");
    const careerInterest = String(data.get("careerInterest") ?? "");
    const aiReadiness = Number(data.get("aiReadiness") ?? 0);
    const reportJson = data.get("reportJson");
    const counsellingJson = data.get("counsellingJson");
    const parsedJson = data.get("parsedJson");
    const file = data.get("resume");
    const leadId = String(data.get("leadId") ?? "").trim() || null;

    let resumePath: string | null = null;
    let resumeFileName: string | null = null;

    if (file instanceof File && file.size > 0) {
      resumeFileName = file.name;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      resumePath = `${crypto.randomUUID()}/${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(resumePath, file, { contentType: file.type || undefined });
      if (uploadError) {
        throw new Error(`Resume upload failed: ${uploadError.message}`);
      }
    }

    const payload: Record<string, unknown> = {
      user_id: session.data.userId ?? null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      career_stage: careerStage,
      recommended_role: recommendedRole,
      career_interest: careerInterest,
      ai_readiness: aiReadiness,
      report_json: typeof reportJson === "string" ? JSON.parse(reportJson) : null,
      counselling_json: typeof counsellingJson === "string" ? JSON.parse(counsellingJson) : null,
      parsed_json: typeof parsedJson === "string" ? JSON.parse(parsedJson) : null,
    };
    // Intake details are only written when the caller sent them, so a later
    // update (linking the account at PDF download) can't blank them out.
    for (const [field, column] of [
      ["intakeMethod", "intake_method"],
      ["linkedinUrl", "linkedin_url"],
      ["source", "source"],
    ] as const) {
      if (data.has(field)) {
        payload[column] = String(data.get(field) ?? "").trim() || null;
      }
    }

    // Only touch the resume columns when this call actually carries a file,
    // so a later update (e.g. linking the account after PDF-gate signup)
    // doesn't null out the resume captured by the original submission.
    if (resumePath) {
      payload.resume_path = resumePath;
      payload.resume_file_name = resumeFileName;
    }

    // A leadId means this is the same report being re-submitted (most often
    // to attach the account just created at PDF-download time) — update that
    // row in place instead of inserting a duplicate candidate record.
    if (leadId) {
      const write = (values: Record<string, unknown>) =>
        supabase.from("candidates").update(values).eq("id", leadId).select("id").maybeSingle();
      let { data: updated, error: updateError } = await write(payload);
      if (updateError && isMissingIntakeColumn(updateError.message)) {
        ({ data: updated, error: updateError } = await write(withoutIntakeColumns(payload)));
      }
      if (updateError) {
        throw new Error(`Failed to save candidate: ${updateError.message}`);
      }
      if (updated) {
        return { ok: true as const, id: updated.id as string };
      }
    }

    const id = crypto.randomUUID();
    let { error } = await supabase.from("candidates").insert({ id, ...payload });
    if (error && isMissingIntakeColumn(error.message)) {
      ({ error } = await supabase
        .from("candidates")
        .insert({ id, ...withoutIntakeColumns(payload) }));
    }
    if (error) {
      throw new Error(`Failed to save candidate: ${error.message}`);
    }

    return { ok: true as const, id };
  });

// Lets a returning, already-authenticated candidate land back on their most
// recent report instead of re-uploading and re-generating from scratch.
export const getMyReport = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    id: string;
    intakeMethod: IntakeMethod | null;
    linkedinUrl: string | null;
    signup: SignupData;
    parsed: ParsedResume;
    report: Report;
    counselling: Counselling;
  } | null> => {
    const session = await getCandidateSession();
    if (!session.data.userId) return null;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("user_id", session.data.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data?.report_json || !data.counselling_json || !data.parsed_json) return null;

    return {
      id: data.id as string,
      intakeMethod: (data.intake_method as IntakeMethod | null) ?? null,
      linkedinUrl: (data.linkedin_url as string | null) ?? null,
      signup: {
        firstName: data.first_name as string,
        lastName: data.last_name as string,
        email: data.email as string,
        phone: (data.phone as string) ?? "",
        location: "",
        careerStage: (data.career_stage as SignupData["careerStage"]) ?? "",
        consent: true,
      },
      parsed: data.parsed_json as ParsedResume,
      report: data.report_json as Report,
      counselling: data.counselling_json as Counselling,
    };
  },
);

export const getLeads = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  return Promise.all(
    rows.map(async (row) => {
      let resumeUrl: string | null = null;
      if (row.resume_path) {
        const { data: signed } = await supabase.storage
          .from(RESUME_BUCKET)
          .createSignedUrl(row.resume_path, 3600);
        resumeUrl = signed?.signedUrl ?? null;
      }
      return {
        id: row.id as string,
        firstName: row.first_name as string,
        lastName: row.last_name as string,
        email: row.email as string,
        phone: row.phone as string,
        careerStage: row.career_stage as string,
        resumeFileName: row.resume_file_name as string | null,
        resumeUrl,
        recommendedRole: row.recommended_role as string,
        careerInterest: row.career_interest as string,
        aiReadiness: row.ai_readiness as number,
        intakeMethod: (row.intake_method as string | null) ?? null,
        linkedinUrl: (row.linkedin_url as string | null) ?? null,
        source: (row.source as string | null) ?? null,
        createdAt: row.created_at as string,
      };
    }),
  );
});
