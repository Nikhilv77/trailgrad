"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  GraduationCap,
  Gauge,
  LoaderCircle,
  Plus,
  Sparkles,
  StarPlus,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HashLoader } from "react-spinners";

import { SiteBrand } from "@/components/marketing/site-brand";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { ApplicationSubmission, TrailFocus } from "@/lib/applications/types";
import { lobsterTwo } from "@/lib/fonts";

type TimelineOptionId = "1-month" | "3-months" | "6-months" | "flexible";

const trailFocusOptions: Array<{
  description: string;
  icon: LucideIcon;
  id: TrailFocus;
  title: string;
}> = [
  {
    description: "Role-specific prep.",
    icon: BriefcaseBusiness,
    id: "job",
    title: "Job or interview",
  },
  {
    description: "Skill or portfolio goal.",
    icon: GraduationCap,
    id: "learning",
    title: "Learning goal",
  },
];

const timelineOptions: Array<{
  description: string;
  id: TimelineOptionId;
  months?: number;
  title: string;
}> = [
  {
    description: "Near-term.",
    id: "1-month",
    months: 1,
    title: "1 month",
  },
  {
    description: "Build proof.",
    id: "3-months",
    months: 3,
    title: "3 months",
  },
  {
    description: "More runway.",
    id: "6-months",
    months: 6,
    title: "6 months",
  },
  {
    description: "No date.",
    id: "flexible",
    title: "Flexible",
  },
];

const preparationTimeOptions = [
  { description: "Tiny", id: "15", title: "15 mins" },
  { description: "Steady", id: "30", title: "30 mins" },
  { description: "Deep", id: "60", title: "60 mins" },
  { description: "Flex", id: "flexible", title: "Flexible" },
] as const;

const intensityOptions = [
  { description: "Easy", id: "light", title: "Light" },
  { description: "Balanced", id: "standard", title: "Standard" },
  { description: "Push", id: "intensive", title: "Intensive" },
] as const;

const targetDetailOptionsByFocus: Record<TrailFocus, Array<{
  id: ApplicationSubmission["targetJobMode"];
  title: string;
  description: string;
}>> = {
  job: [
    {
      id: "paste",
      title: "Use a job description",
      description: "For one opening.",
    },
    {
      id: "skip",
      title: "Use my saved role",
      description: "For exploring.",
    },
  ],
  learning: [
    {
      id: "paste",
      title: "Add learning details",
      description: "For a specific goal.",
    },
    {
      id: "skip",
      title: "Use my saved role",
      description: "For broad learning.",
    },
  ],
};

interface FirstTrailFormProps {
  isFirstTrail?: boolean;
}

export function FirstTrailForm({ isFirstTrail = true }: FirstTrailFormProps) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const transitionTimerRef = useRef<number | null>(null);
  const [started, setStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [trailFocus, setTrailFocus] = useState<TrailFocus>("job");
  const [timelineOption, setTimelineOption] =
    useState<TimelineOptionId>("flexible");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [noDateYet, setNoDateYet] = useState(true);
  const [targetJobMode, setTargetJobMode] =
    useState<ApplicationSubmission["targetJobMode"]>("skip");
  const [jobDescription, setJobDescription] = useState("");
  const [preparationTimePerDay, setPreparationTimePerDay] =
    useState<ApplicationSubmission["preparationTimePerDay"]>("30");
  const [preparationIntensity, setPreparationIntensity] =
    useState<ApplicationSubmission["preparationIntensity"]>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  function startTrailSetup() {
    if (reduceMotion) {
      setStarted(true);
      return;
    }

    setTransitioning(true);

    transitionTimerRef.current = window.setTimeout(() => {
      setStarted(true);
      setTransitioning(false);
    }, 680);
  }

  function selectTrailFocus(nextFocus: TrailFocus) {
    setTrailFocus(nextFocus);

    if (nextFocus === "learning" && targetJobMode === "paste") {
      setJobDescription("");
    }
  }

  function selectTimeline(option: (typeof timelineOptions)[number]) {
    setTimelineOption(option.id);

    if (!option.months) {
      setNoDateYet(true);
      setApplicationDate("");
      return;
    }

    setNoDateYet(false);
    setApplicationDate(getDateMonthsFromNow(option.months));
  }

  async function submitTrail() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trailFocus,
          targetCompany,
          targetJobTitle,
          applicationDate: noDateYet ? undefined : applicationDate,
          noDateYet,
          targetJobMode,
          jobDescription,
          preparationTimePerDay,
          preparationIntensity,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            analysisJobId?: string;
            application?: {
              id?: string;
            };
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(toTrailErrorMessage(payload?.error));
      }

      if (!payload?.analysisJobId) {
        router.push("/today");
        router.refresh();
        return;
      }

      const params = new URLSearchParams({ jobId: payload.analysisJobId });

      if (payload.application?.id) {
        params.set("trail", payload.application.id);
      }

      router.push(`/trails/preparing?${params.toString()}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? toTrailErrorMessage(caught.message)
          : "Unable to create this trail.",
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
      <section className="relative mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <SiteBrand compact iconFrame={false} />
        </header>

        <div className="my-auto flex flex-col items-center py-8">
          <div className="mx-auto max-w-[780px] text-center">
            <h1 className={`${lobsterTwo.className} text-[48px] font-normal leading-[1.02] tracking-normal text-[#103b37] sm:text-[72px] lg:text-[86px]`}>
              {isFirstTrail ? "Create your first trail" : "Create a new trail"}
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-sm font-medium leading-6 text-[#5f6f6b] sm:text-base sm:leading-7">
              Pick a job, interview, or learning goal. Trailgrad will shape a
              focused workspace around it.
            </p>
          </div>

          {transitioning ? (
            <TrailSectionTransition />
          ) : !started ? (
            <button
              type="button"
              onClick={startTrailSetup}
              className="relative mt-8 min-h-[292px] w-full max-w-[680px] cursor-pointer overflow-hidden rounded-[26px] border border-[#c7ebe4] bg-white/84 p-5 text-center shadow-[0_26px_74px_rgba(15,118,110,0.11),0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22b8a5]/45 focus-visible:ring-offset-2"
            >
              <span className="relative flex min-h-[252px] flex-col items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(246,251,250,0.36))] px-5 py-6">
                <StarPlus className="tg-trail-star-icon size-11 text-[#0f9f8d] drop-shadow-[0_12px_22px_rgba(15,118,110,0.14)] sm:size-12" />
                <span className="mt-5 text-[24px] font-semibold leading-none tracking-normal text-[#111827] sm:text-[30px]">
                  Create your trail
                </span>
                <span className="mt-3 max-w-[500px] text-sm font-medium leading-6 text-[#64746f] sm:text-base">
                  Add the role or learning target you want Trailgrad to focus on
                  first.
                </span>
                <span className="mt-5 flex w-full max-w-[440px] items-center justify-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d9efea] to-[#c4eae3]" />
                  <Sparkles className="size-4 shrink-0 text-[#0f9f8d]" />
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d9efea] to-[#c4eae3]" />
                </span>
                <span className="tg-trail-plus-action mt-5 grid size-11 place-items-center rounded-full bg-[#0f9f8d] text-white shadow-[0_14px_30px_rgba(15,159,141,0.23)]">
                  <Plus className="size-5" />
                </span>
              </span>
            </button>
          ) : (
            <form
              className="mt-9 grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
              onSubmit={(event) => {
                event.preventDefault();
                void submitTrail();
              }}
            >
              <div className="rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6">
                <SectionLabel
                  description="Choose the trail type."
                  label="Trail focus"
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {trailFocusOptions.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      active={trailFocus === option.id}
                      description={option.description}
                      icon={option.icon}
                      title={option.title}
                      onClick={() => selectTrailFocus(option.id)}
                    />
                  ))}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label={trailFocus === "job" ? "Company" : "Topic"}>
                    <input
                      value={targetCompany}
                      onChange={(event) => setTargetCompany(event.target.value)}
                      placeholder={
                        trailFocus === "job" ? "Optional" : "Optional skill area"
                      }
                      className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#93a29e] focus:border-[#0f9f8d]"
                    />
                  </Field>
                  <Field label={trailFocus === "job" ? "Job title" : "Learning goal"}>
                    <input
                      value={targetJobTitle}
                      onChange={(event) => setTargetJobTitle(event.target.value)}
                      placeholder={
                        trailFocus === "job"
                          ? "Optional"
                          : "Example: Ship a full-stack project"
                      }
                      className="h-12 w-full rounded-xl border border-[#cfe5df] bg-white px-3 text-sm font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#93a29e] focus:border-[#0f9f8d]"
                    />
                  </Field>
                </div>

                <SectionLabel
                  className="mt-5"
                  description="Pick a runway."
                  label="Timeline"
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {timelineOptions.map((option) => (
                    <TimelineChoice
                      key={option.id}
                      active={timelineOption === option.id}
                      description={option.description}
                      title={option.title}
                      onClick={() => selectTimeline(option)}
                    />
                  ))}
                </div>

                <SectionLabel
                  className="mt-5"
                  description={
                    trailFocus === "job"
                      ? "Add exact details if you have them."
                      : "Add context if helpful."
                  }
                  label={trailFocus === "job" ? "Target details" : "Learning details"}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {targetDetailOptionsByFocus[trailFocus].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTargetJobMode(option.id)}
                      className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
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
                  <Field
                    label={
                      trailFocus === "job" ? "Job description" : "Learning context"
                    }
                    className="mt-4 block"
                  >
                    <textarea
                      value={jobDescription}
                      onChange={(event) => setJobDescription(event.target.value)}
                      placeholder={
                        trailFocus === "job"
                          ? "Paste the role requirements, responsibilities, and interview expectations."
                          : "Add the course, skill, project, or outcome you want to build toward."
                      }
                      className="min-h-36 w-full resize-none rounded-2xl border border-[#cfe5df] bg-white p-4 text-sm font-medium leading-6 text-[#111827] outline-none transition-colors placeholder:text-[#93a29e] focus:border-[#0f9f8d]"
                    />
                  </Field>
                ) : null}
              </div>

              <aside className="rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6 lg:sticky lg:top-5 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
                  Prep rhythm
                </p>
                <div className="mt-4">
                  <IconSectionLabel icon={Clock3} label="Daily time" />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {preparationTimeOptions.map((option) => (
                      <CompactChoice
                        key={option.id}
                        active={preparationTimePerDay === option.id}
                        description={option.description}
                        title={option.title}
                        onClick={() => setPreparationTimePerDay(option.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <IconSectionLabel icon={Gauge} label="Intensity" />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {intensityOptions.map((option) => (
                      <CompactChoice
                        key={option.id}
                        active={preparationIntensity === option.id}
                        description={option.description}
                        title={option.title}
                        onClick={() => setPreparationIntensity(option.id)}
                      />
                    ))}
                  </div>
                </div>

                {error ? (
                  <p className="mt-4 rounded-2xl border border-[#f1cdbf] bg-[#fff9f6] p-3 text-sm font-medium leading-6 text-[#9a4f3a]">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f9f8d] px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,159,141,0.24)] transition-colors hover:bg-[#0d8d7d] disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Preparing trail
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <p className="mt-3 flex items-start gap-2 text-xs font-medium leading-5 text-[#6b7d78]">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-[#0f9f8d]" />
                  Your workspace will open once Trailgrad finishes this trail
                  diagnosis.
                </p>
              </aside>
            </form>
          )}
        </div>
      </section>
      <style jsx global>{`
        @keyframes tg-trail-star-cue {
          0%,
          100% {
            transform: rotate(-2deg) scale3d(1, 1, 1);
          }

          45% {
            transform: rotate(6deg) scale3d(1.08, 1.08, 1);
          }
        }

        .tg-trail-star-icon {
          animation: tg-trail-star-cue 2.8s ease-in-out infinite;
          transform-origin: 50% 54%;
          will-change: transform;
        }

        @keyframes tg-trail-plus-action-cue {
          0%,
          100% {
            transform: scale3d(1, 1, 1);
          }

          45% {
            transform: scale3d(1.07, 1.07, 1);
          }
        }

        .tg-trail-plus-action {
          animation: tg-trail-plus-action-cue 2.8s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .tg-trail-star-icon,
          .tg-trail-plus-action {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function TrailSectionTransition() {
  return (
    <section className="mt-8 grid min-h-[292px] w-full max-w-[680px] place-items-center rounded-[26px] border border-[#c7ebe4] bg-white/84 p-5 shadow-[0_26px_74px_rgba(15,118,110,0.11),0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
      <HashLoader
        color="#159b89"
        loading
        size={54}
        speedMultiplier={0.9}
        cssOverride={{
          filter: "drop-shadow(0 16px 34px rgba(15, 118, 110, 0.16))",
        }}
      />
      <span className="sr-only">Opening trail setup</span>
    </section>
  );
}

function SectionLabel({
  className,
  description,
  label,
}: {
  className?: string;
  description: string;
  label: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-5 text-[#64746f]">
        {description}
      </p>
    </div>
  );
}

function IconSectionLabel({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7d78]">
      <Icon className="size-4 text-[#0f9f8d]" />
      {label}
    </p>
  );
}

function ChoiceCard({
  active,
  description,
  icon: Icon,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[104px] cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-[#0f9f8d] bg-[#effbf8]"
          : "border-[#dcefeb] bg-white hover:border-[#a7dcd4]"
      }`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${
          active ? "bg-[#0f9f8d] text-white" : "bg-[#f3f4f6] text-[#64746f]"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#111827]">
          {title}
        </span>
        <span className="mt-1 block text-sm font-medium leading-5 text-[#64746f]">
          {description}
        </span>
      </span>
    </button>
  );
}

function TimelineChoice({
  active,
  description,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[94px] cursor-pointer rounded-2xl border p-3 text-left transition-colors ${
        active
          ? "border-[#0f9f8d] bg-[#effbf8]"
          : "border-[#dcefeb] bg-white hover:border-[#a7dcd4]"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
        <CalendarDays className="size-4 text-[#0f9f8d]" />
        {title}
      </span>
      <span className="mt-2 block text-xs font-medium leading-5 text-[#64746f]">
        {description}
      </span>
    </button>
  );
}

function CompactChoice({
  active,
  description,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl border px-2 py-2 text-center transition-colors ${
        active
          ? "border-[#0f9f8d] bg-[#effbf8]"
          : "border-[#dcefeb] bg-white hover:border-[#a7dcd4]"
      }`}
    >
      <span className="block text-sm font-semibold leading-5 text-[#111827]">
        {title}
      </span>
      <span className="mt-0.5 block text-[11px] font-medium leading-4 text-[#64746f]">
        {description}
      </span>
    </button>
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
    <label className={className ?? "block"}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
        {label}
      </span>
      {children}
    </label>
  );
}

function getDateMonthsFromNow(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return date.toISOString().slice(0, 10);
}

function toTrailErrorMessage(message: string | undefined) {
  if (!message) {
    return "Unable to create this trail.";
  }

  return message
    .replaceAll("an application", "a trail")
    .replaceAll("application", "trail")
    .replaceAll("Application", "Trail");
}
