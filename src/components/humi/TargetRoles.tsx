import type { TargetRole } from "@/lib/humi/counselling";

export function TargetRoles({ roles, label }: { roles: TargetRole[]; label: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {roles.map((r, i) => (
        <div key={r.title} className="surface-card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-extrabold">{r.title}</p>
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 text-xs font-bold text-primary">
              {i + 1}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{r.why}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="inline font-semibold">{label}</dt>
              <dd className="inline text-muted-foreground">{r.supports}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Gap to close: </dt>
              <dd className="inline text-muted-foreground">{r.gap}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-primary">AI advantage: </dt>
              <dd className="inline text-muted-foreground">{r.aiEdge}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
