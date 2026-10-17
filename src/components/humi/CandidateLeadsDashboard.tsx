import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink } from "lucide-react";
import { getLeads } from "@/lib/api/leads.functions";

interface Props {
  adminEmail?: string;
}

const INTAKE_LABELS: Record<string, string> = {
  resume: "Resume",
  linkedin: "LinkedIn",
  typed: "Typed",
  voice: "Spoken",
};

const sourceLabel = (source: string | null) =>
  source === "event" ? "Event QR" : source && source !== "web" ? source : "Website";

export function CandidateLeadsDashboard({ adminEmail }: Props) {
  const {
    data: leads = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => getLeads(),
  });

  const [sourceFilter, setSourceFilter] = useState("all");
  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => sourceLabel(l.source)))).sort(),
    [leads],
  );
  const shown = useMemo(
    () =>
      sourceFilter === "all" ? leads : leads.filter((l) => sourceLabel(l.source) === sourceFilter),
    [leads, sourceFilter],
  );

  const exportCsv = () => {
    const head =
      "Name,Email,Phone,Stage,Source,Background shared,LinkedIn,Resume,Recommended Role,Interest,AI Readiness,Captured";
    const rows = shown.map((l) =>
      [
        `${l.firstName} ${l.lastName}`,
        l.email,
        l.phone,
        l.careerStage,
        sourceLabel(l.source),
        INTAKE_LABELS[l.intakeMethod ?? ""] ?? (l.resumeFileName ? "Resume" : "Manual entry"),
        l.linkedinUrl ?? "",
        l.resumeFileName ?? "",
        l.recommendedRole,
        l.careerInterest,
        String(l.aiReadiness),
        l.createdAt,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const url = URL.createObjectURL(new Blob([[head, ...rows].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "humi-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {adminEmail && <>Signed in as {adminEmail} · </>}
        {leads.length} candidate{leads.length === 1 ? "" : "s"} captured.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={exportCsv}
          disabled={!shown.length}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
        {sources.length > 1 && (
          <div className="ml-auto flex flex-wrap gap-2">
            {["all", ...sources].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                  sourceFilter === src
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {src === "all" ? "All sources" : src}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          Failed to load leads. Try refreshing the page.
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-tint text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {[
                "Name",
                "Contact",
                "Stage",
                "Source",
                "Background",
                "Recommended role",
                "Interest",
                "Score",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">
                  {l.firstName} {l.lastName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {l.email}
                  <br />
                  {l.phone}
                </td>
                <td className="px-4 py-3">{l.careerStage}</td>
                <td className="px-4 py-3 text-muted-foreground">{sourceLabel(l.source)}</td>
                <td className="px-4 py-3">
                  {l.resumeUrl ? (
                    <a
                      href={l.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      {l.resumeFileName ?? "Resume"} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : l.linkedinUrl ? (
                    <a
                      href={l.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      {INTAKE_LABELS[l.intakeMethod ?? ""] ?? "Manual entry"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{l.recommendedRole}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.careerInterest}</td>
                <td className="px-4 py-3 font-bold text-primary">{l.aiReadiness}</td>
              </tr>
            ))}
            {!isLoading && !leads.length && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No leads captured yet.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
