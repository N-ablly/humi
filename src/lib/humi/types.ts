export type CareerStage =
  | "Student / Fresh Graduate"
  | "Early Career"
  | "Mid-Career"
  | "Career Switcher"
  | "Returning to Workforce"
  | "Senior Professional";

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  careerStage: CareerStage | "";
  consent: boolean;
}

export type IntakeMethod = "resume" | "linkedin" | "typed" | "voice";

export interface ResumeInput {
  fileName?: string;
  resumeText?: string;
  intakeMethod?: IntakeMethod;
  linkedinUrl?: string;
  recentRole: string;
  experienceSummary: string;
  keySkills: string;
  industries: string;
}

export interface ParsedResume {
  fileName?: string;
  recentRole: string;
  primaryFunction: string;
  familyKey?: FamilyKey;
  yearsExperience: string;
  industryExposure: string;
  summary: string;
  skills: string[];
}

export interface Recommendation {
  title: string;
  fit: string;
  aiChange: string;
  nextSkills: string[];
}

export interface InterestData {
  chosenRole: string;
  notes: string;
  industry: string;
}

export interface SkillGap {
  category: string;
  level: "Beginner" | "Developing" | "Strong";
  score: number;
  nextStep: string;
}

export interface SkillCard {
  name: string;
  why: string;
  beginnerAction: string;
  tool: string;
}

export interface ToolCard {
  name: string;
  helpsWith: string;
  why: string;
}

export interface Report {
  startingPoint: string;
  strengths: string[];
  gaps: string[];
  currentRole: string;
  futureRole: string;
  evolutionExplanation: string;
  automate: string[];
  assist: string[];
  human: string[];
  gapsAnalysis: SkillGap[];
  skillGroups: { title: string; skills: SkillCard[] }[];
  tools: ToolCard[];
  path: { window: string; title: string; items: string[] }[];
  scores: { label: string; value: number; note: string }[];
  aiReadiness: number;
  resumeBullets: string[];
}

export type FamilyKey =
  | "sales"
  | "marketing"
  | "hr"
  | "finance"
  | "support"
  | "operations"
  | "it"
  | "engineering"
  | "product"
  | "design"
  | "data"
  | "legal"
  | "procurement"
  | "admin"
  | "education"
  | "retail"
  | "general";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  careerStage: string;
  resumeFileName: string | null;
  resumeUrl: string | null;
  recommendedRole: string;
  careerInterest: string;
  aiReadiness: number;
  createdAt: string;
}

export type WorkType = "Onsite" | "Hybrid" | "Remote";

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyBlurb: string;
  location: string;
  workType: WorkType;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  aiTools: string;
  skills: string[];
  families: FamilyKey[];
  interviewDates: string[];
  interviewSlots: string[];
  interviewMode: "Video call" | "Onsite" | "Phone call";
  active: boolean;
  createdAt: string;
}

export type ApplicationStatus = "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  email: string;
  phone: string;
  note: string;
  interviewDate: string;
  interviewTime: string;
  interviewMode: string;
  status: ApplicationStatus;
  createdAt: string;
}

// Persisted client-side only (localStorage) so the standalone /jobs pages can
// prefill and match against the candidate who just left the report flow —
// candidate login exists, but these pages still work for guests, so this
// device-local snapshot stays the fallback link between a report and a
// later jobs-page visit.
export interface CandidateProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  familyKey?: FamilyKey;
  primaryFunction: string;
  currentRole: string;
  futureRole: string;
  skills: string[];
  interestRole: string;
}
