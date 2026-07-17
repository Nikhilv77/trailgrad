"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  LoaderCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useRouter } from "next/navigation";
import { type RefObject, useRef, useState } from "react";

import { SiteBrand } from "@/components/marketing/site-brand";
import {
  experienceOptions,
  intensityOptions,
  preparationTimeOptions,
  primaryGoalOptions,
  roleOptions,
  timelineOptions,
  trailIncludes,
  type PrimaryGoalId,
  type TimelineOptionId,
} from "@/components/trails/trail-form-options";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { ApplicationSubmission } from "@/lib/applications/types";
import type { OnboardingSubmission } from "@/lib/onboarding/types";

const trailSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const trailSteps = [
  {
    eyebrow: "Create your trail",
    title: "Where are you headed?",
    description: "Choose the role and level Trailgrad should personalize around.",
  },
  {
    eyebrow: "Trail details",
    title: "What are you aiming for?",
    description: "Pick the goal, timeline, and prep rhythm. Company is optional.",
  },
  {
    eyebrow: "Add context",
    title: "Anything specific?",
    description: "Add a job description or notes if you have them. You can skip this.",
  },
] as const;

interface FirstTrailFormProps {
  initialDraft?: Partial<OnboardingSubmission>;
  isFirstTrail?: boolean;
  onBack?: () => void;
  onDraftSubmit?: (draft: ApplicationSubmission) => Promise<void>;
}

export function FirstTrailForm({
  initialDraft,
  isFirstTrail = true,
  onBack,
  onDraftSubmit,
}: FirstTrailFormProps) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const actionsRef = useRef<HTMLDivElement>(null);
  const companySectionRef = useRef<HTMLLabelElement>(null);
  const experienceSectionRef = useRef<HTMLDivElement>(null);
  const intensitySectionRef = useRef<HTMLDivElement>(null);
  const weeklyTimeSectionRef = useRef<HTMLDivElement>(null);
  const isOnboardingVariant = Boolean(onDraftSubmit);
  const hasExistingDraft = hasPersistedTrailDraft(initialDraft);
  const [targetRole, setTargetRole] = useState(
    initialDraft?.targetRole || "product",
  );
  const [experienceLevel, setExperienceLevel] = useState(
    initialDraft?.experienceLevel || "junior",
  );
  const [primaryGoalId, setPrimaryGoalId] = useState<PrimaryGoalId>(
    getInitialPrimaryGoalId(initialDraft),
  );
  const [timelineOption, setTimelineOption] =
    useState<TimelineOptionId>(getInitialTimelineOption(initialDraft));
  const [trailStep, setTrailStep] = useState(0);
  const [targetCompany, setTargetCompany] = useState(
    initialDraft?.targetCompany ?? "",
  );
  const [targetJobTitle, setTargetJobTitle] = useState(
    initialDraft?.targetJobTitle ?? "",
  );
  const [applicationDate, setApplicationDate] = useState(
    initialDraft?.applicationDate || getDateMonthsFromNow(3),
  );
  const [noDateYet, setNoDateYet] = useState(
    hasExistingDraft ? (initialDraft?.noDateYet ?? false) : false,
  );
  const [jobDescription, setJobDescription] = useState(
    initialDraft?.jobDescription ?? "",
  );
  const [preparationTimePerDay, setPreparationTimePerDay] =
    useState<ApplicationSubmission["preparationTimePerDay"]>(
      initialDraft?.preparationTimePerDay ?? "30",
    );
  const [preparationIntensity, setPreparationIntensity] =
    useState<ApplicationSubmission["preparationIntensity"]>(
      initialDraft?.preparationIntensity ?? "standard",
    );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const stepMotion = reduceMotion
    ? {
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        initial: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        initial: { opacity: 0 },
        transition: { duration: 0.34, ease: "easeOut" as const },
      };

  function selectPrimaryGoal(option: (typeof primaryGoalOptions)[number]) {
    setPrimaryGoalId(option.id);
    setTargetJobTitle(option.title);
    scrollToMobile(companySectionRef);
  }

  function selectTimeline(option: (typeof timelineOptions)[number]) {
    setTimelineOption(option.id);

    if (!option.months) {
      setNoDateYet(true);
      setApplicationDate("");
      scrollToMobile(weeklyTimeSectionRef);
      return;
    }

    setNoDateYet(false);
    setApplicationDate(getDateMonthsFromNow(option.months));
    scrollToMobile(weeklyTimeSectionRef);
  }

  async function submitTrail() {
    if (submitting) {
      return;
    }

    const draft = buildDraft();
    const validationError = validateTrailDraft(draft, isOnboardingVariant);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (onDraftSubmit) {
        await onDraftSubmit(draft);
        return;
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toTrailRequestBody(draft)),
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

  function continueTrailStep() {
    const stepError = validateTrailStep(trailStep);

    if (stepError) {
      setError(stepError);
      return;
    }

    setError("");

    if (trailStep < trailSteps.length - 1) {
      setTrailStep((step) => step + 1);
      return;
    }

    void submitTrail();
  }

  function goBack() {
    if (trailStep > 0) {
      setError("");
      setTrailStep((step) => step - 1);
      return;
    }

    onBack?.();
  }

  function selectTargetRole(roleId: string) {
    setTargetRole(roleId);
    scrollToMobile(experienceSectionRef);
  }

  function selectExperience(levelId: string) {
    setExperienceLevel(levelId);
    scrollToMobile(actionsRef);
  }

  function selectPreparationTime(
    timeId: ApplicationSubmission["preparationTimePerDay"],
  ) {
    setPreparationTimePerDay(timeId);
    scrollToMobile(intensitySectionRef);
  }

  function selectPreparationIntensity(
    intensityId: ApplicationSubmission["preparationIntensity"],
  ) {
    setPreparationIntensity(intensityId);
    scrollToMobile(actionsRef);
  }

  function scrollToMobile(ref: RefObject<HTMLElement | null>) {
    if (reduceMotion || typeof window === "undefined") return;

    if (!window.matchMedia("(max-width: 767px)").matches) return;

    window.setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 120);
  }

  function validateTrailStep(step: number) {
    if (step === 0 && (!targetRole || !experienceLevel)) {
      return "Choose a target role and experience level.";
    }

    if (step === 1 && !primaryGoalId) {
      return "Choose a primary goal.";
    }

    return "";
  }

  function buildDraft(): ApplicationSubmission {
    const selectedGoal = getPrimaryGoal(primaryGoalId);
    const company = targetCompany.trim();
    const details = jobDescription.trim();

    return {
      targetRole,
      experienceLevel,
      trailFocus: selectedGoal.trailFocus,
      targetCompany: company,
      targetJobTitle: targetJobTitle || selectedGoal.title,
      applicationDate: noDateYet ? undefined : applicationDate,
      noDateYet,
      targetJobMode: details ? "paste" : "skip",
      jobDescription: details,
      preparationTimePerDay,
      preparationIntensity,
    };
  }

  return (
    <main className={`${trailSans.className} relative min-h-screen overflow-hidden bg-white text-[#111827]`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-white" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 pb-6 pt-6 sm:px-8 lg:px-10">
        <header className="flex min-h-16 items-center">
          <SiteBrand compact iconFrame={false} />
        </header>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <form
            className="w-full max-w-[1080px]"
            onSubmit={(event) => {
              event.preventDefault();
              continueTrailStep();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              <TrailStepper currentStep={trailStep} />
              <TrailStepHeader
                reduceMotion={reduceMotion}
                step={trailStep}
                isFirstTrail={isFirstTrail}
              />

              <div className="min-h-[420px] transition-[min-height] duration-500 ease-out lg:min-h-[455px]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`trail-step-${trailStep}`}
                    {...stepMotion}
                    className="min-w-0"
                  >
                  {trailStep === 0 ? (
                    <div className="mt-8 space-y-7">
                      <OptionSection
                        options={roleOptions}
                        selectedId={targetRole}
                        onSelect={selectTargetRole}
                      />
                      <div ref={experienceSectionRef}>
                        <p className="mb-3 text-sm font-bold text-[#667085]">
                          Experience level
                        </p>
                        <OptionSection
                          columns="four"
                          options={experienceOptions}
                          selectedId={experienceLevel}
                          onSelect={selectExperience}
                        />
                      </div>
                    </div>
                  ) : null}

                  {trailStep === 1 ? (
                    <div className="mt-8 space-y-6">
                      <OptionSection
                        options={primaryGoalOptions}
                        selectedId={primaryGoalId}
                        onSelect={(id) => {
                          const option = getPrimaryGoal(id as PrimaryGoalId);
                          selectPrimaryGoal(option);
                        }}
                      />
                      <label ref={companySectionRef} className="block">
                        <span className="mb-2 block text-sm font-bold text-[#667085]">
                          Company you&apos;re targeting{" "}
                          <span className="font-medium">(optional)</span>
                        </span>
                        <input
                          value={targetCompany}
                          onChange={(event) => setTargetCompany(event.target.value)}
                          placeholder="Company name"
                          className="h-14 w-full rounded-[12px] border border-[#dfe8ed] bg-white px-4 text-[15px] font-semibold text-[#0f172a] outline-none transition-all placeholder:text-[14px] placeholder:text-[#a5b0bf] focus:border-[#0f9f8d] focus:shadow-none focus:ring-0"
                        />
                      </label>
                      <div className="space-y-5">
                        <CompactOptionGroup
                          label="Timeline"
                          options={timelineOptions}
                          selectedId={timelineOption}
                          columns="four"
                          onSelect={(id) =>
                            selectTimeline(getTimeline(id as TimelineOptionId))
                          }
                        />
                        <div ref={weeklyTimeSectionRef}>
                          <CompactOptionGroup
                            label="Weekly time"
                            options={preparationTimeOptions}
                            selectedId={preparationTimePerDay}
                            columns="four"
                            onSelect={(id) =>
                              selectPreparationTime(
                                id as ApplicationSubmission["preparationTimePerDay"],
                              )
                            }
                          />
                        </div>
                        <div ref={intensitySectionRef}>
                          <CompactOptionGroup
                            label="Intensity"
                            options={intensityOptions}
                            selectedId={preparationIntensity}
                            columns="three"
                            onSelect={(id) =>
                              selectPreparationIntensity(
                                id as ApplicationSubmission["preparationIntensity"],
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {trailStep === 2 ? (
                    <div className="mt-8 space-y-6">
                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#667085]">
                          <FileText className="size-4 text-[#0f9f8d]" />
                          Job description or notes{" "}
                          <span className="font-medium">(optional)</span>
                        </span>
                        <textarea
                          value={jobDescription}
                          onChange={(event) => setJobDescription(event.target.value)}
                          placeholder="Paste a job description, interview brief, or any context you want Trailgrad to use."
                          className="min-h-[180px] w-full resize-none rounded-[14px] border border-[#dfe8ed] bg-white px-4 py-4 text-base font-medium leading-7 text-[#0f172a] outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#0f9f8d] focus:shadow-none focus:ring-0"
                        />
                      </label>

                      <div className="rounded-[14px] border border-[#dcefeb] bg-[#fbfefd] px-5 py-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-[#0f9f8d]">
                            <Sparkles className="size-4" />
                            Your trail will include
                          </div>
                          <div className="grid gap-x-7 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                            {trailIncludes.map((item) => (
                              <span
                                key={item}
                                className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-[#586575]"
                              >
                                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4f8f4] text-[#0f9f8d]">
                                  <Check className="size-3" />
                                </span>
                                <span className="truncate">{item}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-[14px] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#b42318]"
                >
                  {error}
                </motion.p>
              ) : null}

              <div
                ref={actionsRef}
                className="sticky bottom-0 z-20 -mx-5 mt-6 border-t border-[#e7eef2] bg-white/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:mt-7 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0"
              >
                <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {onBack ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#64748b] transition-all duration-200 hover:-translate-x-0.5 hover:text-[#0f172a] sm:justify-start"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#0f9f8d] px-6 text-sm font-bold text-white shadow-[0_16px_30px_rgba(15,159,141,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0d8d7d] disabled:cursor-not-allowed disabled:opacity-70 sm:h-11 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      {trailStep < trailSteps.length - 1
                        ? "Saving"
                        : onDraftSubmit
                          ? "Saving trail"
                          : "Preparing trail"}
                    </>
                  ) : (
                    <>
                      {trailStep < trailSteps.length - 1
                        ? "Continue"
                        : onDraftSubmit
                          ? "Continue to resume"
                          : "Create trail"}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </section>
    </main>
  );
}

function TrailStepper({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep + 1) / trailSteps.length) * 100;
  return (
    <div className="mx-auto mb-10 max-w-[620px]">
      <div className="flex items-center justify-center gap-1.5" aria-label="Trail setup progress">
        {trailSteps.map((step, index) => {
          const active = index <= currentStep;

          return (
            <span
              key={step.title}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                active ? "w-7 bg-[#159b89]" : "w-1.5 bg-[#d7dde5]"
              }`}
            />
          );
        })}
      </div>
      <div className="relative mx-auto mt-5 h-1 max-w-[520px] overflow-hidden rounded-full bg-[#eef2f7]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0f8f7e] via-[#22ab97] to-[#76d9c5]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function TrailStepHeader({
  isFirstTrail,
  reduceMotion,
  step,
}: {
  isFirstTrail: boolean;
  reduceMotion: boolean;
  step: number;
}) {
  const content = trailSteps[step] ?? trailSteps[0];
  const words = content.title.split(" ");

  return (
    <header className="mx-auto max-w-[720px] text-center">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0f9f8d]">
        {isFirstTrail ? content.eyebrow : "Create a new trail"}
      </p>
      <h1
        aria-label={content.title}
        className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.04em] text-[#0f172a] sm:text-[44px]"
      >
        {reduceMotion
          ? content.title
          : words.map((word, index) => (
              <motion.span
                key={`${content.title}-${word}-${index}`}
                aria-hidden="true"
                className={`inline-block ${
                  index < words.length - 1 ? "mr-[0.22em]" : ""
                }`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.48,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08 + index * 0.07,
                }}
              >
                {word}
              </motion.span>
            ))}
      </h1>
      <motion.p
        key={`${content.title}-description`}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
        className="mx-auto mt-4 max-w-[560px] text-[15px] font-medium leading-7 text-[#667085]"
      >
        {content.description}
      </motion.p>
    </header>
  );
}

function OptionSection<T extends string>({
  columns = "three",
  onSelect,
  options,
  selectedId,
  tone = "teal",
}: {
  columns?: "four" | "three";
  onSelect: (id: T) => void;
  options: ReadonlyArray<{
    description: string;
    icon: LucideIcon;
    id: T;
    title: string;
  }>;
  selectedId: T;
  tone?: "purple" | "teal";
}) {
  return (
    <div
      className={`grid gap-3 ${
        columns === "four"
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {options.map((option) => (
        <OptionCard
          key={option.id}
          active={option.id === selectedId}
          option={option}
          tone={tone}
          onClick={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  option,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  option: {
    description: string;
    icon: LucideIcon;
    title: string;
  };
  tone: "purple" | "teal";
}) {
  const Icon = option.icon;
  const activeClasses =
    tone === "purple"
      ? "border-[#a98ff0] bg-[#fbf8ff]"
      : "border-[#20b8a4] bg-[#f2fffb]";
  const iconClasses =
    tone === "purple"
      ? active
        ? "bg-[#8b5cf6] text-white"
        : "bg-[#f2ebff] text-[#7c4dde]"
      : active
        ? "bg-[#0f9f8d] text-white"
        : "bg-[#e8fbf6] text-[#0f9f8d]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[92px] cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9fd8d0] ${
        active ? activeClasses : "border-[#e1e8ed] bg-white"
      }`}
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${iconClasses}`}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate whitespace-nowrap text-sm font-bold text-[#0f172a]">
          {option.title}
        </span>
        <span className="mt-1 block truncate whitespace-nowrap text-sm font-medium leading-5 text-[#7b8898]">
          {option.description}
        </span>
      </span>
      {active ? (
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#0f9f8d] text-white">
          <Check className="size-3.5" />
        </span>
      ) : null}
    </button>
  );
}

function CompactOptionGroup<T extends string>({
  columns,
  label,
  onSelect,
  options,
  selectedId,
  tone = "teal",
}: {
  columns: "four" | "three";
  label: string;
  onSelect: (id: T) => void;
  options: ReadonlyArray<{
    description: string;
    id: T;
    title: string;
  }>;
  selectedId: T;
  tone?: "purple" | "teal";
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold text-[#667085]">
        {label}
      </div>
      <div
        className={`grid gap-3 ${
          columns === "four"
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-3"
        }`}
      >
        {options.map((option) => (
          <CompactOptionCard
            key={option.id}
            active={option.id === selectedId}
            option={option}
            tone={tone}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CompactOptionCard({
  active,
  onClick,
  option,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  option: {
    description: string;
    title: string;
  };
  tone: "purple" | "teal";
}) {
  const activeClasses =
    tone === "purple"
      ? "border-[#a98ff0] bg-[#fbf8ff]"
      : "border-[#20b8a4] bg-[#f2fffb]";
  const activeDot =
    tone === "purple" ? "bg-[#8b5cf6] text-white" : "bg-[#0f9f8d] text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[66px] cursor-pointer items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9fd8d0] ${
        active ? activeClasses : "border-[#e1e8ed] bg-white"
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate whitespace-nowrap text-sm font-bold text-[#0f172a]">
          {option.title}
        </span>
        <span className="mt-0.5 block truncate whitespace-nowrap text-xs font-semibold text-[#7b8898]">
          {option.description}
        </span>
      </span>
      {active ? (
        <span className={`grid size-5 shrink-0 place-items-center rounded-full ${activeDot}`}>
          <Check className="size-3.5" />
        </span>
      ) : (
        <span className="size-5 shrink-0 rounded-full border border-[#cfe1df]" />
      )}
    </button>
  );
}

function getDateMonthsFromNow(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return date.toISOString().slice(0, 10);
}

function getInitialPrimaryGoalId(
  draft: Partial<OnboardingSubmission> | undefined,
): PrimaryGoalId {
  const matchedGoal = primaryGoalOptions.find(
    (option) =>
      option.title === draft?.targetJobTitle ||
      option.trailFocus === draft?.trailFocus,
  );

  return matchedGoal?.id ?? "product-companies";
}

function getInitialTimelineOption(
  draft: Partial<OnboardingSubmission> | undefined,
): TimelineOptionId {
  if (draft?.noDateYet !== false || !draft.applicationDate) {
    return hasPersistedTrailDraft(draft) ? "flexible" : "3-months";
  }

  const targetDate = new Date(`${draft.applicationDate}T00:00:00.000Z`);
  const now = new Date();
  const days = Math.ceil(
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days <= 45) return "1-month";
  if (days <= 135) return "3-months";
  return "6-months";
}

function hasPersistedTrailDraft(draft: Partial<OnboardingSubmission> | undefined) {
  return Boolean(
    draft?.targetRole ||
      draft?.experienceLevel ||
      draft?.targetCompany ||
      draft?.targetJobTitle ||
      draft?.applicationDate,
  );
}

function getPrimaryGoal(id: PrimaryGoalId) {
  return (
    primaryGoalOptions.find((option) => option.id === id) ??
    primaryGoalOptions[0]
  );
}

function getTimeline(id: TimelineOptionId) {
  return (
    timelineOptions.find((option) => option.id === id) ?? timelineOptions[3]
  );
}

function toTrailRequestBody(draft: ApplicationSubmission) {
  return {
    trailFocus: draft.trailFocus,
    targetCompany: draft.targetCompany,
    targetJobTitle: draft.targetJobTitle,
    applicationDate: draft.noDateYet ? undefined : draft.applicationDate,
    noDateYet: draft.noDateYet,
    targetJobMode: draft.targetJobMode,
    jobDescription: draft.jobDescription,
    preparationTimePerDay: draft.preparationTimePerDay,
    preparationIntensity: draft.preparationIntensity,
  };
}

function validateTrailDraft(
  draft: ApplicationSubmission,
  requireProfileDefaults: boolean,
) {
  if (requireProfileDefaults && (!draft.targetRole || !draft.experienceLevel)) {
    return "Choose a target role and experience level.";
  }

  if (!draft.noDateYet && !draft.applicationDate) {
    return "Choose a date or select that you do not have one yet.";
  }

  if (draft.targetJobMode === "paste" && !draft.jobDescription?.trim()) {
    return draft.trailFocus === "learning"
      ? "Add learning details or choose to skip details."
      : "Add a job description or choose to skip details.";
  }

  return "";
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
