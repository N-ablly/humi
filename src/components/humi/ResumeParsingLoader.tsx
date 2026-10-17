import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const DEFAULT_MESSAGES = [
  "Reading your background…",
  "Identifying your experience…",
  "Mapping your skills…",
  "Finding your best-fit roles…",
  "Preparing your Humi.ai career evolution…",
];

interface Props {
  title?: string;
  messages?: string[];
}

export function ResumeParsingLoader({
  title = "Analyzing your profile",
  messages = DEFAULT_MESSAGES,
}: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, messages.length - 1)), 700);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <section className="px-5 py-16">
      <div className="surface-card mx-auto max-w-lg p-10 text-center">
        <div className="relative mx-auto h-32 w-32">
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-orbit-fast">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-border-soft)"
              strokeWidth="2"
            />
            <circle cx="112" cy="60" r="7" fill="var(--color-primary)" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-tint text-primary">
              <FileText className="h-6 w-6" />
            </span>
          </span>
        </div>

        <h3 className="mt-8 text-xl font-extrabold">{title}</h3>
        <ul className="mt-6 space-y-3 text-left">
          {messages.map((m, i) => (
            <motion.li
              key={m}
              animate={{ opacity: i <= step ? 1 : 0.35 }}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <span className={`h-2 w-2 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
              {m}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
