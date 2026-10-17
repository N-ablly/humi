import type { FamilyKey, InterestData, ParsedResume, Report, SignupData } from "./types";
import { getFamily } from "./engine";

/* ------------------------------------------------------------------ types */

export interface ReadinessItem {
  label: string;
  score: number;
  status: "Needs Work" | "Developing" | "Strong";
  recommendation: string;
}

export interface BulletRewrite {
  before: string;
  after: string;
  earned: boolean;
}

export interface TargetRole {
  title: string;
  why: string;
  supports: string;
  gap: string;
  aiEdge: string;
}

export interface Project {
  name: string;
  objective: string;
  tools: string[];
  steps: string[];
  output: string;
  bullet: string;
  interview: string;
}

export interface Counselling {
  readiness: ReadinessItem[];
  readinessAverage: number;
  resumeAdd: string[];
  resumeReduce: string[];
  resumeMeasurable: string[];
  resumeHighlight: string[];
  resumeHonesty: string[];
  rewrites: BulletRewrite[];
  targetRoles: TargetRole[];
  matrix: { title: string; note: string; items: string[] }[];
  projects: Project[];
  intro: string;
  interviewQuestions: { q: string; tip: string }[];
  answerStructure: { step: string; detail: string }[];
  practicePrompts: string[];
  keywords: { title: string; words: string[] }[];
  safety: { title: string; detail: string }[];
  starterPrompts: string[];
  sevenDays: { day: string; task: string; detail: string }[];
  dailyWork: { before: string; after: string }[];
  gapWhy: Record<string, string>;
  toolGroups: { title: string; note: string; tools: { name: string; useCase: string; practice: string; resume: string }[] }[];
  pathOutputs: string[];
  scoreExplainers: Record<string, { how: string; raise: string }>;
  bulletsNow: string[];
  bulletsEarned: string[];
}

/* ------------------------------------------------------- family knowledge */

interface FamilyCounsel {
  titles: string[];
  skillWords: string[];
  toolWords: string[];
  industryWords: string[];
  roleTools: string[];
  signature: Omit<Project, "bullet"> & { bullet: string };
  dailyWork: { before: string; after: string }[];
}

const p = (
  name: string,
  objective: string,
  tools: string[],
  steps: string[],
  output: string,
  bullet: string,
  interview: string,
): Project => ({ name, objective, tools, steps, output, bullet, interview });

const FAMILY_COUNSEL: Record<FamilyKey, FamilyCounsel> = {
  sales: {
    titles: ["Sales Development Representative", "Sales Operations Coordinator", "Account Management Associate", "Inside Sales Associate", "Client Success Associate", "Revenue Operations Assistant", "Partnerships Associate", "AI-Ready Sales Support Associate"],
    skillWords: ["Prospecting", "Pipeline management", "CRM hygiene", "Negotiation", "Account planning", "Follow-up discipline"],
    toolWords: ["AI-assisted lead research", "Prompt writing", "CRM automation", "Sequence automation", "Pipeline reporting"],
    industryWords: ["B2B sales", "SaaS", "Inside sales", "Enterprise accounts", "Channel sales"],
    roleTools: ["HubSpot", "LinkedIn Sales Navigator", "ChatGPT", "Zapier"],
    signature: p(
      "AI-Assisted Prospect Research Sheet",
      "Build a sheet that researches and prioritizes 25 target accounts with AI support.",
      ["Google Sheets", "ChatGPT", "LinkedIn"],
      ["List 25 companies that match your ideal customer.", "Ask AI to summarize each company's business and likely pain points.", "Score each account on fit, urgency and reachability.", "Draft one personalized opening line per account.", "Track replies and refine your scoring weekly."],
      "A scored, research-backed prospect list with personalized openers.",
      "Built an AI-assisted prospect research sheet to score 25 target accounts and personalize outreach.",
      "I used AI for research and scoring so my outreach was personalized instead of generic.",
    ),
    dailyWork: [
      { before: "Manual research before every call", after: "AI-prepared account briefs you review and refine" },
      { before: "Typing CRM notes after each meeting", after: "Auto-captured summaries you verify and act on" },
      { before: "Generic outreach templates", after: "Personalized messages tested against real responses" },
    ],
  },
  marketing: {
    titles: ["Marketing Associate", "Content Marketing Associate", "Social Media Coordinator", "Marketing Operations Assistant", "Growth Marketing Associate", "SEO Content Assistant", "Campaign Coordinator", "AI-Ready Content Systems Associate"],
    skillWords: ["Content creation", "Campaign planning", "Copywriting", "SEO basics", "Analytics", "Brand consistency"],
    toolWords: ["Prompt writing", "AI content repurposing", "Campaign analytics", "Marketing automation", "AI image editing"],
    industryWords: ["Digital marketing", "Brand marketing", "Performance marketing", "Content strategy", "Lifecycle marketing"],
    roleTools: ["Canva AI", "HubSpot", "ChatGPT", "Google Analytics"],
    signature: p(
      "One Idea, Ten Assets Content Kit",
      "Turn a single article into a full multi-channel campaign kit.",
      ["ChatGPT", "Canva AI", "Google Docs"],
      ["Pick one topic your target industry cares about.", "Write the core article with AI as an editor, not the author.", "Repurpose it into 5 social posts, 1 email and 1 carousel.", "Design the visuals in Canva with a consistent look.", "Write a short note on which asset you would test first and why."],
      "A ten-asset campaign kit from one source idea.",
      "Produced a ten-asset multi-channel campaign kit from one source article using AI-assisted repurposing.",
      "I showed how one idea can be scaled across channels without losing brand voice.",
    ),
    dailyWork: [
      { before: "Writing every asset from scratch", after: "Directing AI drafts and owning the final voice" },
      { before: "Monthly manual reporting", after: "Automated dashboards you interpret for the team" },
      { before: "One version of each message", after: "Several variations tested against real data" },
    ],
  },
  hr: {
    titles: ["HR Associate", "Talent Acquisition Coordinator", "People Operations Associate", "HR Operations Assistant", "Recruitment Sourcer", "Onboarding Coordinator", "HR Data Assistant", "AI-Ready People Ops Associate"],
    skillWords: ["Recruitment coordination", "Onboarding", "Employee records", "Policy communication", "Interview scheduling", "Confidentiality"],
    toolWords: ["AI job description drafting", "AI-assisted screening review", "HRIS automation", "People analytics", "Prompt writing"],
    industryWords: ["Talent acquisition", "People operations", "Employee experience", "HR shared services"],
    roleTools: ["ChatGPT", "Google Sheets", "an ATS (Workable, Lever)", "Notion AI"],
    signature: p(
      "AI-Assisted Hiring Toolkit",
      "Build a reusable toolkit that shortens time-to-shortlist for one role.",
      ["ChatGPT", "Google Sheets", "Google Docs"],
      ["Choose one role and write a clear job description with AI support.", "Define 6 objective screening criteria.", "Build a scorecard sheet that ranks candidates on those criteria.", "Draft structured interview questions per criterion.", "Write a short fairness note on how bias is reduced."],
      "A job description, scorecard and structured interview guide.",
      "Created an AI-assisted hiring toolkit with structured scorecards to make shortlisting faster and more consistent.",
      "I used AI to structure hiring decisions while keeping human judgment and fairness in the loop.",
    ),
    dailyWork: [
      { before: "Manual CV screening", after: "Structured scorecards you review with AI support" },
      { before: "Repetitive candidate emails", after: "Automated touchpoints you personalize where it matters" },
      { before: "Static HR reports", after: "Simple people dashboards you explain to leaders" },
    ],
  },
  finance: {
    titles: ["Finance Associate", "Accounts Payable Analyst", "Reporting Analyst Trainee", "Financial Planning Assistant", "Billing Operations Associate", "Audit Support Associate", "Treasury Operations Assistant", "AI-Ready Finance Operations Associate"],
    skillWords: ["Reconciliation", "Reporting", "Excel modelling", "Compliance", "Variance analysis", "Attention to detail"],
    toolWords: ["Excel + Copilot", "AI-assisted variance commentary", "Dashboard building", "Process automation", "Data validation"],
    industryWords: ["Financial reporting", "FP&A", "Accounts payable", "Audit", "Controllership"],
    roleTools: ["Excel with Copilot", "Power BI or Looker Studio", "ChatGPT", "Zapier"],
    signature: p(
      "Monthly Variance Commentary Assistant",
      "Turn a raw month-end sheet into a clean variance summary leaders can read.",
      ["Excel", "ChatGPT", "Looker Studio"],
      ["Take a sample budget vs actual dataset.", "Build pivot tables for the top five variance drivers.", "Ask AI to draft plain-language commentary, then correct every claim.", "Add a one-page visual summary.", "Write three recommended actions."],
      "A one-page variance pack with commentary and actions.",
      "Built a month-end variance pack with AI-assisted commentary to make financial results easier for non-finance teams to act on.",
      "I used AI to speed up narrative writing while I stayed accountable for every number.",
    ),
    dailyWork: [
      { before: "Hours of manual reconciliation", after: "Rule-based checks with exceptions you investigate" },
      { before: "Writing commentary from a blank page", after: "AI first drafts that you verify and sharpen" },
      { before: "Static monthly reports", after: "Live dashboards you use to advise the business" },
    ],
  },
  support: {
    titles: ["Customer Experience Associate", "Customer Support Specialist", "Client Success Associate", "Support Operations Coordinator", "Technical Support Associate", "Escalations Associate", "Knowledge Base Editor", "AI-Ready CX Associate"],
    skillWords: ["Customer handling", "Ticket management", "Empathy", "Issue resolution", "SLA awareness", "Documentation"],
    toolWords: ["AI response review", "Ticket analytics", "Knowledge base design", "Chatbot tuning", "Prompt writing"],
    industryWords: ["Customer experience", "BPO", "SaaS support", "Contact centre", "Client servicing"],
    roleTools: ["Zendesk AI", "ChatGPT", "Google Sheets", "Intercom"],
    signature: p(
      "Top 20 Answers Knowledge Base",
      "Build a knowledge base that makes AI answers accurate and support faster.",
      ["Google Docs", "ChatGPT", "Google Sheets"],
      ["List the 20 most common customer questions in your target industry.", "Write a clear, friendly answer for each.", "Ask AI to critique tone and clarity, then improve them.", "Tag each answer by topic and urgency.", "Add a review date so the content stays current."],
      "A 20-article, tagged knowledge base ready for AI-assisted support.",
      "Built a 20-article knowledge base that improved answer consistency and made AI-assisted responses more accurate.",
      "I know that good AI support starts with good human-written source content.",
    ),
    dailyWork: [
      { before: "Typing every reply from scratch", after: "Editing AI drafts for tone, accuracy and empathy" },
      { before: "Reading tickets one by one", after: "Reviewing trend summaries and fixing root causes" },
      { before: "Reactive firefighting", after: "Proactive improvements to the knowledge base" },
    ],
  },
  operations: {
    titles: ["Business Operations Associate", "Operations Coordinator", "Process Improvement Assistant", "Supply Chain Coordinator", "Project Coordinator", "Reporting Analyst Trainee", "Service Delivery Associate", "AI-Ready Operations Associate"],
    skillWords: ["Coordination", "Process improvement", "Reporting", "Documentation", "Scheduling", "Stakeholder updates"],
    toolWords: ["Workflow mapping", "No-code automation", "Dashboard reading", "AI-assisted SOP writing", "Prompt writing"],
    industryWords: ["Business operations", "Process excellence", "Supply chain", "Service delivery", "Shared services"],
    roleTools: ["Google Sheets", "ChatGPT", "Zapier or Make", "Looker Studio"],
    signature: p(
      "Process Map and Automation Pilot",
      "Map one repetitive process and remove a manual step from it.",
      ["Google Sheets", "ChatGPT", "Zapier or Make"],
      ["Pick one weekly process and list every step and handoff.", "Mark which steps are manual, repetitive and rules-based.", "Write an AI-assisted SOP for the process.", "Automate one step with a two-step no-code workflow.", "Measure the time saved over two weeks."],
      "A process map, an SOP and one working automation with a time saving.",
      "Mapped a recurring process and built a no-code automation that removed a manual step and saved time each week.",
      "I look for the one repetitive step worth automating instead of trying to change everything.",
    ),
    dailyWork: [
      { before: "Chasing status updates", after: "Automated trackers that surface exceptions" },
      { before: "Manual reporting each week", after: "Dashboards you use to recommend improvements" },
      { before: "Undocumented processes", after: "AI-assisted SOPs the whole team can follow" },
    ],
  },
  it: {
    titles: ["IT Support Associate", "Systems Administrator Trainee", "IT Operations Coordinator", "Service Desk Analyst", "Cloud Support Associate", "IT Asset Coordinator", "Automation Support Associate", "AI-Ready IT Operations Associate"],
    skillWords: ["Troubleshooting", "Ticket handling", "System administration", "Access management", "Documentation", "Incident response"],
    toolWords: ["Scripting basics", "AI-assisted troubleshooting", "Automation of routine tasks", "Log analysis", "Prompt writing"],
    industryWords: ["IT service management", "Infrastructure", "Cloud operations", "Endpoint support"],
    roleTools: ["ChatGPT", "PowerShell or Bash", "Zapier", "Jira Service Management"],
    signature: p(
      "Runbook Library with AI Troubleshooting",
      "Document the ten most common IT issues with step-by-step fixes.",
      ["Notion or Google Docs", "ChatGPT"],
      ["List the 10 issues you or your team see most often.", "Write a clear fix runbook for each.", "Use AI to suggest edge cases you may have missed, then verify them.", "Add a diagnostic checklist at the top of each runbook.", "Test one runbook with someone unfamiliar with the issue."],
      "A tested 10-issue runbook library.",
      "Created a tested runbook library with AI-assisted diagnostics to reduce repeat troubleshooting time.",
      "I use AI to broaden my diagnostic thinking, then verify every step myself.",
    ),
    dailyWork: [
      { before: "Repeating the same fixes", after: "Documented runbooks and scripted resolutions" },
      { before: "Manual access requests", after: "Automated, auditable request workflows" },
      { before: "Reading logs line by line", after: "AI-assisted log summaries you validate" },
    ],
  },
  engineering: {
    titles: ["Junior Software Engineer", "Frontend Developer", "Backend Developer", "QA Automation Engineer", "Platform Support Engineer", "Integration Developer", "Technical Support Engineer", "AI-Assisted Software Developer"],
    skillWords: ["Programming", "Debugging", "Testing", "Code review", "Version control", "API integration"],
    toolWords: ["AI pair programming", "Prompt engineering", "Automated testing", "Code review with AI", "LLM API basics"],
    industryWords: ["Software development", "Web development", "Platform engineering", "QA automation"],
    roleTools: ["GitHub Copilot", "Cursor", "ChatGPT", "Git"],
    signature: p(
      "AI-Assisted Mini App with Tests",
      "Ship a small working app built with an AI pair programmer and real tests.",
      ["Cursor or GitHub Copilot", "Git", "Vitest or Jest"],
      ["Choose a small, useful tool (tracker, converter, dashboard).", "Plan the data model and components before writing code.", "Build it with an AI assistant, reviewing every suggestion.", "Add tests for the core logic.", "Write a README explaining trade-offs you made."],
      "A deployed mini app with tests and a clear README.",
      "Shipped a tested mini application built with AI pair programming, reviewing all generated code before merge.",
      "I use AI to move faster but I still own architecture, review and correctness.",
    ),
    dailyWork: [
      { before: "Writing boilerplate by hand", after: "Reviewing and refining AI-generated scaffolding" },
      { before: "Manual test writing", after: "AI-drafted tests you extend for edge cases" },
      { before: "Slow code review cycles", after: "AI pre-review, then focused human review on design" },
    ],
  },
  product: {
    titles: ["Associate Product Manager", "Product Operations Associate", "Business Analyst", "Product Support Analyst", "Technical Program Coordinator", "Customer Insights Associate", "Growth Product Associate", "AI-Ready Product Associate"],
    skillWords: ["Requirements gathering", "User research", "Prioritization", "Roadmapping", "Stakeholder communication", "Analytics"],
    toolWords: ["AI-assisted research synthesis", "Prompt writing", "Product analytics", "Rapid prototyping", "Spec drafting with AI"],
    industryWords: ["Product management", "Product operations", "Discovery", "Agile delivery"],
    roleTools: ["ChatGPT", "Figma", "Notion AI", "Amplitude or GA4"],
    signature: p(
      "Discovery Pack for One Real Problem",
      "Run a small discovery cycle and produce a decision-ready product brief.",
      ["ChatGPT", "Google Forms", "Notion"],
      ["Pick a real annoyance in a product you use.", "Interview or survey five users about it.", "Use AI to synthesize themes, then challenge its conclusions.", "Write a one-page brief: problem, evidence, options, recommendation.", "Sketch the recommended solution."],
      "A one-page evidence-based product brief with a sketch.",
      "Ran a discovery cycle with five users and used AI-assisted synthesis to produce an evidence-based product recommendation.",
      "I use AI to synthesize research faster, but the decision rests on the evidence I gathered.",
    ),
    dailyWork: [
      { before: "Manually summarizing feedback", after: "AI-clustered themes you validate with users" },
      { before: "Long spec writing cycles", after: "AI first drafts refined with stakeholders" },
      { before: "Waiting on analytics requests", after: "Self-serve dashboards you query yourself" },
    ],
  },
  design: {
    titles: ["Junior Product Designer", "UI Designer", "Graphic Designer", "Design Operations Assistant", "UX Research Assistant", "Brand Designer", "Presentation Designer", "AI-Assisted Product Designer"],
    skillWords: ["Visual design", "Layout", "Typography", "Prototyping", "Design systems", "User empathy"],
    toolWords: ["AI image generation", "AI-assisted ideation", "Rapid prototyping", "Design system automation", "Prompt writing"],
    industryWords: ["Product design", "UX/UI", "Brand design", "Design systems"],
    roleTools: ["Figma", "Adobe Firefly", "ChatGPT", "Canva AI"],
    signature: p(
      "Redesign Case Study with AI Exploration",
      "Redesign one real screen and document your reasoning.",
      ["Figma", "ChatGPT", "Adobe Firefly"],
      ["Pick a screen with a clear usability problem.", "Write down the problems and who they affect.", "Use AI to generate several directions quickly.", "Refine one direction to a polished, consistent screen.", "Publish a before/after case study with your rationale."],
      "A before/after case study with documented reasoning.",
      "Published a redesign case study using AI-assisted exploration to test multiple directions before refining the final design.",
      "AI widens my exploration; my craft and reasoning decide the final direction.",
    ),
    dailyWork: [
      { before: "Slow manual exploration", after: "Many AI-generated directions in minutes" },
      { before: "Hand-producing every asset variant", after: "Generated variants you curate for quality" },
      { before: "Design decisions by opinion", after: "Decisions backed by research and rationale" },
    ],
  },
  data: {
    titles: ["Data Analyst", "Reporting Analyst", "Business Intelligence Associate", "Data Operations Associate", "Analytics Assistant", "Insights Associate", "Junior Data Engineer", "AI-Ready Analytics Associate"],
    skillWords: ["Data cleaning", "SQL", "Excel", "Visualization", "Statistical thinking", "Reporting"],
    toolWords: ["AI-assisted analysis", "Prompt writing", "Dashboard building", "Pipeline automation", "Data storytelling"],
    industryWords: ["Business intelligence", "Analytics", "Reporting", "Data operations"],
    roleTools: ["SQL", "Looker Studio or Power BI", "ChatGPT data analysis", "Python basics"],
    signature: p(
      "Public Dataset Insight Dashboard",
      "Turn a public dataset into a dashboard with three defensible insights.",
      ["Google Sheets or SQL", "Looker Studio", "ChatGPT"],
      ["Choose a public dataset in an industry you want to work in.", "Clean it and document every cleaning decision.", "Build a dashboard with 4-6 focused charts.", "Use AI to test alternative explanations for what you see.", "Write three insights and one recommended action."],
      "A published dashboard with a short insight write-up.",
      "Built a dashboard from a public dataset and delivered three evidence-backed insights with recommended actions.",
      "I use AI to challenge my analysis, not to produce conclusions for me.",
    ),
    dailyWork: [
      { before: "Manual data cleaning", after: "Repeatable cleaning steps you document and reuse" },
      { before: "Ad-hoc chart requests", after: "Self-serve dashboards for the team" },
      { before: "Reporting numbers", after: "Explaining what to do about them" },
    ],
  },
  legal: {
    titles: ["Legal Assistant", "Contracts Administrator", "Compliance Associate", "Paralegal", "Legal Operations Assistant", "Risk Analyst Trainee", "Policy Coordinator", "AI-Ready Legal Operations Associate"],
    skillWords: ["Contract review", "Research", "Compliance", "Drafting", "Attention to detail", "Confidentiality"],
    toolWords: ["AI-assisted document review", "Clause comparison", "Policy summarization", "Workflow automation", "Prompt writing"],
    industryWords: ["Legal operations", "Contracts", "Compliance", "Risk management"],
    roleTools: ["Claude", "Microsoft Word", "ChatGPT", "Notion"],
    signature: p(
      "Contract Clause Comparison Library",
      "Build a reference library that speeds up contract review.",
      ["Claude or ChatGPT", "Google Docs"],
      ["Collect five public template contracts of the same type.", "Identify eight clauses that always matter.", "Compare how each template handles those clauses.", "Use AI to summarize the differences, then verify each one yourself.", "Write a short reviewer checklist."],
      "A clause comparison table plus a reviewer checklist.",
      "Created a clause comparison library and reviewer checklist using AI-assisted summarization with full human verification.",
      "I use AI to accelerate reading, never to give a legal conclusion unchecked.",
    ),
    dailyWork: [
      { before: "Reading full contracts line by line", after: "AI-surfaced clauses you review in depth" },
      { before: "Manual research memos", after: "AI drafts you verify against primary sources" },
      { before: "Email-based approvals", after: "Tracked, auditable review workflows" },
    ],
  },
  procurement: {
    titles: ["Procurement Associate", "Sourcing Coordinator", "Vendor Management Assistant", "Purchasing Officer", "Supply Chain Analyst Trainee", "Contract Administration Associate", "Category Support Analyst", "AI-Ready Procurement Associate"],
    skillWords: ["Vendor management", "Negotiation", "Purchase orders", "Cost analysis", "Compliance", "Supplier communication"],
    toolWords: ["Spend analysis", "AI-assisted RFP drafting", "Supplier scorecards", "Workflow automation", "Prompt writing"],
    industryWords: ["Procurement", "Sourcing", "Supply chain", "Vendor management"],
    roleTools: ["Excel", "ChatGPT", "Google Sheets", "Zapier"],
    signature: p(
      "Supplier Scorecard and Spend Snapshot",
      "Compare suppliers objectively and show where money is going.",
      ["Excel or Sheets", "ChatGPT", "Looker Studio"],
      ["Build a sample spend dataset across five suppliers.", "Define six scoring criteria including quality and reliability.", "Score each supplier and visualize the spend split.", "Use AI to draft negotiation talking points, then sanity-check them.", "Recommend one consolidation or renegotiation action."],
      "A supplier scorecard, spend chart and one recommendation.",
      "Built a supplier scorecard and spend snapshot that supported a clear consolidation recommendation.",
      "I make sourcing decisions defensible with data, and use AI to prepare stronger negotiations.",
    ),
    dailyWork: [
      { before: "Manual PO tracking", after: "Automated status tracking with exception alerts" },
      { before: "Gut-feel supplier choices", after: "Scorecard-based, defensible decisions" },
      { before: "Slow RFP drafting", after: "AI first drafts you tailor per category" },
    ],
  },
  admin: {
    titles: ["Admin Operations Associate", "Executive Assistant", "Office Coordinator", "Data Entry and Reporting Associate", "Project Coordinator", "Business Support Associate", "Scheduling Coordinator", "AI-Ready Business Support Associate"],
    skillWords: ["Coordination", "Scheduling", "Documentation", "Communication", "Record keeping", "Multitasking"],
    toolWords: ["AI-assisted drafting", "Meeting summarization", "Workflow automation", "Excel cleanup", "Prompt writing"],
    industryWords: ["Business support", "Office operations", "Executive support", "Administration"],
    roleTools: ["ChatGPT", "Google Workspace", "Zapier", "Notion AI"],
    signature: p(
      "Weekly Work Summary Generator",
      "Turn raw task notes into a professional weekly update in minutes.",
      ["ChatGPT or Claude", "Google Docs", "Google Sheets"],
      ["Collect one week of rough task notes.", "Design a weekly update format: done, in progress, blockers, next.", "Write a reusable prompt that converts notes into that format.", "Review and correct the AI output every time.", "Share the template with one colleague and improve it."],
      "A reusable weekly update template plus one finished example.",
      "Created an AI-assisted weekly reporting template to convert raw task updates into clear summaries and action items.",
      "I turned a repetitive reporting task into a reusable template that saves time every week.",
    ),
    dailyWork: [
      { before: "Manual note-taking and formatting", after: "AI-drafted summaries you verify and send" },
      { before: "Chasing people for updates", after: "Automated reminders and shared trackers" },
      { before: "Scattered documents", after: "Organized, searchable knowledge the team reuses" },
    ],
  },
  education: {
    titles: ["Teaching Associate", "Instructional Design Assistant", "Learning and Development Coordinator", "Academic Program Coordinator", "Curriculum Support Associate", "Training Facilitator", "EdTech Support Associate", "AI-Ready Learning Designer"],
    skillWords: ["Lesson planning", "Facilitation", "Assessment design", "Curriculum support", "Feedback", "Learner engagement"],
    toolWords: ["AI lesson planning", "Assessment generation", "Content differentiation", "Prompt writing", "Learning analytics"],
    industryWords: ["Education", "Learning and development", "Instructional design", "EdTech"],
    roleTools: ["ChatGPT", "Canva AI", "Google Classroom", "Notion"],
    signature: p(
      "AI-Supported Lesson and Assessment Pack",
      "Design one lesson with differentiated materials and an assessment.",
      ["ChatGPT", "Canva AI", "Google Docs"],
      ["Pick one topic and define three learning outcomes.", "Draft the lesson plan and use AI to suggest activities.", "Create two difficulty levels of the same worksheet.", "Build an assessment with a clear rubric.", "Note how you would check AI-generated content for accuracy."],
      "A lesson plan, differentiated worksheets and a rubric.",
      "Designed an AI-supported lesson pack with differentiated materials and a rubric-based assessment.",
      "AI helps me differentiate materials faster while I keep control of accuracy and pedagogy.",
    ),
    dailyWork: [
      { before: "Building every resource manually", after: "AI drafts you adapt to your learners" },
      { before: "One-size-fits-all materials", after: "Differentiated versions for different levels" },
      { before: "Slow feedback cycles", after: "Faster, more specific feedback with AI support" },
    ],
  },
  retail: {
    titles: ["Retail Operations Associate", "Store Supervisor", "Merchandising Assistant", "Inventory Coordinator", "E-commerce Operations Associate", "Customer Experience Associate", "Category Support Assistant", "AI-Ready Retail Operations Associate"],
    skillWords: ["Customer service", "Inventory management", "Merchandising", "Team coordination", "Cash handling", "Sales targets"],
    toolWords: ["Demand pattern reading", "AI product descriptions", "Inventory dashboards", "Workflow automation", "Prompt writing"],
    industryWords: ["Retail", "E-commerce", "Merchandising", "Store operations"],
    roleTools: ["Google Sheets", "ChatGPT", "Shopify", "Canva AI"],
    signature: p(
      "Product Listing and Stock Tracker",
      "Improve a set of product listings and track stock movement.",
      ["Google Sheets", "ChatGPT", "Canva AI"],
      ["Pick 10 products and review their current descriptions.", "Rewrite them with AI for clarity and search terms.", "Build a simple stock movement tracker with reorder alerts.", "Create one promotional visual set.", "Note which listing changes you would test first."],
      "Ten improved listings plus a working stock tracker.",
      "Improved ten product listings with AI-assisted copy and built a stock tracker with reorder alerts.",
      "I connected better product content with practical inventory tracking to protect sales.",
    ),
    dailyWork: [
      { before: "Manual stock counts and notes", after: "Trackers with automatic reorder alerts" },
      { before: "Guesswork on promotions", after: "Simple data checks before deciding" },
      { before: "Writing listings one by one", after: "AI drafts you refine for brand and accuracy" },
    ],
  },
  general: {
    titles: ["Business Operations Associate", "Sales Operations Coordinator", "Customer Experience Associate", "Client Success Associate", "Admin Operations Associate", "Project Coordinator", "Reporting Analyst Trainee", "AI-Ready Business Support Associate"],
    skillWords: ["Coordination", "Reporting", "Excel", "Communication", "Process improvement", "Documentation", "Workflow support"],
    toolWords: ["AI-assisted research", "Prompt writing", "Workflow automation", "Digital productivity", "Dashboard reading", "No-code automation"],
    industryWords: ["Business operations", "Shared services", "Client servicing", "Project support"],
    roleTools: ["ChatGPT", "Google Sheets", "Zapier", "Canva AI"],
    signature: p(
      "AI Job Application Tracker",
      "Create a sheet that tracks applications, skill gaps and follow-ups.",
      ["Google Sheets", "ChatGPT", "Gmail", "Calendar"],
      ["Create columns for company, role, job link, skills required, status, deadline and next action.", "Paste job descriptions into AI and ask for the required skills.", "Compare required skills with your resume and mark the gaps.", "Add follow-up dates and interview notes.", "Review weekly and improve your application strategy."],
      "A working job application tracker you actually use.",
      "Built an AI-assisted job application tracker to compare role requirements, identify skill gaps and manage follow-up actions.",
      "I used AI to make my job search structured by comparing job descriptions against my resume and tracking next actions.",
    ),
    dailyWork: [
      { before: "Manual updates and chasing", after: "Shared trackers that update themselves" },
      { before: "Writing documents from scratch", after: "AI drafts you review and finalize" },
      { before: "Reporting what happened", after: "Suggesting what to do next" },
    ],
  },
};

/* ------------------------------------------------------- generic projects */

const genericProjects = (role: string): Project[] => [
  p(
    "Weekly Work Summary Generator",
    "Turn raw task notes into a professional weekly update.",
    ["ChatGPT or Claude", "Google Docs", "Google Sheets"],
    ["Collect one week of rough notes about your tasks or studies.", "Design a format: completed, in progress, blockers, next steps.", "Write one reusable prompt that converts notes into the format.", "Review every AI output and correct anything inaccurate.", "Repeat for three weeks so it becomes a habit."],
    "A reusable weekly update template with three real examples.",
    "Created an AI-assisted weekly reporting template to convert raw task updates into clear summaries and action items.",
    "I made my own reporting faster and clearer, which is exactly what I would do for a team.",
  ),
  p(
    "Simple Workflow Automation",
    `Build a small automation that removes one manual task in a ${role} workflow.`,
    ["Zapier, Make or n8n", "Google Sheets", "Gmail"],
    ["Pick one task you repeat every week.", "Write it as 'when X happens, do Y'.", "Build the two-step automation in a free no-code tool.", "Test it five times and fix what breaks.", "Record the minutes saved per week."],
    "A working two-step automation with a measured time saving.",
    "Built a simple no-code automation to reduce repetitive manual tracking and improve workflow consistency.",
    "I found one repetitive step, automated it, and measured the time it saved.",
  ),
];

/* ---------------------------------------------------------------- builder */

const statusFor = (n: number): ReadinessItem["status"] =>
  n >= 70 ? "Strong" : n >= 45 ? "Developing" : "Needs Work";

export function buildCounselling(
  parsed: ParsedResume,
  interest: InterestData,
  signup: SignupData,
  report: Report,
): Counselling {
  const family = getFamily(parsed.familyKey);
  const fc = (parsed.familyKey && FAMILY_COUNSEL[parsed.familyKey]) || FAMILY_COUNSEL.general;
  const targetRole = interest.chosenRole || family.recommendations[0]!.title;
  const stage = signup.careerStage || "Early Career";
  const experienced = ["Mid-Career", "Senior Professional"].includes(stage);
  const base = experienced ? 60 : stage === "Student / Fresh Graduate" ? 42 : 50;
  const seed = (parsed.skills.length * 4) % 9;
  const clamp = (n: number) => Math.max(20, Math.min(92, n));

  const readiness: ReadinessItem[] = [
    { label: "Resume Clarity", score: clamp(base + 14), recommendation: "Lead with a three-line summary that names your target role, your strongest capability and the outcome you deliver." },
    { label: "Role Alignment", score: clamp(base + 6 + seed), recommendation: `Mirror the language used in ${targetRole} job ads so a recruiter sees the fit in the first ten seconds.` },
    { label: "AI Readiness", score: clamp(base - 20 + seed), recommendation: "Your resume shows strong business skills, but not yet examples of AI tools, automation, dashboards or digital workflows. One completed mini project fixes this quickly." },
    { label: "Quantified Achievements", score: clamp(base - 10), recommendation: "Add numbers to at least five bullets: volume handled, time saved, accuracy improved or people supported." },
    { label: "Tool Visibility", score: clamp(base - 14 + seed), recommendation: `Create a short tools line naming what you genuinely use today, then add ${fc.roleTools.slice(0, 2).join(" and ")} once you have practiced them.` },
    { label: "Keyword Strength", score: clamp(base - 4), recommendation: "Use the job title and skill keywords from this report so screening systems and recruiters match you correctly." },
    { label: "Project / Portfolio Strength", score: clamp(base - 22 + seed), recommendation: "This is your biggest upside. One small, finished project instantly separates you from similar candidates." },
    { label: "Communication Impact", score: clamp(base + 10), recommendation: "Rewrite duty-style lines into result-style lines: what you did, how, and what improved." },
  ].map((r) => ({ ...r, status: statusFor(r.score) }));

  const readinessAverage = Math.round(readiness.reduce((n, r) => n + r.score, 0) / readiness.length);

  const rewrites: BulletRewrite[] = [
    {
      before: "Handled reports and coordinated with team members.",
      after: "Prepared weekly team reports using Excel and AI-assisted summaries to improve visibility on project progress and pending actions.",
      earned: false,
    },
    {
      before: `Responsible for daily ${family.label.toLowerCase()} tasks.`,
      after: `Managed daily ${family.label.toLowerCase()} workload of 30+ items per week while maintaining accuracy and agreed turnaround times.`,
      earned: false,
    },
    {
      before: "Used various tools to improve efficiency.",
      after: `Built a two-step ${fc.roleTools[2] ?? "no-code"} automation that removed a recurring manual task and saved around two hours each week.`,
      earned: true,
    },
  ];

  const targetTitles = fc.titles.slice(0, 8);
  const targetRoles: TargetRole[] = targetTitles.map((title, i) => ({
    title,
    why: i === 0
      ? `Closest match to your current profile in ${family.label.toLowerCase()} — you can apply for this today.`
      : `A realistic next step that reuses your ${family.label.toLowerCase()} experience in a slightly different setting.`,
    supports: parsed.skills.slice(i % 2, (i % 2) + 3).join(", ") || fc.skillWords.slice(0, 3).join(", "),
    gap: report.gapsAnalysis.filter((g) => g.level !== "Strong")[i % Math.max(1, report.gapsAnalysis.filter((g) => g.level !== "Strong").length)]?.category ?? "AI Tool Fluency",
    aiEdge: fc.toolWords[i % fc.toolWords.length]!,
  }));

  const matrix = [
    {
      title: "Learn First",
      note: "High impact and easy to start this week.",
      items: ["Prompt writing", "AI-assisted research", "Resume improvement with AI", "Excel cleanup and formatting"],
    },
    {
      title: "Build Next",
      note: "High impact, needs a little practice.",
      items: ["Dashboard reading", "Workflow mapping", "No-code automation", "AI-assisted presentations"],
    },
    {
      title: "Useful Add-ons",
      note: "Helpful, but not urgent.",
      items: ["Canva AI", "Notion AI", "Meeting summarization tools", "Job application tracking"],
    },
    {
      title: "Advanced Later",
      note: "Learn after the basics feel comfortable.",
      items: ["Basic SQL", "Power BI", "API concepts", "Advanced automation tools"],
    },
  ];

  const projects = [fc.signature, ...genericProjects(targetRole)]
    .filter((pr, i, all) => all.findIndex((o) => o.name === pr.name) === i)
    .slice(0, 3);


  const intro = `I have a background in ${family.label.toLowerCase()} with strengths in ${parsed.skills.slice(0, 3).join(", ").toLowerCase()}. I am now building AI-ready skills by learning how to use tools like ${fc.roleTools.slice(0, 3).join(", ")} to summarize information, improve documentation and reduce repetitive work. I am interested in ${targetRole} roles where I can combine strong communication with digital productivity.`;

  const interviewQuestions = [
    { q: "Tell me about yourself.", tip: "Use your 60-second introduction above, then stop and let them ask." },
    { q: `Why are you interested in this ${targetRole} role?`, tip: "Connect one thing you have done to one thing the role needs." },
    { q: "How have you used technology or AI to improve your work?", tip: "Use your mini project — describe the before, what you built and the result." },
    { q: "Tell me about a time you solved a problem.", tip: "One clear story with a measurable outcome beats three vague ones." },
    { q: "What skills are you currently trying to improve?", tip: "Name your Learn First skills and what you are doing about them this month." },
  ];

  const answerStructure = [
    { step: "Situation", detail: "One sentence of context — what was happening and why it mattered." },
    { step: "Action", detail: "What you personally did, in specific steps." },
    { step: "Result", detail: "The outcome, with a number where possible." },
    { step: "AI-readiness angle", detail: "How you would now do it faster or better using AI, with human review." },
  ];

  const practicePrompts = [
    `Act as an interviewer for a ${targetRole} role. Ask me one question at a time and give feedback on my answer.`,
    `Give me five behavioural interview questions for a ${targetRole} role and score my answers out of 10.`,
    `Here is my answer to "tell me about yourself". Make it 60 seconds, clearer and more specific.`,
  ];

  const keywords = [
    { title: "Job title keywords", words: targetTitles },
    { title: "Skills keywords", words: fc.skillWords },
    { title: "AI-ready keywords", words: fc.toolWords },
    { title: "Industry keywords", words: [...fc.industryWords, interest.industry || parsed.industryExposure].filter(Boolean) },
    { title: "LinkedIn profile keywords", words: [`${targetRole} | AI-ready`, "Open to work", ...fc.toolWords.slice(0, 3), ...fc.skillWords.slice(0, 2)] },
  ];

  const safety = [
    { title: "Keep confidential information out of public AI tools", detail: "Never paste customer data, salaries, contracts or internal documents into a public chatbot." },
    { title: "Always review AI output before you use it", detail: "You are accountable for the final work, not the tool. Check facts, names and numbers." },
    { title: "Only claim tools you have actually practiced", detail: "Add a tool to your resume after you have used it in a real task or project — then you can talk about it confidently." },
    { title: "Use AI to improve your thinking, not replace it", detail: "Ask it to challenge your draft, list what you missed, or explain the trade-offs." },
    { title: "Keep evidence of your own work", detail: "Save your projects, before/after examples and results. Evidence is what wins interviews." },
    { title: "Learn the basic privacy rules of your industry", detail: "Finance, healthcare, HR and legal all have specific rules. Knowing them makes you safer to hire." },
  ];

  const starterPrompts = [
    `Review my resume for a ${targetRole} role and suggest 5 specific improvements.`,
    "Compare this job description with my resume and identify the missing skills.",
    "Rewrite this resume bullet to make it more measurable and professional.",
    `Create a 30-day learning plan for me to get stronger in ${matrix[0]!.items[0]}.`,
    `Act as an interviewer for a ${targetRole} role and ask me practice questions.`,
    "Summarize this article and tell me how it relates to my target career.",
    `Help me create a simple portfolio project for a beginner in ${targetRole}.`,
    "Turn these rough notes into a professional weekly work update.",
    "Explain this AI tool to me like I am a complete beginner.",
    `Help me write a LinkedIn About section for a ${targetRole} role.`,
  ];

  const sevenDays = [
    { day: "Day 1", task: "Improve your resume summary", detail: `Write three lines that name ${targetRole}, your strongest skill and one result.` },
    { day: "Day 2", task: "Rewrite 3 resume bullets", detail: "Use the before/after format in this report and add numbers." },
    { day: "Day 3", task: "Learn 5 basic AI prompts", detail: `Practice the starter prompts for ${targetRole} until the output is genuinely useful.` },
    { day: "Day 4", task: "Apply to 3 roles", detail: `Search using the keywords: ${targetTitles.slice(0, 3).join(", ")}.` },
    { day: "Day 5", task: "Start your first mini project", detail: `Begin "${projects[0]!.name}" — finishing beats perfecting.` },
    { day: "Day 6", task: "Practice your 60-second introduction", detail: "Record it once, get AI feedback, then record it again." },
    { day: "Day 7", task: "Update resume and LinkedIn", detail: "Add only verified skills, tools you have practiced and your project." },
  ];

  const gapWhy: Record<string, string> = {
    "AI Tool Fluency": "Employers now assume a new hire can use AI safely to draft, summarize and research faster.",
    Communication: "Clear written and verbal updates reduce management overhead — teams pay for that.",
    "Data Literacy": "Decisions are made from numbers; people who can read them get included earlier.",
    "Workflow Thinking": "Anyone who can see and fix a broken process saves the company real money.",
    "Industry Knowledge": "Context makes your recommendations credible in the first 90 days.",
    "Problem Solving": "Interviewers hire evidence of ownership, not lists of responsibilities.",
    "Automation Readiness": "One working automation is the clearest proof of modern productivity.",
    "Leadership Potential": "Employers promote people who improve things without being asked.",
  };

  const grp = (name: string, useCase: string, practice: string, resume: string) => ({ name, useCase, practice, resume });
  const toolGroups = [
    {
      title: "Must Learn First",
      note: "Start here — these pay off within a week.",
      tools: [
        grp("ChatGPT", "Drafting, summarizing and research support.", "Summarize a long document into five bullets and three actions.", "Shows everyday AI fluency in any role."),
        grp("Excel / Google Sheets with AI", "Cleaning, analyzing and presenting data.", "Turn a messy sheet into a clean pivot table summary.", "Still the most requested practical skill in job ads."),
        grp("Claude", "Careful review of long documents.", "Ask it to critique your resume, or a first draft, against a job description.", "Signals thoughtful, quality-checked AI use."),
      ],
    },
    {
      title: `Useful for ${targetRole}`,
      note: "Directly relevant to the role you are targeting.",
      tools: fc.roleTools.map((name) =>
        grp(
          name,
          `Core day-to-day tool for ${family.label.toLowerCase()} work.`,
          `Complete one small real task end-to-end in ${name}.`,
          `Recognized by recruiters hiring for ${targetRole}.`,
        ),
      ),
    },
    {
      title: "Explore Later",
      note: "Come back to these once the basics feel easy.",
      tools: [
        grp("Power BI or Looker Studio", "Building shareable dashboards.", "Rebuild one report as a simple visual dashboard.", "Moves you toward analyst-level roles."),
        grp("n8n or Make", "More advanced multi-step automation.", "Chain three apps together in one workflow.", "Proves genuine automation capability."),
        grp("Basic SQL", "Querying data yourself.", "Write five queries against a public dataset.", "Unlocks data and reporting career tracks."),
      ],
    },
  ];

  const pathOutputs = [
    "Output: an improved resume, five working prompts, and one AI-assisted work sample.",
    "Output: one mini project, one simple dashboard or tracker, and one workflow map.",
    "Output: a portfolio case study, an interview pitch, updated resume bullets and a job application plan.",
  ];

  const scoreExplainers: Record<string, { how: string; raise: string }> = {
    "AI Readiness": { how: "The average of your eight skill-gap scores across AI, data, workflow and human skills.", raise: "Finish one mini project and practice five prompts weekly." },
    "Automation Exposure": { how: "How much of a typical day in your role is repetitive and rules-based.", raise: "Move toward tasks that need judgment, relationships or design." },
    "Learning Urgency": { how: "How quickly your role is changing compared with how ready you are today.", raise: "A focused 30 days on the Learn First quadrant drops this fast." },
    "Career Growth Potential": { how: "Your transferable experience plus the demand in your target roles.", raise: "Add one measurable achievement and one project to your resume." },
    "Human Skill Advantage": { how: "Your strength in communication, empathy, judgment and problem solving.", raise: "Document real stories where these skills changed an outcome." },
  };

  const bulletsNow = [
    `Coordinated ${family.label.toLowerCase()} activities end-to-end while maintaining accuracy and agreed turnaround times.`,
    "Prepared clear weekly summaries that improved visibility on progress, blockers and next actions.",
    ...report.resumeBullets.slice(0, 1),
  ];

  const bulletsEarned = projects.map((pr) => pr.bullet);

  return {
    readiness,
    readinessAverage,
    resumeAdd: [
      "A three-line summary naming your target role and strongest capability.",
      "A short tools line listing what you genuinely use today.",
      "One project section, even if the project is small.",
      "Numbers: volume, time saved, accuracy, people supported.",
      "Keywords from real job ads for your target role.",
    ],
    resumeReduce: [
      "Long lists of duties with no outcome attached.",
      "Generic phrases like 'hardworking team player'.",
      "Old, unrelated roles beyond a single line.",
      "Skills you cannot discuss for two minutes in an interview.",
    ],
    resumeMeasurable: [
      "How many items, clients, tickets or reports you handled.",
      "How much time a change saved each week.",
      "How accuracy, turnaround or satisfaction improved.",
      "How many people you supported, trained or coordinated.",
    ],
    resumeHighlight: [
      ...fc.toolWords.slice(0, 4),
      "Reviewing and quality-checking AI output",
    ],
    resumeHonesty: [
      "Only list a tool after you have completed a real task with it.",
      "Use target bullets from this report as goals to earn, not claims to make.",
      "If you are learning something, write 'currently building' — that is honest and still attractive.",
    ],
    rewrites,
    targetRoles,
    matrix,
    projects,
    intro,
    interviewQuestions,
    answerStructure,
    practicePrompts,
    keywords,
    safety,
    starterPrompts,
    sevenDays,
    dailyWork: fc.dailyWork,
    gapWhy,
    toolGroups,
    pathOutputs,
    scoreExplainers,
    bulletsNow,
    bulletsEarned,
  };
}
