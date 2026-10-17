import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { CareerStage, SignupData } from "@/lib/humi/types";

const STAGES: CareerStage[] = [
  "Student / Fresh Graduate",
  "Early Career",
  "Mid-Career",
  "Career Switcher",
  "Returning to Workforce",
  "Senior Professional",
];

const field =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10";

interface Props {
  initial?: Partial<SignupData>;
  onSubmit: (data: SignupData) => void;
}

export function SignupForm({ initial, onSubmit }: Props) {
  const [data, setData] = useState<SignupData>({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    location: initial?.location ?? "",
    careerStage: initial?.careerStage ?? "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof SignupData>(k: K, v: SignupData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!data.firstName.trim()) next.firstName = "First name is required";
    if (!data.lastName.trim()) next.lastName = "Last name is required";
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) next.email = "A valid email is required";
    if (!data.consent) next.consent = "Please give consent to continue";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onSubmit({
        ...data,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 py-10"
    >
      <div className="surface-card mx-auto max-w-2xl p-6 sm:p-9">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Create Your Humi.ai Career Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us who you are so we can personalize your AI career evolution report.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">First Name *</label>
              <input
                className={field}
                value={data.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                maxLength={60}
                placeholder="Maya"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Last Name *</label>
              <input
                className={field}
                value={data.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                maxLength={60}
                placeholder="Santos"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Email Address *</label>
              <input
                className={field}
                type="email"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={120}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Phone Number</label>
              <input
                className={field}
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={30}
                placeholder="+63 900 000 0000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Current Location</label>
              <input
                className={field}
                value={data.location}
                onChange={(e) => set("location", e.target.value)}
                maxLength={80}
                placeholder="City"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Career Stage</label>
              <select
                className={field}
                value={data.careerStage}
                onChange={(e) => set("careerStage", e.target.value as CareerStage)}
              >
                <option value="">Select your stage</option>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-tint p-4 text-sm">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              I agree to share my information for the purpose of generating my Humi.ai Career
              Evolution Profile.
            </span>
          </label>
          {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Your details are used only to generate your career profile. Humi.ai provides career
            guidance, not hiring decisions.
          </p>

          <button
            type="submit"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition hover:brightness-110 sm:w-auto"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      </div>
    </motion.section>
  );
}
