import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Link2, Mic, PenLine, Sparkles, Square, Upload, X } from "lucide-react";
import { extractResumeText } from "@/lib/api/resume.functions";
import { fetchLinkedInProfile, normalizeLinkedInUrl } from "@/lib/api/linkedin.functions";
import { useSpeechToText } from "@/lib/humi/use-speech-to-text";
import type { ResumeInput } from "@/lib/humi/types";

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10";

type Method = "resume" | "linkedin" | "type";

const METHODS: { key: Method; label: string; hint: string; icon: typeof Upload }[] = [
  { key: "resume", label: "Upload resume", hint: "PDF, DOC, DOCX or TXT", icon: Upload },
  { key: "linkedin", label: "LinkedIn profile", hint: "Paste your profile link", icon: Link2 },
  { key: "type", label: "Type or speak", hint: "Tell us about your work", icon: PenLine },
];

const MIN_NOTES_LENGTH = 20;
const MAX_NOTES = 2000;

interface Props {
  initial?: Partial<ResumeInput>;
  onSubmit: (input: ResumeInput, file?: File) => void;
}

export function ResumeUpload({ initial, onSubmit }: Props) {
  const [method, setMethod] = useState<Method>(initial?.recentRole ? "type" : "resume");
  const [fileName, setFileName] = useState<string | undefined>(initial?.fileName);
  const [file, setFile] = useState<File>();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedinUrl ?? "");
  const [usedVoice, setUsedVoice] = useState(false);
  const [data, setData] = useState<ResumeInput>({
    recentRole: initial?.recentRole ?? "",
    experienceSummary: initial?.experienceSummary ?? "",
    keySkills: initial?.keySkills ?? "",
    industries: initial?.industries ?? "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ResumeInput>(k: K, v: ResumeInput[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const speech = useSpeechToText((text) => {
    if (!text) return;
    setUsedVoice(true);
    setData((d) => {
      const joined = d.experienceSummary ? `${d.experienceSummary.trimEnd()} ${text}` : text;
      return { ...d, experienceSummary: joined.slice(0, MAX_NOTES) };
    });
  });

  const chooseMethod = (next: Method) => {
    if (speech.listening) speech.stop();
    setMethod(next);
    setError("");
  };

  const accept = (candidate?: File) => {
    if (!candidate) return;
    if (!/\.(pdf|docx?|txt)$/i.test(candidate.name)) {
      setError("Please upload a PDF, DOC, DOCX or TXT file.");
      return;
    }
    setError("");
    setFileName(candidate.name);
    setFile(candidate);
  };

  const submitResume = async () => {
    if (!file) {
      setError("Choose a resume file to continue, or try LinkedIn or Type or speak instead.");
      return;
    }
    setBusy("Reading your resume…");
    try {
      const form = new FormData();
      form.set("resume", file);
      const result = await extractResumeText({ data: form });
      if (!result.supported) {
        setError(
          "We couldn't read this file automatically. Try another file, or use Type or speak.",
        );
        return;
      }
      onSubmit({ ...data, fileName, resumeText: result.text, intakeMethod: "resume" }, file);
    } catch {
      onSubmit({ ...data, fileName, intakeMethod: "resume" }, file);
    }
  };

  const submitLinkedIn = async () => {
    const url = normalizeLinkedInUrl(linkedinUrl);
    if (!url) {
      setError("Enter your LinkedIn profile link, like linkedin.com/in/your-name.");
      return;
    }
    setBusy("Reading your LinkedIn profile…");
    const notes = data.experienceSummary.trim();
    const profile = await fetchLinkedInProfile({ data: { url } }).catch(() => null);

    if (!profile?.ok && notes.length < MIN_NOTES_LENGTH) {
      setError(
        "We couldn't read that profile — it may be private. Add a few lines about your role and experience below and we'll take it from there.",
      );
      return;
    }

    const resumeText = profile?.ok
      ? [
          `LinkedIn profile: ${url}`,
          profile.name && `Name: ${profile.name}`,
          profile.headline && `Headline: ${profile.headline}`,
          profile.summary && `Profile summary: ${profile.summary}`,
        ]
          .filter(Boolean)
          .join("\n")
      : undefined;

    onSubmit({
      ...data,
      linkedinUrl: url,
      resumeText,
      intakeMethod: "linkedin",
    });
  };

  const submitTyped = () => {
    const hasInput =
      data.recentRole.trim() ||
      data.keySkills.trim() ||
      data.experienceSummary.trim().length >= MIN_NOTES_LENGTH;
    if (!hasInput) {
      setError("Tell us a little about your current role and what you do — a few lines is enough.");
      return;
    }
    onSubmit({ ...data, intakeMethod: usedVoice ? "voice" : "typed" });
  };

  const submit = async () => {
    setError("");
    if (speech.listening) speech.stop();
    try {
      if (method === "resume") await submitResume();
      else if (method === "linkedin") await submitLinkedIn();
      else submitTyped();
    } finally {
      setBusy("");
    }
  };

  const experienceBox = (label: string, placeholder: string) => (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold">{label}</label>
        {speech.supported && (
          <button
            type="button"
            onClick={speech.listening ? speech.stop : speech.start}
            aria-pressed={speech.listening}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              speech.listening
                ? "bg-primary text-primary-foreground"
                : "border border-[var(--color-border-soft)] bg-tint text-primary hover:brightness-97"
            }`}
          >
            {speech.listening ? (
              <>
                <Square className="h-3.5 w-3.5" /> Stop
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" /> Speak instead
              </>
            )}
          </button>
        )}
      </div>
      <textarea
        className={`${field} min-h-32`}
        value={data.experienceSummary}
        onChange={(e) => set("experienceSummary", e.target.value)}
        maxLength={MAX_NOTES}
        placeholder={placeholder}
      />
      {speech.listening && (
        <p className="mt-2 text-xs font-semibold text-primary" aria-live="polite">
          Listening… {speech.interim && <span className="italic">{speech.interim}</span>}
        </p>
      )}
      {speech.error && <p className="mt-2 text-xs text-destructive">{speech.error}</p>}
    </div>
  );

  const buttonLabel = busy || (method === "resume" ? "Analyze My Resume" : "Analyze My Background");

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 py-10"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Tell Us About Your Background</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No resume handy? No problem. Upload one, share your LinkedIn profile, or simply tell us
          about your work — type it or say it out loud.
        </p>

        <div
          role="tablist"
          aria-label="How would you like to share your background?"
          className="mt-6 grid gap-2 sm:grid-cols-3"
        >
          {METHODS.map((m) => {
            const active = method === m.key;
            return (
              <button
                key={m.key}
                role="tab"
                aria-selected={active}
                onClick={() => chooseMethod(m.key)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                  active
                    ? "border-primary bg-tint"
                    : "border-[var(--color-border-soft)] bg-card hover:border-primary/50"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    active ? "bg-primary text-primary-foreground" : "bg-tint text-primary"
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {method === "resume" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              accept(e.dataTransfer.files?.[0]);
            }}
            className={`mt-5 rounded-3xl border-2 border-dashed p-8 text-center transition ${
              dragging ? "border-primary bg-tint" : "border-[var(--color-border-soft)] bg-card"
            }`}
          >
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-tint text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Ready to analyze</p>
                </div>
                <button
                  onClick={() => {
                    setFileName(undefined);
                    setFile(undefined);
                  }}
                  className="ml-2 rounded-full p-2 text-muted-foreground transition hover:bg-secondary"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-tint text-primary">
                  <Upload className="h-6 w-6" />
                </span>
                <p className="mt-4 text-sm font-semibold">Drag and drop your resume here</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX, TXT
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 rounded-full border border-[var(--color-border-soft)] bg-tint px-5 py-2.5 text-sm font-bold text-primary transition hover:brightness-97"
                >
                  Browse file
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => accept(e.target.files?.[0])}
                />
              </>
            )}
          </div>
        )}

        {method === "linkedin" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold">LinkedIn profile link</label>
              <input
                className={field}
                type="url"
                inputMode="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/your-name"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                We read only the headline and summary your profile shows publicly. If your profile
                is private, just add a few lines below.
              </p>
            </div>
            {experienceBox(
              "Anything to add? (optional)",
              "Your current role, what you do day to day, tools you use…",
            )}
          </motion.div>
        )}

        {method === "type" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Current or desired role</label>
              <input
                className={field}
                value={data.recentRole}
                onChange={(e) => set("recentRole", e.target.value)}
                maxLength={100}
                placeholder="Customer Service Representative"
              />
            </div>
            {experienceBox(
              "Tell us about your work",
              "What do you do day to day? Which tools do you use? What are you proud of? Type it, or tap Speak instead and just talk.",
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Key skills (optional)</label>
              <input
                className={field}
                value={data.keySkills}
                onChange={(e) => set("keySkills", e.target.value)}
                maxLength={300}
                placeholder="Communication, Excel, CRM, Reporting"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Industries of interest (optional)
              </label>
              <input
                className={field}
                value={data.industries}
                onChange={(e) => set("industries", e.target.value)}
                maxLength={200}
                placeholder="Banking, Technology, Retail"
              />
            </div>
          </motion.div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button
          onClick={submit}
          disabled={!!busy}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
        >
          <Sparkles className="h-4 w-4" />
          {buttonLabel}
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          Your information is used only to generate your career profile.
        </p>
      </div>
    </motion.section>
  );
}
