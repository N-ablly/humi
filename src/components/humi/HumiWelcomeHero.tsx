import { motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Route } from "lucide-react";
import { OrbitGraphic } from "./OrbitGraphic";

const BENEFITS = [
  {
    icon: Compass,
    title: "Understand Where You Stand Today",
    body: "Get a quick summary of your current experience, skills, and career fit.",
  },
  {
    icon: Sparkles,
    title: "See How AI Changes Your Role",
    body: "Discover which tasks may be automated, assisted, or remain human-led.",
  },
  {
    icon: Route,
    title: "Get Your Learning Path",
    body: "Know what skills and tools to learn over the next 30, 60, and 90 days.",
  },
];

export function HumiWelcomeHero({
  onStart,
  onLogin,
}: {
  onStart: () => void;
  onLogin: () => void;
}) {
  return (
    <section className="relative px-5 pb-16 pt-10 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="brand-badge"
          >
            AI Career Evolution
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Discover Your <span className="text-gradient-primary">AI Career Evolution</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Upload your resume, share your LinkedIn, or just tell us about your work — and see how
            your skills, experience, and job interests can evolve in the age of AI. Get a
            personalized learning path, role recommendations, and AI tools to help you stay ahead.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex flex-col items-start gap-4"
          >
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Start My Career Profile
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="max-w-md text-sm text-muted-foreground">
              Built for job fair candidates, students, professionals, and career switchers who want
              to understand what skills will matter next.
            </p>
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Already have a report? Log in to view it
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto w-full max-w-md"
        >
          <OrbitGraphic labels={["Skills", "AI Tools", "Future Role", "Learning Path"]} />
        </motion.div>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-3">
        {BENEFITS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.08 }}
            className="surface-card p-6"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-tint text-primary">
              <b.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
