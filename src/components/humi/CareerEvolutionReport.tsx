import { createContext, forwardRef, useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, CircleHelp, Download } from "lucide-react";
import { toast } from "sonner";
import { exportSectionsToPdf } from "@/lib/humi/pdf-export";
import { submitLead } from "@/lib/api/leads.functions";
import {
  candidateSignup,
  candidateLogin,
  getCandidateMe,
} from "@/lib/api/candidate-auth.functions";
import { submitHelpRequest } from "@/lib/api/help-requests.functions";
import type { IntakeMethod, ParsedResume, Report, SignupData } from "@/lib/humi/types";
import { reportCopy, type ReportCopy } from "@/lib/humi/intake-copy";
import type { Counselling } from "@/lib/humi/counselling";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AIImpactMap } from "./AIImpactMap";
import { SkillGapAnalysis } from "./SkillGapAnalysis";
import { LearningPath } from "./LearningPath";
import { ToolRecommendations } from "./ToolRecommendations";
import { CareerScoreCard } from "./CareerScoreCard";
import { DownloadableCareerCard } from "./DownloadableCareerCard";
import { ResumeReadinessReview } from "./ResumeReadinessReview";
import { ResumeImprovement } from "./ResumeImprovement";
import { TargetRoles } from "./TargetRoles";
import { SkillPriorityMatrix } from "./SkillPriorityMatrix";
import { PortfolioProjects } from "./PortfolioProjects";
import { InterviewPrep } from "./InterviewPrep";
import { JobSearchKeywords } from "./JobSearchKeywords";
import { ProfessionalAIUse, StarterPrompts } from "./ProfessionalAIUse";
import { SevenDayPlan } from "./SevenDayPlan";

// Lets the shared Section wrapper open the "click for help" dialog with its
// own title as context, without threading a callback through every one of
// the ~19 call sites below.
const HelpRequestContext = createContext<(topic: string) => void>(() => {});

const Section = forwardRef<
  HTMLElement,
  { n: number; title: string; subtitle?: string; children: React.ReactNode }
>(function Section({ n, title, subtitle, children }, ref) {
  const requestHelp = useContext(HelpRequestContext);
  return (
    <motion.section
      ref={ref}
      data-section={n}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="mt-14 scroll-mt-24 break-inside-avoid"
      style={{ breakInside: "avoid" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Section {n}</p>
          <h3 className="mt-1 text-2xl font-extrabold sm:text-3xl">{title}</h3>
        </div>
        <button
          onClick={() => requestHelp(title)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <CircleHelp className="h-3.5 w-3.5" /> Click for help
        </button>
      </div>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </motion.section>
  );
});

const sectionTitles = (copy: ReportCopy) => [
  "Your Career Starting Point",
  copy.readinessTitle,
  copy.improveTitle,
  "Your Role Evolution",
  "Roles You Can Start Targeting",
  "AI Impact Map",
  "Your Skill Gap Analysis",
  "What to Learn First",
  "Skills You Should Learn Next",
  "Recommended AI Tools to Explore",
  "Mini Projects You Can Build to Prove Your AI Readiness",
  "Your 30-60-90 Day Career Learning Path",
  "Career Opportunity Score",
  "Your AI-Ready Interview Preparation",
  "Keywords to Use in Your Job Search",
  "How to Use AI Professionally",
  "Prompts You Can Use Today",
  copy.bulletsTitle,
  "Your Next 7 Days",
  "Your Career Evolution Card",
];

interface Props {
  report: Report;
  counselling: Counselling;
  parsed: ParsedResume;
  signup: SignupData;
  intakeMethod?: IntakeMethod;
  leadId: string | null;
  onRestart: () => void;
}

export function CareerEvolutionReport({
  report,
  counselling: c,
  parsed,
  signup,
  intakeMethod,
  leadId,
  onRestart,
}: Props) {
  const copy = reportCopy(intakeMethod);
  const SECTION_TITLES = sectionTitles(copy);
  const topSkills = c.matrix[0]!.items;

  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const setSectionRef = (n: number) => (el: HTMLElement | null) => {
    sectionRefs.current[n] = el;
  };

  const [activeSection, setActiveSection] = useState(1);
  const navButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const scrollToSection = (n: number) => {
    sectionRefs.current[n]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const topMost = visible[0]?.target.getAttribute("data-section");
        if (topMost) setActiveSection(Number(topMost));
      },
      { rootMargin: "-112px 0px -65% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    navButtonRefs.current[activeSection]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSection]);
  const [pdfState, setPdfState] = useState<{ generating: boolean; done: number; total: number }>({
    generating: false,
    done: 0,
    total: 0,
  });

  const [helpTopic, setHelpTopic] = useState<string | null>(null);
  const [helpForm, setHelpForm] = useState({
    firstName: signup.firstName,
    lastName: signup.lastName,
    email: signup.email,
    phone: signup.phone,
    message: "",
  });
  const [helpSubmitting, setHelpSubmitting] = useState(false);

  const submitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpTopic) return;
    setHelpSubmitting(true);
    try {
      await submitHelpRequest({
        data: {
          firstName: helpForm.firstName.trim(),
          lastName: helpForm.lastName.trim(),
          email: helpForm.email.trim(),
          phone: helpForm.phone.trim(),
          topic: helpTopic,
          message: helpForm.message.trim(),
        },
      });
      toast.success("Thanks — our team will reach out to help.");
      setHelpTopic(null);
    } catch {
      toast.error("Could not send your request. Please try again.");
    } finally {
      setHelpSubmitting(false);
    }
  };

  // Uploading, analyzing and reading the report stays open to anyone — the
  // PDF download is the one point that requires an account, so we can
  // capture a real name/email/phone for every candidate who actually wants
  // to keep their report.
  const [authState, setAuthState] = useState<"checking" | "authed" | "guest">("checking");
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authEmail, setAuthEmail] = useState(signup.email);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    getCandidateMe()
      .then((me) => setAuthState(me ? "authed" : "guest"))
      .catch(() => setAuthState("guest"));
  }, []);

  const persistReportToAccount = async () => {
    const form = new FormData();
    form.set("firstName", signup.firstName);
    form.set("lastName", signup.lastName);
    form.set("email", signup.email);
    form.set("phone", signup.phone);
    form.set("careerStage", signup.careerStage || "Not specified");
    form.set("recommendedRole", report.futureRole);
    form.set("careerInterest", report.futureRole);
    form.set("aiReadiness", String(report.aiReadiness));
    form.set("reportJson", JSON.stringify(report));
    form.set("counsellingJson", JSON.stringify(c));
    form.set("parsedJson", JSON.stringify(parsed));
    if (leadId) form.set("leadId", leadId);
    await submitLead({ data: form }).catch((err) => {
      console.error("Failed to link report to account", err);
    });
  };

  const runDownload = async () => {
    const nodes = [headerRef.current, ...Object.values(sectionRefs.current)].filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!nodes.length) return;

    setPdfState({ generating: true, done: 0, total: nodes.length });
    try {
      await exportSectionsToPdf(
        nodes,
        `Humi-Career-Report-${signup.firstName || "candidate"}.pdf`,
        (done, total) => setPdfState({ generating: true, done, total }),
      );
    } catch {
      toast.error("Could not generate the full report PDF. Please try again.");
    } finally {
      setPdfState({ generating: false, done: 0, total: 0 });
    }
  };

  const downloadFullReport = () => {
    if (pdfState.generating) return;
    if (authState !== "authed") {
      setAuthError("");
      setShowAuthGate(true);
      return;
    }
    void runDownload();
  };

  const submitAuthGate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      if (authMode === "signup") {
        await candidateSignup({ data: { email: authEmail.trim(), password: authPassword } });
      } else {
        await candidateLogin({ data: { email: authEmail.trim(), password: authPassword } });
      }
      await persistReportToAccount();
      setAuthState("authed");
      setShowAuthGate(false);
      void runDownload();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-10 pb-28">
      <div className="mx-auto max-w-6xl">
        <div ref={headerRef} className="bg-background">
          <div className="brand-badge">Your Humi.ai Career Evolution</div>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            {signup.firstName}, here's how your career can evolve with AI
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{copy.headerPlan}</p>
        </div>

        <HelpRequestContext.Provider value={setHelpTopic}>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              <Briefcase className="h-4 w-4" /> See matching jobs
            </Link>
            <button
              onClick={downloadFullReport}
              disabled={pdfState.generating}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-soft)] bg-tint px-6 py-3 text-sm font-bold text-primary transition hover:brightness-97 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {pdfState.generating
                ? `Preparing PDF… (${pdfState.done}/${pdfState.total})`
                : "Download Full Report (PDF)"}
            </button>
          </div>

          <Section n={1} title="Your Career Starting Point" ref={setSectionRef(1)}>
            <div className="surface-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {report.startingPoint}
              </p>
              <p className="mt-4 rounded-2xl bg-tint p-4 text-sm leading-relaxed">
                <span className="font-semibold text-primary">Why we selected this direction: </span>
                {copy.directionLead} {parsed.skills.slice(0, 3).join(", ").toLowerCase()} within{" "}
                {parsed.primaryFunction.toLowerCase()}, with {parsed.yearsExperience} of exposure to{" "}
                {parsed.industryExposure}. Those signals map most directly to {report.futureRole}{" "}
                work, where your existing strengths stay valuable and AI tools remove the repetitive
                parts.
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-extrabold">Current strengths</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.strengths.map((s) => (
                      <span key={s} className="pill-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-extrabold">Areas with the biggest upside</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.gaps.length ? (
                      report.gaps.map((g) => (
                        <span key={g} className="pill-tag">
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="pill-tag">Keep building depth</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section
            n={2}
            title={copy.readinessTitle}
            subtitle={copy.readinessSubtitle}
            ref={setSectionRef(2)}
          >
            <ResumeReadinessReview items={c.readiness} average={c.readinessAverage} copy={copy} />
          </Section>

          <Section
            n={3}
            title={copy.improveTitle}
            subtitle={copy.improveSubtitle}
            ref={setSectionRef(3)}
          >
            <ResumeImprovement c={c} copy={copy} />
          </Section>

          <Section n={4} title="Your Role Evolution" ref={setSectionRef(4)}>
            <div className="grid items-stretch gap-5 md:grid-cols-[1fr_auto_1fr]">
              <div className="surface-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Current profile
                </p>
                <p className="mt-2 text-xl font-extrabold">{report.currentRole}</p>
                <p className="mt-2 text-sm text-muted-foreground">{parsed.primaryFunction}</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
              <div className="tint-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Future AI-enabled role
                </p>
                <p className="mt-2 text-xl font-extrabold">{report.futureRole}</p>
                <p className="mt-2 text-sm text-muted-foreground">{report.evolutionExplanation}</p>
              </div>
            </div>
            <div className="surface-card mt-5 p-6">
              <p className="text-sm font-extrabold">What changes in your daily work</p>
              <div className="mt-4 space-y-3">
                {c.dailyWork.map((d) => (
                  <div
                    key={d.before}
                    className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
                  >
                    <p className="text-sm text-muted-foreground">{d.before}</p>
                    <ArrowRight className="hidden h-4 w-4 text-primary sm:block" />
                    <p className="text-sm font-semibold">{d.after}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section
            n={5}
            title="Roles You Can Start Targeting"
            subtitle={copy.rolesSubtitle}
            ref={setSectionRef(5)}
          >
            <TargetRoles roles={c.targetRoles} label={copy.strengthsLabel} />
          </Section>

          <Section
            n={6}
            title="AI Impact Map"
            subtitle="AI will change the task mix inside your role — your human skills become more valuable."
            ref={setSectionRef(6)}
          >
            <AIImpactMap report={report} />
          </Section>

          <Section n={7} title="Your Skill Gap Analysis" ref={setSectionRef(7)}>
            <SkillGapAnalysis gaps={report.gapsAnalysis} why={c.gapWhy} />
          </Section>

          <Section
            n={8}
            title="What to Learn First"
            subtitle="A simple priority matrix so you never have to guess where to start."
            ref={setSectionRef(8)}
          >
            <SkillPriorityMatrix matrix={c.matrix} />
          </Section>

          <Section
            n={9}
            title="Skills You Should Learn Next"
            subtitle="Start with the top five. Open the groups below only when you are ready for more."
            ref={setSectionRef(9)}
          >
            <div className="tint-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Top 5 priority skills
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...topSkills, c.matrix[1]!.items[0]!].slice(0, 5).map((s) => (
                  <span key={s} className="pill-tag">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                This is the fastest set to improve. You do not need to master everything at once.
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-5 space-y-3">
              {report.skillGroups.map((group, gi) => (
                <AccordionItem
                  key={group.title}
                  value={`g${gi}`}
                  className="surface-card border-none px-5"
                >
                  <AccordionTrigger className="py-4 text-left text-base font-extrabold hover:no-underline">
                    {group.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.skills.map((s) => (
                        <div key={s.name} className="tint-card p-5">
                          <p className="font-bold">{s.name}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{s.why}</p>
                          <p className="mt-2 text-sm">
                            <span className="font-semibold">Start with: </span>
                            <span className="text-muted-foreground">{s.beginnerAction}</span>
                          </p>
                          <p className="mt-2 text-xs font-semibold text-primary">{s.tool}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>

          <Section
            n={10}
            title="Recommended AI Tools to Explore"
            subtitle="Grouped so you know exactly which tool to open first."
            ref={setSectionRef(10)}
          >
            <ToolRecommendations groups={c.toolGroups} />
          </Section>

          <Section
            n={11}
            title="Mini Projects You Can Build to Prove Your AI Readiness"
            subtitle="This is a practical way to prove your readiness — finish one, then talk about it in interviews."
            ref={setSectionRef(11)}
          >
            <PortfolioProjects projects={c.projects} />
          </Section>

          <Section
            n={12}
            title="Your 30-60-90 Day Career Learning Path"
            subtitle="Each phase ends with something tangible you can show."
            ref={setSectionRef(12)}
          >
            <LearningPath path={report.path} outputs={c.pathOutputs} />
          </Section>

          <Section
            n={13}
            title="Career Opportunity Score"
            subtitle="Here is how each score is calculated and what raises it."
            ref={setSectionRef(13)}
          >
            <CareerScoreCard
              report={report}
              explainers={c.scoreExplainers}
              story={copy.scoreStory}
            />
          </Section>

          <Section n={14} title="Your AI-Ready Interview Preparation" ref={setSectionRef(14)}>
            <InterviewPrep c={c} />
          </Section>

          <Section
            n={15}
            title="Keywords to Use in Your Job Search"
            subtitle="Use these in job searches, applications and your LinkedIn profile."
            ref={setSectionRef(15)}
          >
            <JobSearchKeywords groups={c.keywords} />
          </Section>

          <Section
            n={16}
            title="How to Use AI Professionally"
            subtitle="Simple habits that keep your AI use safe, honest and credible."
            ref={setSectionRef(16)}
          >
            <ProfessionalAIUse items={c.safety} />
          </Section>

          <Section
            n={17}
            title="Prompts You Can Use Today"
            subtitle="Tap any prompt to copy it."
            ref={setSectionRef(17)}
          >
            <StarterPrompts prompts={c.starterPrompts} />
          </Section>

          <Section
            n={18}
            title={copy.bulletsTitle}
            subtitle="Some you can use today. Others you earn by finishing a project."
            ref={setSectionRef(18)}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-extrabold text-primary">Bullets you can use now</p>
                <div className="mt-3 space-y-3">
                  {c.bulletsNow.map((b) => (
                    <div key={b} className="surface-card p-5 text-sm font-semibold">
                      {b}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-extrabold text-primary">
                  Bullets you can earn after your projects
                </p>
                <div className="mt-3 space-y-3">
                  {c.bulletsEarned.map((b) => (
                    <div key={b} className="tint-card p-5 text-sm font-semibold">
                      {b}
                      <p className="mt-2 text-xs font-medium text-muted-foreground">
                        Use this as a target bullet to earn after completing the recommended
                        project.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section
            n={19}
            title="Your Next 7 Days"
            subtitle={`A short, personalized plan for a ${report.futureRole} track.`}
            ref={setSectionRef(19)}
          >
            <SevenDayPlan days={c.sevenDays} note={copy.sevenDayNote} />
          </Section>

          <Section n={20} title="Your Career Evolution Card">
            <DownloadableCareerCard
              report={report}
              signup={signup}
              keywords={c.keywords[0]!.words.slice(0, 3)}
              firstProject={c.projects[0]!.name}
              nextAction={c.sevenDays[0]!.task}
            />
          </Section>
        </HelpRequestContext.Provider>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6 text-center">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            <Briefcase className="h-4 w-4" /> See matching jobs
          </Link>
          <button
            onClick={downloadFullReport}
            disabled={pdfState.generating}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-soft)] bg-tint px-6 py-3 text-sm font-bold text-primary transition hover:brightness-97 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {pdfState.generating
              ? `Preparing PDF… (${pdfState.done}/${pdfState.total})`
              : "Download Full Report (PDF)"}
          </button>
          <button
            onClick={onRestart}
            className="rounded-full border border-[var(--color-border-soft)] bg-tint px-6 py-3 text-sm font-bold text-primary"
          >
            Start a new career profile
          </button>
          <p className="mx-auto mt-4 max-w-xl text-xs text-muted-foreground">
            Humi.ai provides career guidance only. It does not make hiring decisions or determine
            employment eligibility.
          </p>
        </div>
      </div>

      <Dialog open={showAuthGate} onOpenChange={setShowAuthGate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {authMode === "signup" ? "Create an account to download" : "Log in to download"}
            </DialogTitle>
          </DialogHeader>
          <p className="-mt-2 text-sm text-muted-foreground">
            We just need a quick account so you can keep this report — it takes a few seconds.
          </p>

          <form onSubmit={submitAuthGate} className="mt-2 space-y-3">
            <input
              type="email"
              required
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Email"
              autoComplete="username"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              required
              minLength={8}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Password (at least 8 characters)"
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />

            {authError && <p className="text-xs font-bold text-destructive">{authError}</p>}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {authSubmitting
                ? "Please wait…"
                : authMode === "signup"
                  ? "Create account & download"
                  : "Log in & download"}
            </button>
          </form>

          <button
            onClick={() => {
              setAuthMode((m) => (m === "signup" ? "login" : "signup"));
              setAuthError("");
            }}
            className="text-center text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            {authMode === "signup"
              ? "Already have an account? Log in"
              : "New here? Create an account"}
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={helpTopic !== null} onOpenChange={(open) => !open && setHelpTopic(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Get help with this</DialogTitle>
          </DialogHeader>
          <p className="-mt-2 text-sm text-muted-foreground">{helpTopic}</p>

          <form onSubmit={submitHelp} className="mt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={helpForm.firstName}
                onChange={(e) => setHelpForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="First name"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                required
                value={helpForm.lastName}
                onChange={(e) => setHelpForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Last name"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <input
              type="email"
              required
              value={helpForm.email}
              onChange={(e) => setHelpForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              value={helpForm.phone}
              onChange={(e) => setHelpForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone number"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={helpForm.message}
              onChange={(e) => setHelpForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Anything specific you'd like help with? (optional)"
              className="min-h-20 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={helpSubmitting}
              className="w-full rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {helpSubmitting ? "Sending…" : "Submit request"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <nav
        aria-label="Report sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className="mx-auto max-w-6xl px-4 py-2">
          <p className="truncate px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Section {activeSection} of {SECTION_TITLES.length} ·{" "}
            <span className="text-primary">{SECTION_TITLES[activeSection - 1]}</span>
          </p>
          <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
            {SECTION_TITLES.map((title, i) => {
              const n = i + 1;
              const active = n === activeSection;
              return (
                <button
                  key={n}
                  ref={(el) => {
                    navButtonRefs.current[n] = el;
                  }}
                  onClick={() => scrollToSection(n)}
                  title={title}
                  aria-label={`Jump to section ${n}: ${title}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
