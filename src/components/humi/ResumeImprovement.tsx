import { ArrowRight, Minus, Plus, Ruler, Sparkles } from "lucide-react";
import type { Counselling } from "@/lib/humi/counselling";
import type { ReportCopy } from "@/lib/humi/intake-copy";

function List({ icon: Icon, title, items }: { icon: typeof Plus; title: string; items: string[] }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-tint text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-bold">{title}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResumeImprovement({ c, copy }: { c: Counselling; copy: ReportCopy }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <List icon={Plus} title={copy.addTitle} items={c.resumeAdd} />
        <List icon={Minus} title={copy.reduceTitle} items={c.resumeReduce} />
        <List icon={Ruler} title={copy.measurableTitle} items={c.resumeMeasurable} />
        <List icon={Sparkles} title="AI-ready skills to highlight" items={c.resumeHighlight} />
      </div>

      <div className="tint-card p-5">
        <p className="font-bold">Only claim what you have practiced</p>
        <ul className="mt-3 space-y-2">
          {c.resumeHonesty.map((h) => (
            <li key={h} className="flex gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-extrabold">{copy.rewritesTitle}</p>
        {c.rewrites.map((r) => (
          <div
            key={r.before}
            className="surface-card grid gap-4 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {copy.rewriteBefore}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.before}</p>
            </div>
            <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground md:inline-flex">
              <ArrowRight className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {copy.rewriteAfter}
              </p>
              <p className="mt-1.5 text-sm font-semibold">{r.after}</p>
              {r.earned && (
                <p className="mt-2 text-xs font-semibold text-primary">
                  Use this as a target bullet to earn after completing the recommended project.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
