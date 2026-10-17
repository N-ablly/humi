// Universal, non-personalized copy shared by every report. Kept as fixed
// content (not AI-generated) since it doesn't vary by candidate — this also
// shrinks and de-risks the structured-generation schema.

export const GAP_CATEGORIES = [
  { key: "aiToolFluency", label: "AI Tool Fluency" },
  { key: "communication", label: "Communication" },
  { key: "dataLiteracy", label: "Data Literacy" },
  { key: "workflowThinking", label: "Workflow Thinking" },
  { key: "industryKnowledge", label: "Industry Knowledge" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "automationReadiness", label: "Automation Readiness" },
  { key: "leadershipPotential", label: "Leadership Potential" },
] as const;

export const READINESS_LABELS = [
  { key: "resumeClarity", label: "Resume Clarity" },
  { key: "roleAlignment", label: "Role Alignment" },
  { key: "aiReadiness", label: "AI Readiness" },
  { key: "quantifiedAchievements", label: "Quantified Achievements" },
  { key: "toolVisibility", label: "Tool Visibility" },
  { key: "keywordStrength", label: "Keyword Strength" },
  { key: "projectPortfolioStrength", label: "Project / Portfolio Strength" },
  { key: "communicationImpact", label: "Communication Impact" },
] as const;

export const SCORE_LABELS = [
  { key: "aiReadiness", label: "AI Readiness" },
  { key: "automationExposure", label: "Automation Exposure" },
  { key: "learningUrgency", label: "Learning Urgency" },
  { key: "careerGrowthPotential", label: "Career Growth Potential" },
  { key: "humanSkillAdvantage", label: "Human Skill Advantage" },
] as const;

export const MATRIX_SECTIONS = [
  { key: "learnFirst", title: "Learn First", note: "High impact and easy to start this week." },
  { key: "buildNext", title: "Build Next", note: "High impact, needs a little practice." },
  { key: "usefulAddons", title: "Useful Add-ons", note: "Helpful, but not urgent." },
  {
    key: "advancedLater",
    title: "Advanced Later",
    note: "Learn after the basics feel comfortable.",
  },
] as const;

export const ANSWER_STRUCTURE = [
  {
    step: "Situation",
    detail: "One sentence of context — what was happening and why it mattered.",
  },
  { step: "Action", detail: "What you personally did, in specific steps." },
  { step: "Result", detail: "The outcome, with a number where possible." },
  {
    step: "AI-readiness angle",
    detail: "How you would now do it faster or better using AI, with human review.",
  },
];

export const SAFETY_TIPS = [
  {
    title: "Keep confidential information out of public AI tools",
    detail:
      "Never paste customer data, salaries, contracts or internal documents into a public chatbot.",
  },
  {
    title: "Always review AI output before you use it",
    detail: "You are accountable for the final work, not the tool. Check facts, names and numbers.",
  },
  {
    title: "Only claim tools you have actually practiced",
    detail:
      "Add a tool to your resume after you have used it in a real task or project — then you can talk about it confidently.",
  },
  {
    title: "Use AI to improve your thinking, not replace it",
    detail: "Ask it to challenge your draft, list what you missed, or explain the trade-offs.",
  },
  {
    title: "Keep evidence of your own work",
    detail:
      "Save your projects, before/after examples and results. Evidence is what wins interviews.",
  },
  {
    title: "Learn the basic privacy rules of your industry",
    detail:
      "Finance, healthcare, HR and legal all have specific rules. Knowing them makes you safer to hire.",
  },
];

export const GAP_WHY: Record<string, string> = {
  "AI Tool Fluency":
    "Employers now assume a new hire can use AI safely to draft, summarize and research faster.",
  Communication:
    "Clear written and verbal updates reduce management overhead — teams pay for that.",
  "Data Literacy":
    "Decisions are made from numbers; people who can read them get included earlier.",
  "Workflow Thinking": "Anyone who can see and fix a broken process saves the company real money.",
  "Industry Knowledge": "Context makes your recommendations credible in the first 90 days.",
  "Problem Solving": "Interviewers hire evidence of ownership, not lists of responsibilities.",
  "Automation Readiness": "One working automation is the clearest proof of modern productivity.",
  "Leadership Potential": "Employers promote people who improve things without being asked.",
};

export const SCORE_EXPLAINERS: Record<string, { how: string; raise: string }> = {
  "AI Readiness": {
    how: "The average of your eight skill-gap scores across AI, data, workflow and human skills.",
    raise: "Finish one mini project and practice five prompts weekly.",
  },
  "Automation Exposure": {
    how: "How much of a typical day in your role is repetitive and rules-based.",
    raise: "Move toward tasks that need judgment, relationships or design.",
  },
  "Learning Urgency": {
    how: "How quickly your role is changing compared with how ready you are today.",
    raise: "A focused 30 days on the Learn First quadrant drops this fast.",
  },
  "Career Growth Potential": {
    how: "Your transferable experience plus the demand in your target roles.",
    raise: "Add one measurable achievement and one project to your resume.",
  },
  "Human Skill Advantage": {
    how: "Your strength in communication, empathy, judgment and problem solving.",
    raise: "Document real stories where these skills changed an outcome.",
  },
};

export const PATH_OUTPUTS = [
  "Output: an improved resume, five working prompts, and one AI-assisted work sample.",
  "Output: one mini project, one simple dashboard or tracker, and one workflow map.",
  "Output: a portfolio case study, an interview pitch, updated resume bullets and a job application plan.",
];

export const STATIC_TOOL_GROUPS = {
  mustLearnFirst: {
    title: "Must Learn First",
    note: "Start here — these pay off within a week.",
    tools: [
      {
        name: "ChatGPT",
        useCase: "Drafting, summarizing and research support.",
        practice: "Summarize a long document into five bullets and three actions.",
        resume: "Shows everyday AI fluency in any role.",
      },
      {
        name: "Excel / Google Sheets with AI",
        useCase: "Cleaning, analyzing and presenting data.",
        practice: "Turn a messy sheet into a clean pivot table summary.",
        resume: "Still the most requested practical skill in job ads.",
      },
      {
        name: "Claude",
        useCase: "Careful review of long documents.",
        practice: "Ask it to critique your resume, or a first draft, against a job description.",
        resume: "Signals thoughtful, quality-checked AI use.",
      },
    ],
  },
  exploreLater: {
    title: "Explore Later",
    note: "Come back to these once the basics feel easy.",
    tools: [
      {
        name: "Power BI or Looker Studio",
        useCase: "Building shareable dashboards.",
        practice: "Rebuild one report as a simple visual dashboard.",
        resume: "Moves you toward analyst-level roles.",
      },
      {
        name: "n8n or Make",
        useCase: "More advanced multi-step automation.",
        practice: "Chain three apps together in one workflow.",
        resume: "Proves genuine automation capability.",
      },
      {
        name: "Basic SQL",
        useCase: "Querying data yourself.",
        practice: "Write five queries against a public dataset.",
        resume: "Unlocks data and reporting career tracks.",
      },
    ],
  },
};

function statusFor(score: number): "Needs Work" | "Developing" | "Strong" {
  return score >= 70 ? "Strong" : score >= 45 ? "Developing" : "Needs Work";
}

export { statusFor };
