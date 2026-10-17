import type { IntakeMethod } from "./types";

// A visitor who shared a LinkedIn link or described their work has no resume
// for us to have "read", so report wording that critiques "your resume" is
// reframed as guidance for the resume they're about to write.
export function hasResume(method?: IntakeMethod | null) {
  return !method || method === "resume";
}

export interface ReportCopy {
  headerPlan: string;
  directionLead: string;
  readinessTitle: string;
  readinessSubtitle: string;
  readinessOverall: string;
  readinessLabel: (label: string) => string;
  improveTitle: string;
  improveSubtitle: string;
  rolesSubtitle: string;
  strengthsLabel: string;
  scoreStory: string;
  bulletsTitle: string;
  addTitle: string;
  reduceTitle: string;
  measurableTitle: string;
  rewritesTitle: string;
  rewriteBefore: string;
  rewriteAfter: string;
  sevenDayNote: string;
}

const WITH_RESUME: ReportCopy = {
  headerPlan:
    "This is a practical plan, not a verdict. It shows what role to target, what to fix on your resume, what to learn first, what to build, and exactly what to do in the next 7 days.",
  directionLead: "your resume shows clear signals in",
  readinessTitle: "Your Resume Readiness Review",
  readinessSubtitle:
    "How ready your resume is for future-ready roles today — and the fastest fixes.",
  readinessOverall: "Overall resume readiness",
  readinessLabel: (label) => label,
  improveTitle: "How to Improve Your Resume",
  improveSubtitle: "Specific, practical changes you can make this week.",
  rolesSubtitle: "Realistic job titles based on your resume signals and interest.",
  strengthsLabel: "Resume strengths that support it: ",
  scoreStory: "one improved resume story",
  bulletsTitle: "Future Resume Bullets",
  addTitle: "What to add",
  reduceTitle: "What to reduce",
  measurableTitle: "What to make measurable",
  rewritesTitle: "Before and after resume bullets",
  rewriteBefore: "Current style",
  rewriteAfter: "Improved style",
  sevenDayNote:
    "You do not need to master everything at once. Start with one tool, one project and one improved resume story.",
};

const NO_RESUME: ReportCopy = {
  headerPlan:
    "This is a practical plan, not a verdict. It shows what role to target, how to turn your experience into a strong resume, what to learn first, what to build, and exactly what to do in the next 7 days.",
  directionLead: "what you shared shows clear signals in",
  readinessTitle: "Your Career Profile Readiness",
  readinessSubtitle:
    "How ready your background is for future-ready roles today — and what to strengthen first.",
  readinessOverall: "Overall profile readiness",
  readinessLabel: (label) => (label === "Resume Clarity" ? "Profile Clarity" : label),
  improveTitle: "Turn Your Experience Into a Resume",
  improveSubtitle:
    "You don't have a resume yet — here is exactly what to put in your first one, using what you told us.",
  rolesSubtitle: "Realistic job titles based on your background and interest.",
  strengthsLabel: "Strengths that support it: ",
  scoreStory: "one first-draft resume",
  bulletsTitle: "Bullets for Your Future Resume",
  addTitle: "What to include",
  reduceTitle: "What to leave out",
  measurableTitle: "Numbers worth tracking down",
  rewritesTitle: "From how you described it to resume-ready bullets",
  rewriteBefore: "How you described it",
  rewriteAfter: "As a resume bullet",
  sevenDayNote:
    "You do not need to master everything at once. Start with one tool, one project and one first-draft resume.",
};

export const reportCopy = (method?: IntakeMethod | null): ReportCopy =>
  hasResume(method) ? WITH_RESUME : NO_RESUME;

// Added to the AI prompts so generated sentences match the fixed wording above.
export const NO_RESUME_PROMPT =
  "IMPORTANT: this candidate did NOT provide a resume. They shared their background by describing " +
  "it (or via a short LinkedIn profile excerpt). Never say 'your resume shows', 'your current resume' " +
  "or imply you reviewed a document of theirs — say 'what you shared' or 'your background' instead. " +
  "Wherever a field is about 'the resume', treat it as guidance for the FIRST resume they are about " +
  "to write from this background: readiness scores and recommendations assess how ready their " +
  "career profile is (and 'resumeClarity' means how clearly their background came across); " +
  "'resumeAdd' = what to include in their first resume; 'resumeReduce' = what to leave out or keep " +
  "short when writing it; 'resumeMeasurable' = numbers they should track down from their work; " +
  "rewrites 'before' = how they might casually describe the task, 'after' = the resume-ready bullet.";
