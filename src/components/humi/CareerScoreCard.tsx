import type { Report } from "@/lib/humi/types";

function ScoreRing({
  label,
  value,
  note,
  how,
  raise,
}: {
  label: string;
  value: number;
  note: string;
  how?: string;
  raise?: string;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="surface-card flex flex-col items-center p-5 text-center">
      <svg viewBox="0 0 90 90" className="h-24 w-24">
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="8" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform="rotate(-90 45 45)"
        />
        <text
          x="45"
          y="50"
          textAnchor="middle"
          className="fill-[var(--color-foreground)] text-[18px] font-bold"
        >
          {value}
        </text>
      </svg>
      <p className="mt-3 text-sm font-extrabold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      {how && (
        <p className="mt-3 text-left text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">How it is calculated: </span>
          {how}
        </p>
      )}
      {raise && (
        <p className="mt-1.5 text-left text-xs text-primary">
          <span className="font-semibold">What raises this: </span>
          {raise}
        </p>
      )}
    </div>
  );
}

export function CareerScoreCard({
  report,
  explainers,
  story = "one improved resume story",
}: {
  report: Report;
  explainers?: Record<string, { how: string; raise: string }>;
  story?: string;
}) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {report.scores.map((s) => (
          <ScoreRing
            key={s.label}
            label={s.label}
            value={s.value}
            note={s.note}
            how={explainers?.[s.label]?.how}
            raise={explainers?.[s.label]?.raise}
          />
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-tint p-5 text-sm leading-relaxed">
        Your AI readiness is developing and your career growth potential is high. This is your
        biggest upside: a focused 90 days on one tool, one project and {story} moves every score
        above.
      </p>
    </div>
  );
}
