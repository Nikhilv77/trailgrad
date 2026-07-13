"use client";

import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import type { OnboardingSubmission } from "@/lib/onboarding/types";

const roleOptions = [
  { id: "ai-engineer", title: "AI Engineer" },
  { id: "ml-engineer", title: "ML Engineer" },
  { id: "software-engineer", title: "Software Engineer" },
  { id: "frontend-engineer", title: "Frontend Engineer" },
  { id: "backend-engineer", title: "Backend Engineer" },
  { id: "full-stack-engineer", title: "Full Stack Engineer" },
  { id: "data-scientist", title: "Data Scientist" },
  { id: "data-analyst", title: "Data Analyst" },
  { id: "data-engineer", title: "Data Engineer" },
  { id: "product", title: "Product & strategy" },
];

const preparationTimeOptions = [
  { id: "15", title: "15 minutes" },
  { id: "30", title: "30 minutes" },
  { id: "60", title: "60 minutes" },
  { id: "flexible", title: "Flexible" },
] as const;

const intensityOptions = [
  { id: "light", title: "Light" },
  { id: "standard", title: "Standard" },
  { id: "intensive", title: "Intensive" },
] as const;

export function ReanalysisForm({
  onboarding,
}: {
  onboarding: OnboardingSubmission;
}) {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState(onboarding.targetRole);
  const [targetCompany, setTargetCompany] = useState(onboarding.targetCompany ?? "");
  const [targetJobTitle, setTargetJobTitle] = useState(onboarding.targetJobTitle ?? "");
  const [targetJobMode, setTargetJobMode] = useState(onboarding.targetJobMode);
  const [jobDescription, setJobDescription] = useState(onboarding.jobDescription ?? "");
  const [preparationTimePerDay, setPreparationTimePerDay] = useState(
    onboarding.preparationTimePerDay,
  );
  const [preparationIntensity, setPreparationIntensity] = useState(
    onboarding.preparationIntensity,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/profile/reanalysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRole,
          targetCompany,
          targetJobTitle,
          targetJobMode,
          jobDescription,
          preparationTimePerDay,
          preparationIntensity,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { analysisJobId?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to queue reanalysis.");
      }

      const params = new URLSearchParams({ updating: "1" });

      if (payload?.analysisJobId) {
        params.set("jobId", payload.analysisJobId);
      }

      router.push(`/today?${params.toString()}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to queue reanalysis.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] px-4 py-5 text-[#111827] sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(45,212,191,0.13),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(125,232,218,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(244,251,249,0.8))]"
      />
      <section className="relative mx-auto max-w-5xl">
        <Link
          href="/today"
          className="inline-flex items-center gap-2 rounded-xl border border-[#d7ebe6] bg-white/80 px-3 py-2 text-sm font-semibold text-[#4b5563] shadow-[0_10px_28px_rgba(15,118,110,0.06)] transition-colors hover:text-[#0f766e]"
        >
          <ArrowLeft className="size-4" />
          Back to Today
        </Link>

        <div className="mt-5 rounded-[30px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f8f7e]">
            Update analysis
          </p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[48px]">
            Reanalyze your target.
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#5f6f6b]">
            Keep your current resume, update the role or job description, and
            Trailgrad will create a fresh alignment-aware analysis.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6">
            <Field label="Target role">
              <select
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors focus:border-[#0f9f8d]"
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </Field>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Company">
                <input
                  value={targetCompany}
                  onChange={(event) => setTargetCompany(event.target.value)}
                  placeholder="Optional"
                  className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#93a29e] focus:border-[#0f9f8d]"
                />
              </Field>
              <Field label="Job title">
                <input
                  value={targetJobTitle}
                  onChange={(event) => setTargetJobTitle(event.target.value)}
                  placeholder="Optional"
                  className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#93a29e] focus:border-[#0f9f8d]"
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "paste",
                  title: "Use a job description",
                  description: "Best for one specific opening.",
                },
                {
                  id: "skip",
                  title: "Use selected role only",
                  description: "Best when exploring broadly.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setTargetJobMode(option.id as OnboardingSubmission["targetJobMode"])
                  }
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    targetJobMode === option.id
                      ? "border-[#0f9f8d] bg-[#effbf8]"
                      : "border-[#dcefeb] bg-white hover:border-[#a7dcd4]"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#111827]">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-[#64746f]">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>

            {targetJobMode === "paste" ? (
              <Field label="Job description" className="mt-4">
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the role requirements, responsibilities, and interview expectations."
                  className="min-h-44 w-full resize-none rounded-2xl border border-[#cfe5df] bg-white p-4 text-sm font-medium leading-6 text-[#111827] outline-none transition-colors placeholder:text-[#93a29e] focus:border-[#0f9f8d]"
                />
              </Field>
            ) : null}
          </div>

          <aside className="rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6 lg:sticky lg:top-5 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
              Prep settings
            </p>
            <div className="mt-4 space-y-4">
              <Field label="Daily time">
                <select
                  value={preparationTimePerDay}
                  onChange={(event) =>
                    setPreparationTimePerDay(
                      event.target.value as OnboardingSubmission["preparationTimePerDay"],
                    )
                  }
                  className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors focus:border-[#0f9f8d]"
                >
                  {preparationTimeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Intensity">
                <select
                  value={preparationIntensity}
                  onChange={(event) =>
                    setPreparationIntensity(
                      event.target.value as OnboardingSubmission["preparationIntensity"],
                    )
                  }
                  className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors focus:border-[#0f9f8d]"
                >
                  {intensityOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-[#f1cdbf] bg-[#fff9f6] p-3 text-sm font-medium leading-6 text-[#9a4f3a]">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f9f8d] px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,159,141,0.24)] transition-colors hover:bg-[#0d8d7d] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Queueing update
                </>
              ) : (
                <>
                  Update analysis
                  <Sparkles className="size-4" />
                </>
              )}
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
        {label}
      </span>
      {children}
    </label>
  );
}
