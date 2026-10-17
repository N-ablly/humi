import { motion } from "framer-motion";
import type { ReadinessItem } from "@/lib/humi/counselling";
import type { ReportCopy } from "@/lib/humi/intake-copy";

const STATUS_STYLE: Record<ReadinessItem["status"], string> = {
  "Needs Work": "border-primary/40 text-primary",
  Developing: "border-primary/30 text-primary",
  Strong: "border-primary/60 text-primary",
};

export function ResumeReadinessReview({
  items,
  average,
  copy,
}: {
  items: ReadinessItem[];
  average: number;
  copy: ReportCopy;
}) {
  return (
    <div>
      <div className="tint-card mb-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            {copy.readinessOverall}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You do not need to fix everything at once. Start with the two lowest scores below.
          </p>
        </div>
        <p className="text-3xl font-extrabold text-primary">{average}/100</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, i) => (
          <div key={item.label} className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">{copy.readinessLabel(item.label)}</p>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLE[item.status]}`}
              >
                {item.score}/100 · {item.status}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.04 }}
                className="h-full rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
