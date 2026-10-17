import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Layers, Sparkles, User } from "lucide-react";
import type { ParsedResume, Recommendation, SignupData } from "@/lib/humi/types";

interface Props {
  parsed: ParsedResume;
  signup: SignupData;
  recommendations: Recommendation[];
  onContinue: () => void;
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-tint text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="text-base font-extrabold text-primary">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function ResumeSummary({ parsed, signup, recommendations, onContinue }: Props) {
  const rows = [
    ["Name", `${signup.firstName} ${signup.lastName}`],
    ["Career stage", signup.careerStage || "Not specified"],
    ["Years of experience", parsed.yearsExperience],
    ["Most recent role", parsed.recentRole],
    ["Primary function", parsed.primaryFunction],
    ["Industry exposure", parsed.industryExposure],
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-extrabold sm:text-3xl">
          Here's What Humi.ai Understood About Your Background
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A quick, encouraging read of where you stand today — nothing here is a judgement.
        </p>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <SectionCard icon={User} title="Candidate Snapshot">
            <dl className="space-y-2.5">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border pb-2 text-sm last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
              {parsed.fileName && (
                <p className="pt-1 text-xs text-muted-foreground">Source: {parsed.fileName}</p>
              )}
            </dl>
          </SectionCard>

          <SectionCard icon={Briefcase} title="Experience Summary">
            <p className="text-sm leading-relaxed text-muted-foreground">{parsed.summary}</p>
          </SectionCard>

          <SectionCard icon={Layers} title="Detected Skills">
            <div className="flex flex-wrap gap-2">
              {parsed.skills.map((s) => (
                <span key={s} className="pill-tag">{s}</span>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Recommended Career Direction">
            <div className="space-y-4">
              {recommendations.map((r) => (
                <div key={r.title} className="tint-card p-4">
                  <p className="font-bold">{r.title}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Why it fits: </span>{r.fit}</p>
                  <p className="mt-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">How AI changes it: </span>{r.aiChange}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {r.nextSkills.map((s) => (
                      <span key={s} className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-primary">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <button
          onClick={onContinue}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition hover:brightness-110 sm:w-auto"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.section>
  );
}
