import type { Counselling } from "@/lib/humi/counselling";

export function SevenDayPlan({ days, note }: { days: Counselling["sevenDays"]; note: string }) {
  return (
    <div className="surface-card p-6">
      <ol className="space-y-4">
        {days.map((d) => (
          <li
            key={d.day}
            className="flex gap-4 border-b border-border pb-4 last:border-none last:pb-0"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 text-xs font-extrabold text-primary">
              {d.day.replace("Day ", "")}
            </span>
            <div>
              <p className="font-bold">{d.task}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 rounded-2xl bg-tint p-4 text-sm font-semibold text-primary">{note}</p>
    </div>
  );
}
