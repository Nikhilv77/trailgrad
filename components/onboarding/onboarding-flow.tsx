"use client";

import { type ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChartColumn,
  Check,
  Code2,
  Database,
  FileCheck2,
  FileWarning,
  FileUp,
  GraduationCap,
  Layers3,
  LoaderCircle,
  MonitorSmartphone,
  PencilLine,
  Rocket,
  ServerCog,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { lobsterTwo } from "@/lib/fonts";
import type {
  OnboardingState,
  OnboardingStepId,
  OnboardingSubmission,
} from "@/lib/onboarding/types";

interface OnboardingFlowProps {
  initialState?: OnboardingState;
}

interface ResumeUploadIssue {
  code?: string;
  message: string;
  title: string;
}

interface ResumeInspectionStep {
  title: string;
  description: string;
}

interface Option {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  optional?: boolean;
}

interface StepOptionsProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  footer?: ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: "target-role",
    title: "Where are you headed?",
    description: "Choose the default role and level Trailgrad should use for trails.",
  },
  {
    id: "resume",
    title: "Start with your resume.",
    description: "Trailgrad needs one private resume before you create trails.",
  },
  {
    id: "review",
    title: "Your Trailgrad trail is ready.",
    description: "Your basics are saved. When you are ready, create your first trail and Trailgrad will focus on that exact opportunity.",
  },
];

const roleOptions: Option[] = [
  { id: "ai-engineer", title: "AI Engineer", description: "LLM apps, agents, evals", icon: Sparkles, badge: "Popular" },
  { id: "ml-engineer", title: "ML Engineer", description: "Models, pipelines, deployment", icon: BrainCircuit },
  { id: "software-engineer", title: "Software Engineer", description: "General product engineering", icon: Code2 },
  { id: "frontend-engineer", title: "Frontend Engineer", description: "React, UI, product polish", icon: MonitorSmartphone },
  { id: "backend-engineer", title: "Backend Engineer", description: "APIs, systems, databases", icon: ServerCog },
  { id: "full-stack-engineer", title: "Full Stack Engineer", description: "Frontend plus backend ownership", icon: BrainCircuit },
  { id: "data-scientist", title: "Data Scientist", description: "Analysis, modeling, experiments", icon: Layers3 },
  { id: "data-analyst", title: "Data Analyst", description: "SQL, dashboards, insights", icon: ChartColumn },
  { id: "data-engineer", title: "Data Engineer", description: "Pipelines, warehouses, quality", icon: Database },
  { id: "product", title: "Product & strategy", description: "PM, strategy, execution", icon: BriefcaseBusiness },
];

const experienceOptions: Option[] = [
  { id: "student-new-graduate", title: "Student or new graduate", description: "Coursework, internships, projects", icon: GraduationCap },
  { id: "junior", title: "Junior", description: "0-2 years or early career", icon: Rocket, badge: "Common" },
  { id: "mid-level", title: "Mid-level", description: "Independent feature ownership", icon: BriefcaseBusiness },
  { id: "senior", title: "Senior", description: "Architecture and leadership", icon: BrainCircuit },
];

const resumeInspectionSteps: ResumeInspectionStep[] = [
  {
    title: "Reading your file",
    description: "Checking format, size, and whether the PDF has selectable text.",
  },
  {
    title: "Extracting resume text",
    description: "Pulling out the content Trailgrad can safely analyze.",
  },
  {
    title: "Checking resume structure",
    description: "Looking for sections, roles, dates, skills, and candidate signals.",
  },
  {
    title: "Filtering non-resume docs",
    description: "Screening out product docs, notes, proposals, and long reports.",
  },
  {
    title: "Preparing your trail",
    description: "Saving the validated resume for future trails.",
  },
];

export function OnboardingFlow({ initialState }: OnboardingFlowProps) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const [currentStep, setCurrentStep] = useState(() =>
    getStepIndex(initialState?.currentStep),
  );
  const [direction, setDirection] = useState(1);
  const [targetRole, setTargetRole] = useState(
    initialState?.onboarding?.targetRole ?? "",
  );
  const [experienceLevel, setExperienceLevel] = useState(
    initialState?.onboarding?.experienceLevel ?? "",
  );
  const [showAllRoles, setShowAllRoles] = useState(() =>
    Boolean(
      initialState?.onboarding?.targetRole &&
        !roleOptions
          .slice(0, 4)
          .some((option) => option.id === initialState.onboarding?.targetRole),
    ),
  );
  const [resumeName, setResumeName] = useState(
    initialState?.onboarding?.resumeName ?? "",
  );
  const [resumeContentType, setResumeContentType] = useState(
    initialState?.onboarding?.resumeContentType ?? "",
  );
  const [resumeSize, setResumeSize] = useState(
    initialState?.onboarding?.resumeSize ?? 0,
  );
  const [resumeUploadedAt, setResumeUploadedAt] = useState(
    initialState?.onboarding?.resumeUploadedAt ?? "",
  );
  const [savingStep, setSavingStep] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeProcessingStatus, setResumeProcessingStatus] = useState("");
  const [resumeInspectionStep, setResumeInspectionStep] = useState(0);
  const [resumeUploadIssue, setResumeUploadIssue] =
    useState<ResumeUploadIssue | null>(null);
  const [errorMessage, setErrorMessage] = useState(
    initialState?.analysisError ?? "",
  );

  const activeStep = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const visibleRoleOptions = showAllRoles ? roleOptions : roleOptions.slice(0, 4);
  const hiddenRoleCount = roleOptions.length - visibleRoleOptions.length;
  const transition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.52, ease: [0.16, 1, 0.3, 1] };
  const slideDistance = reduceMotion ? 0 : 18;

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [currentStep, reduceMotion]);

  useEffect(() => {
    if (!uploadingResume) return;

    const timer = window.setInterval(() => {
      setResumeInspectionStep((step) =>
        Math.min(step + 1, resumeInspectionSteps.length - 1),
      );
    }, 850);

    return () => window.clearInterval(timer);
  }, [uploadingResume]);

  async function goForward() {
    if (activeStep.id === "review") {
      await completeOnboarding();
      return;
    }

    const validationError = validateStep(activeStep.id);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setSavingStep(true);
    const nextStep = Math.min(currentStep + 1, steps.length - 1);

    try {
      await saveStep(steps[nextStep].id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save onboarding progress.",
      );
      return;
    } finally {
      setSavingStep(false);
    }

    setDirection(1);
    setCurrentStep(nextStep);
  }

  async function goBack() {
    if (currentStep === 0) {
      startRouteTransition();
      window.setTimeout(() => router.push("/"), reduceMotion ? 0 : 160);
      return;
    }

    setErrorMessage("");
    setSavingStep(true);

    const previousStep = Math.max(currentStep - 1, 0);

    try {
      await saveStep(steps[previousStep].id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save onboarding progress.",
      );
      return;
    } finally {
      setSavingStep(false);
    }

    setDirection(-1);
    setCurrentStep(previousStep);
  }

  function getOnboardingDraft(): OnboardingSubmission {
    return {
      targetRole,
      experienceLevel,
      resumeName,
      ...(resumeContentType ? { resumeContentType } : {}),
      ...(resumeSize ? { resumeSize } : {}),
      ...(resumeUploadedAt ? { resumeUploadedAt } : {}),
    };
  }

  function validateStep(stepId: OnboardingStepId): string {
    if (stepId === "target-role" && (!targetRole || !experienceLevel)) {
      return "Choose a target role and experience level.";
    }

    if (stepId === "resume" && !resumeName) {
      return "Upload a PDF or DOCX resume before continuing.";
    }

    if (stepId === "review") {
      return validateStep("target-role") || validateStep("resume");
    }

    return "";
  }

  async function saveStep(nextStep: OnboardingStepId) {
    const response = await fetch("/api/profile/onboarding", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentStep: nextStep,
        onboarding: getOnboardingDraft(),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      throw new Error(payload?.error ?? "Unable to save onboarding progress.");
    }
  }

  async function uploadResume(file: File | undefined) {
    if (!file) return;

    setErrorMessage("");
    setResumeUploadIssue(null);
    setUploadingResume(true);
    setResumeInspectionStep(0);
    setResumeProcessingStatus("Uploading resume");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/profile/onboarding/resume", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            code?: string;
            fileName?: string;
            contentType?: string;
            fileSize?: number;
            processingStatus?: string;
            state?: OnboardingState;
          }
        | null;

      if (!response.ok) {
        setResumeInspectionStep(resumeInspectionSteps.length - 1);
        setResumeUploadIssue(getResumeUploadIssue(payload?.code, payload?.error));
        setResumeProcessingStatus("");
        return;
      }

      setResumeInspectionStep(resumeInspectionSteps.length - 1);
      const saved = payload?.state?.onboarding;
      setResumeName(saved?.resumeName ?? payload?.fileName ?? file.name);
      setResumeContentType(saved?.resumeContentType ?? payload?.contentType ?? file.type);
      setResumeSize(saved?.resumeSize ?? payload?.fileSize ?? file.size);
      setResumeUploadedAt(saved?.resumeUploadedAt ?? new Date().toISOString());
      setResumeProcessingStatus(
        payload?.processingStatus === "EXTRACTED"
          ? "Resume text extracted"
          : "Resume uploaded",
      );
    } catch (error) {
      setResumeUploadIssue(
        getResumeUploadIssue(
          undefined,
          error instanceof Error ? error.message : "Unable to upload resume.",
        ),
      );
      setResumeProcessingStatus("");
    } finally {
      setUploadingResume(false);
    }
  }

  async function completeOnboarding() {
    const validationError = validateStep("review");

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setCompleting(true);

    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getOnboardingDraft()),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error ?? "Unable to enter your Trailgrad workspace.");
      }

      try {
        window.sessionStorage.removeItem("trailgrad:onboarding");
      } catch {
        // A stale draft is harmless if browser storage is unavailable.
      }

      startRouteTransition();
      window.setTimeout(
        () => router.replace("/onboarding/analyzing"),
        reduceMotion ? 0 : 450,
      );
    } catch (error) {
      setCompleting(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to enter your Trailgrad workspace.",
      );
    }
  }

  function startRouteTransition() {
    if (!reduceMotion) {
      window.dispatchEvent(new Event("trailgrad:route-transition-start"));
    }
  }

  const canContinue = !completing && !savingStep && !uploadingResume;
  const primaryLabel = completing
    ? "Creating workspace"
    : savingStep
      ? "Saving"
      : activeStep.id === "review"
        ? "Create your workspace"
        : "Continue";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] text-[#111827]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#f6fcfa]" />
        <div className="tg-onboarding-teal-clouds absolute inset-[-18%]" />
        <div className="tg-onboarding-cloud-haze absolute inset-[-12%]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.2)_46%,rgba(255,255,255,0.5))]" />
        <div className="tg-grid absolute inset-0 opacity-[0.045]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-5 pb-6 pt-7 sm:px-8 lg:px-10">
        <header className="flex h-[52px] items-center justify-between">
          <OnboardingBrand />
        </header>

        <div className="flex flex-1 items-center justify-center py-7 sm:py-10">
          <div className="w-full max-w-[840px]">
            <motion.article className="relative overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_34px_110px_rgba(15,118,110,0.16),0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-7 lg:p-9">
              <div className="relative flex items-center justify-center">
                <ProgressDots currentStep={currentStep} totalSteps={steps.length} />
              </div>

              <div className="relative mx-auto mt-5 h-1 max-w-[520px] overflow-hidden rounded-full bg-[#e7f2ef]/80 shadow-[inset_0_1px_2px_rgba(18,83,75,0.04)]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#0f8f7e] via-[#22ab97] to-[#76d9c5]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={transition}
                />
              </div>

              <StepViewport
                busy={savingStep || completing}
                direction={direction}
                slideDistance={slideDistance}
                stepKey={activeStep.id}
                transition={transition}
              >
                <StepHeading step={activeStep} reduceMotion={reduceMotion} />

                {activeStep.id === "target-role" ? (
                  <TargetRoleStep
                    experienceLevel={experienceLevel}
                    hiddenRoleCount={hiddenRoleCount}
                    onExperienceChange={setExperienceLevel}
                    onRoleChange={setTargetRole}
                    onShowAllRoles={() => setShowAllRoles(true)}
                    role={targetRole}
                    showAllRoles={showAllRoles}
                    visibleRoleOptions={visibleRoleOptions}
                  />
                ) : null}

                {activeStep.id === "resume" ? (
                  <ResumeQuestion
                    resumeName={resumeName}
                    resumeSize={resumeSize}
                    processingStatus={resumeProcessingStatus}
                    inspectionStep={resumeInspectionStep}
                    uploadIssue={resumeUploadIssue}
                    uploading={uploadingResume}
                    onUpload={uploadResume}
                  />
                ) : null}

                {activeStep.id === "review" ? (
                  <ReviewStep
                    experience={getOptionTitle(experienceOptions, experienceLevel)}
                    resumeName={resumeName}
                    role={getOptionTitle(roleOptions, targetRole)}
                    onEditProfile={() => {
                      setDirection(-1);
                      setCurrentStep(0);
                    }}
                    onEditResume={() => {
                      setDirection(-1);
                      setCurrentStep(1);
                    }}
                  />
                ) : null}
              </StepViewport>

              <motion.div layout className="relative mt-6">
                {errorMessage ? (
                  <p className="mb-3 rounded-lg border border-[#f3c7b8] bg-[#fff7f3] px-3 py-2 text-sm font-medium text-[#9b4f3f]" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="ghost" onClick={goBack} disabled={!canContinue} className="h-11 justify-start rounded-lg px-3 text-[#4b5563] transition-all duration-500 hover:bg-[#edf6f3] focus-visible:!border-transparent focus-visible:!ring-0 sm:justify-center">
                    <ArrowLeft className="size-4" /> {currentStep === 0 ? "Back home" : "Back"}
                  </Button>
                  <Button
                    type="button"
                    onClick={goForward}
                    disabled={!canContinue}
                    className="h-auto min-h-11 w-full min-w-0 whitespace-normal rounded-lg bg-[#0f9f8d] px-4 py-3 text-center font-semibold leading-5 text-white shadow-[0_14px_32px_rgba(15,159,141,0.24)] transition-all duration-500 hover:bg-[#0d8d7d] hover:shadow-[0_18px_38px_rgba(15,159,141,0.28)] focus-visible:!border-transparent focus-visible:!ring-0 disabled:opacity-80 sm:h-11 sm:w-auto sm:min-w-[176px] sm:whitespace-nowrap sm:px-6 sm:py-0"
                  >
                    {completing || savingStep ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        {primaryLabel}
                      </>
                    ) : activeStep.id === "review" ? (
                      <>
                        {primaryLabel}
                        <Sparkles className="size-4" />
                      </>
                    ) : (
                      <>
                        {primaryLabel}
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.article>
          </div>
        </div>
      </section>

      <OnboardingStyles />
    </main>
  );
}

function OnboardingBrand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80"
      aria-label="Trailgrad home"
    >
      <Image
        src="/images/brand/trailgrad-logo.png"
        alt=""
        width={172}
        height={194}
        className="h-[34px] w-auto"
        priority
      />
      <span
        className={`${lobsterTwo.className} text-[27px] font-semibold leading-none text-[#082f35]`}
      >
        Trailgrad
      </span>
    </Link>
  );
}

function ProgressDots({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label="Onboarding progress">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const active = index <= currentStep;

        return (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              active ? "w-7 bg-[#159b89]" : "w-1.5 bg-[#d8e9e5]"
            }`}
          />
        );
      })}
    </div>
  );
}

function StepViewport({
  busy,
  children,
  direction,
  slideDistance,
  stepKey,
  transition,
}: {
  busy: boolean;
  children: ReactNode;
  direction: number;
  slideDistance: number;
  stepKey: OnboardingStepId;
  transition: Transition;
}) {
  const contentTransition =
    transition.duration === 0
      ? transition
      : { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <motion.div
      layout
      aria-busy={busy}
      className="tg-step-viewport relative overflow-visible"
      transition={transition.duration === 0 ? transition : { layout: contentTransition }}
    >
      <AnimatePresence custom={direction} initial={false} mode="popLayout">
        <motion.div
          key={stepKey}
          layout
          custom={direction}
          initial={{
            opacity: 0,
            x: direction * Math.min(slideDistance, 8),
            y: 8,
            scale: 0.992,
          }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            x: direction * -Math.min(slideDistance, 8),
            y: -6,
            scale: 0.996,
          }}
          transition={contentTransition}
          className="tg-step-pane relative will-change-transform"
        >
          <div className="pt-10">{children}</div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {busy ? (
          <motion.div
            key="onboarding-step-loading"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[132px] z-20 overflow-hidden rounded-b-[22px] bg-white/78 px-2 backdrop-blur-[2px] sm:top-[142px]"
          >
            <div className="mx-auto max-w-[720px]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="tg-shimmer h-24 rounded-[16px]" />
                <div className="tg-shimmer h-24 rounded-[16px]" />
                <div className="tg-shimmer h-24 rounded-[16px]" />
                <div className="tg-shimmer h-24 rounded-[16px]" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="tg-shimmer h-11 rounded-[14px]" />
                <div className="tg-shimmer h-11 rounded-[14px]" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function StepHeading({
  reduceMotion,
  step,
}: {
  reduceMotion: boolean;
  step: OnboardingStep;
}) {
  const compact = step.optional;
  const words = step.title.split(" ");

  return (
    <header className="mx-auto max-w-[650px] text-center">
      <h1
        aria-label={step.title}
        className={`mx-auto max-w-[620px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] ${
          compact ? "text-[34px] sm:text-[44px]" : "text-[36px] sm:text-[48px]"
        }`}
      >
        {reduceMotion
          ? step.title
          : words.map((word, index) => (
            <span
              key={`${step.id}-${word}-${index}`}
              aria-hidden="true"
              className={`tg-onboarding-heading-word inline-block ${index < words.length - 1 ? "mr-[0.22em]" : ""}`}
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              {word}
            </span>
          ))}
      </h1>
      <p className="mx-auto mt-3 max-w-[500px] text-sm font-medium leading-6 text-[#5f6f6b]">
        {step.description}
      </p>
    </header>
  );
}

function StepOptions({ options, selected, onSelect, footer }: StepOptionsProps) {
  return (
    <fieldset className={`mx-auto mt-6 max-w-[720px] ${footer ? "pb-4" : ""}`}>
      <legend className="sr-only">Choose one option</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.id === selected;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={`group relative flex min-h-[96px] cursor-pointer items-center gap-4 overflow-hidden rounded-[16px] border p-4 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-out ${
                active
                  ? "border-[#20b8a4] bg-[#f0fdfa] shadow-[0_16px_34px_rgba(15,118,110,0.11)]"
                  : "border-[#e5e7eb] bg-white hover:border-[#b7ddd7] hover:bg-[#fbfffe] hover:shadow-[0_14px_34px_rgba(15,118,110,0.08)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent transition-opacity duration-200 ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              />
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-[14px] transition-all duration-200 ease-out ${
                  active
                    ? "bg-[#0f9f8d] text-white shadow-[0_12px_24px_rgba(15,159,141,0.22)]"
                    : "bg-[#f3f4f6] text-[#4b5563] group-hover:bg-[#ecfdf9] group-hover:text-[#0f766e]"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#111827]">
                  {option.title}
                  {option.badge ? (
                    <span className="rounded-full bg-[#fff2dc] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#966329]">
                      {option.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm font-medium leading-5 text-[#6b7280]">
                  {option.description}
                </span>
              </span>
              <span
                className={`ml-auto grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-150 ease-out ${
                  active
                    ? "border-[#2b9f8f] bg-[#2b9f8f] text-white"
                    : "border-[#cadbd7] text-transparent group-hover:border-[#9ccfc6]"
                }`}
              >
                <Check className="size-3" />
              </span>
            </button>
          );
        })}
      </div>
      {footer ? <div className="mt-5 flex justify-center">{footer}</div> : null}
    </fieldset>
  );
}

function TargetRoleStep({
  experienceLevel,
  hiddenRoleCount,
  onExperienceChange,
  onRoleChange,
  onShowAllRoles,
  role,
  showAllRoles,
  visibleRoleOptions,
}: {
  experienceLevel: string;
  hiddenRoleCount: number;
  onExperienceChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onShowAllRoles: () => void;
  role: string;
  showAllRoles: boolean;
  visibleRoleOptions: Option[];
}) {
  return (
    <div className="pb-4">
      <StepOptions
        options={visibleRoleOptions}
        selected={role}
        onSelect={onRoleChange}
        footer={
          !showAllRoles && hiddenRoleCount > 0 ? (
            <button
              type="button"
              onClick={onShowAllRoles}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-[#d7e9e4] bg-white px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_26px_rgba(15,118,110,0.06)] outline-none transition-[border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#9bd8cf] hover:bg-[#f8fffd] hover:shadow-[0_12px_30px_rgba(15,118,110,0.09)]"
            >
              View more roles
              <span className="rounded-full bg-[#edf8f5] px-2 py-0.5 text-[11px] text-[#159b89]">
                +{hiddenRoleCount}
              </span>
              <ArrowRight className="size-4" />
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto mt-7 max-w-[720px]">
        <SectionPrompt
          title="Experience level"
          description="This calibrates how Trailgrad judges your current evidence."
        />
        <StepOptions
          options={experienceOptions}
          selected={experienceLevel}
          onSelect={onExperienceChange}
        />
      </div>
    </div>
  );
}

function ResumeQuestion({
  inspectionStep,
  onUpload,
  processingStatus,
  resumeName,
  resumeSize,
  uploadIssue,
  uploading,
}: {
  inspectionStep: number;
  onUpload: (file: File | undefined) => void;
  processingStatus: string;
  resumeName: string;
  resumeSize: number;
  uploadIssue: ResumeUploadIssue | null;
  uploading: boolean;
}) {
  const activeInspectionStep =
    resumeInspectionSteps[
      Math.min(inspectionStep, resumeInspectionSteps.length - 1)
    ] ?? resumeInspectionSteps[0];

  return (
    <div className="mx-auto mt-9 max-w-[720px] pb-10">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)] sm:items-center">
        <label
          htmlFor="resume"
          className={`group flex min-h-[260px] min-w-0 cursor-pointer flex-col items-center justify-center rounded-[22px] border bg-white p-6 text-center outline-none shadow-[0_8px_22px_rgba(15,118,110,0.028)] transition-[border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#9fd8d0] hover:bg-[#fdfffe] hover:shadow-[0_12px_28px_rgba(15,118,110,0.045)] sm:aspect-square ${
            resumeName ? "border-[#8fd5cb] bg-[#fbfffe]" : "border-[#e7ecea]"
          }`}
        >
          <input
            id="resume"
            type="file"
            accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
          <span className="grid size-16 place-items-center rounded-[18px] border border-[#dff2ee] bg-[#effbf8] text-[#0f9f8d] transition-transform duration-700 group-hover:scale-[1.025]">
            {uploading ? (
              <LoaderCircle className="size-7 animate-spin" />
            ) : resumeName ? (
              <FileCheck2 className="size-7" />
            ) : (
              <FileUp className="size-7" />
            )}
          </span>

          <span className="mt-5 line-clamp-2 max-w-full break-all text-base font-semibold leading-5 text-[#111827]">
            {resumeName || "Upload resume"}
          </span>
          <span className="mt-2 max-w-full break-words text-sm font-medium text-[#6b7280]">
            {uploading
              ? "Uploading and extracting text"
              : processingStatus || (resumeName ? formatFileSize(resumeSize) : "PDF or DOCX")}
          </span>
          <span className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d7e8e3] bg-white px-3 text-sm font-semibold text-[#0f766e] transition-colors duration-500 group-hover:border-[#9fd8d0] group-hover:bg-[#f4fbf9]">
            {resumeName ? "Change file" : "Browse file"}
            {resumeName ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
          </span>
        </label>

        {uploading ? (
          <ResumeInspectionPanel
            activeStep={activeInspectionStep}
            activeStepIndex={inspectionStep}
          />
        ) : uploadIssue ? (
          <div className="min-w-0 rounded-[20px] border border-[#f1cdbf] bg-[#fff9f6] p-4 shadow-[0_14px_34px_rgba(154,80,60,0.08)]">
            <span className="grid size-11 place-items-center rounded-[14px] bg-white text-[#b4533b] shadow-[0_10px_22px_rgba(154,80,60,0.08)]">
              <FileWarning className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-[#111827]">
              {uploadIssue.title}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#7b625b]">
              {uploadIssue.message}
            </p>
            <ul className="mt-4 space-y-2 text-sm font-medium text-[#7b625b]">
              {[
                "Use your actual resume, not notes or a portfolio doc.",
                "Include experience, projects, skills, or education.",
                "Upload a text-based PDF or DOCX.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#c46a4b]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="min-w-0 rounded-[18px] bg-[#fcfdfd] p-4 shadow-[0_8px_24px_rgba(15,118,110,0.035)]">
            <p className="text-sm font-semibold text-[#111827]">
              Trailgrad will inspect
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-[#5f6f6b]">
              {[
                "skills",
                "experience",
                "projects",
                "weak claims",
                "missing proof",
                "possible interview risks",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-[#159b89]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeInspectionPanel({
  activeStep,
  activeStepIndex,
}: {
  activeStep: ResumeInspectionStep;
  activeStepIndex: number;
}) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-[20px] border border-[#d7eee9] bg-[#fbfffe] p-5 shadow-[0_16px_38px_rgba(15,118,110,0.06)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#13a08d]/45 to-transparent" />
      <div className="pointer-events-none absolute -right-12 -top-16 size-36 rounded-full bg-[#e3faf6] opacity-70 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6fb8af]">
          Private inspection
        </p>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeStep.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="tg-inspection-shine mt-4 text-xl font-semibold leading-7 text-[#0f3d3a]"
          >
            {activeStep.title}
            <span className="ml-1 inline-flex w-5">
              <AnimatedDots />
            </span>
          </motion.p>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeStep.description}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-3 text-sm font-medium leading-6 text-[#61716d]"
          >
            {activeStep.description}
          </motion.p>
        </AnimatePresence>

        <p className="mt-5 text-xs font-semibold text-[#83aaa4]">
          Step {Math.min(activeStepIndex + 1, resumeInspectionSteps.length)} of{" "}
          {resumeInspectionSteps.length}
        </p>
      </div>
    </div>
  );
}

function AnimatedDots() {
  return (
    <>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -1, 0] }}
          transition={{
            duration: 1.1,
            ease: "easeInOut",
            repeat: Infinity,
            delay: dot * 0.14,
          }}
        >
          .
        </motion.span>
      ))}
    </>
  );
}

function SectionPrompt({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#111827]">{title}</p>
      <p className="mt-1 text-sm font-medium leading-5 text-[#6b7280]">
        {description}
      </p>
    </div>
  );
}

function ReviewStep({
  experience,
  onEditProfile,
  onEditResume,
  resumeName,
  role,
}: {
  experience: string;
  onEditProfile: () => void;
  onEditResume: () => void;
  resumeName: string;
  role: string;
}) {
  const items: Array<{
    fullWidth?: boolean;
    label: string;
    onEdit: () => void;
    value: string;
  }> = [
    { label: "Target role", value: role || "Not selected", onEdit: onEditProfile },
    {
      label: "Experience level",
      value: experience || "Not selected",
      onEdit: onEditProfile,
    },
    {
      label: "Uploaded resume",
      value: resumeName || "No resume uploaded",
      onEdit: onEditResume,
      fullWidth: true,
    },
  ];

  return (
    <div className="mx-auto mt-9 max-w-[720px] pb-8">
      <div className="rounded-[18px] bg-[#fcfdfd] p-4 shadow-[0_8px_24px_rgba(15,118,110,0.035)]">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className={`relative rounded-[14px] bg-white p-4 ring-1 ring-[#e5e7eb] ${
                item.fullWidth ? "w-full sm:col-span-2" : ""
              }`}
            >
              <div
                className={`flex items-start gap-3 ${
                  item.fullWidth ? "justify-center pr-12 text-center" : "justify-between"
                }`}
              >
                <div className={item.fullWidth ? "min-w-0 max-w-[360px]" : "min-w-0"}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                    {item.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-[#111827]">
                    {item.value}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={item.onEdit}
                  aria-label={`Edit ${item.label}`}
                  title={`Edit ${item.label}`}
                  className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-[#d7e8e3] bg-white text-[#0f766e] transition-colors duration-500 hover:border-[#9fd8d0] hover:bg-[#f4fbf9] ${
                    item.fullWidth ? "absolute right-4 top-4" : ""
                  }`}
                >
                  <PencilLine className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getResumeUploadIssue(
  code: string | undefined,
  fallback: string | undefined,
): ResumeUploadIssue {
  if (code === "UNSUPPORTED_TYPE") {
    return {
      code,
      title: "Use a PDF or DOCX resume.",
      message: fallback ?? "Trailgrad currently supports PDF and DOCX resumes.",
    };
  }

  if (code === "RESUME_NOT_LIKELY") {
    return {
      code,
      title: "This does not look like a resume.",
      message:
        fallback ??
        "Upload a candidate resume with sections such as experience, projects, education, or skills.",
    };
  }

  if (code === "EXTRACTION_FAILED" || code === "TEXT_EMPTY") {
    return {
      code,
      title: "Trailgrad could not read enough text.",
      message:
        fallback ??
        "Try a text-based PDF or DOCX file instead of a scanned image.",
    };
  }

  return {
    code,
    title: "Resume upload needs another try.",
    message: fallback ?? "Upload a PDF or DOCX resume and try again.",
  };
}

function getStepIndex(stepId: OnboardingStepId | undefined) {
  const index = steps.findIndex((step) => step.id === stepId);

  return index >= 0 ? index : 0;
}

function getOptionTitle(options: Option[], value: string) {
  return options.find((option) => option.id === value)?.title ?? "";
}

function formatFileSize(size: number) {
  if (!size) return "PDF or DOCX";

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function OnboardingStyles() {
  return (
    <style jsx global>{`
      @keyframes tg-onboarding-heading-word {
        from {
          opacity: 0;
          transform: translate3d(0, 12px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      .tg-onboarding-heading-word {
        opacity: 0;
        animation: tg-onboarding-heading-word 520ms
          cubic-bezier(0.16, 1, 0.3, 1) forwards;
        will-change: opacity, transform;
      }

      @keyframes tg-shimmer {
        0% {
          background-position: 120% 0;
        }
        100% {
          background-position: -120% 0;
        }
      }

      @keyframes tg-inspection-shine {
        0% {
          background-position: 120% 0;
        }
        100% {
          background-position: -120% 0;
        }
      }

      .tg-inspection-shine {
        background-image: linear-gradient(
          90deg,
          #0f3d3a 0%,
          #0f9f8d 42%,
          #65d7ca 50%,
          #0f9f8d 58%,
          #0f3d3a 100%
        );
        background-size: 220% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: tg-inspection-shine 1.8s ease-in-out infinite;
      }

      .tg-shimmer {
        background-image: linear-gradient(
          90deg,
          rgba(231, 242, 239, 0.75) 0%,
          rgba(255, 255, 255, 0.96) 48%,
          rgba(211, 239, 234, 0.78) 100%
        );
        background-size: 220% 100%;
        animation: tg-shimmer 1.1s ease-in-out infinite;
      }

      .tg-onboarding-teal-clouds {
        background:
          radial-gradient(
            ellipse 24% 17% at 6% 72%,
            rgba(15, 118, 110, 0.3),
            rgba(20, 184, 166, 0.18) 46%,
            transparent 76%
          ),
          radial-gradient(
            ellipse 30% 19% at 20% 82%,
            rgba(45, 212, 191, 0.28),
            rgba(153, 246, 228, 0.16) 48%,
            transparent 78%
          ),
          radial-gradient(
            ellipse 28% 18% at 36% 76%,
            rgba(125, 232, 218, 0.2),
            rgba(204, 251, 241, 0.12) 50%,
            transparent 78%
          ),
          radial-gradient(
            ellipse 32% 21% at 75% 16%,
            rgba(94, 234, 212, 0.28),
            rgba(20, 184, 166, 0.13) 48%,
            transparent 78%
          ),
          radial-gradient(
            ellipse 25% 17% at 91% 28%,
            rgba(153, 246, 228, 0.2),
            transparent 76%
          ),
          radial-gradient(
            ellipse 22% 15% at 57% 28%,
            rgba(167, 243, 208, 0.18),
            transparent 74%
          ),
          radial-gradient(
            ellipse 44% 24% at 54% 98%,
            rgba(204, 251, 241, 0.22),
            transparent 72%
          ),
          linear-gradient(135deg, #f9fffd 0%, #e6fbf6 54%, #f7fcfa 100%);
        filter: blur(34px) saturate(1.03);
        opacity: 0.86;
        transform: translate3d(0, 0, 0);
      }

      .tg-onboarding-cloud-haze {
        background:
          radial-gradient(
            ellipse 58% 30% at 26% 92%,
            rgba(20, 184, 166, 0.13),
            transparent 72%
          ),
          radial-gradient(
            ellipse 58% 34% at 87% 38%,
            rgba(125, 232, 218, 0.12),
            transparent 74%
          ),
          linear-gradient(
            15deg,
            rgba(15, 118, 110, 0.1) 0%,
            rgba(20, 184, 166, 0.08) 26%,
            transparent 62%
          );
        filter: blur(64px);
        opacity: 0.7;
      }

      .tg-grid {
        background-image:
          linear-gradient(rgba(15, 118, 110, 0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15, 118, 110, 0.18) 1px, transparent 1px);
        background-size: 54px 54px;
      }

      @media (prefers-reduced-motion: reduce) {
        .tg-onboarding-heading-word,
        .tg-inspection-shine {
          animation: none !important;
          opacity: 1;
          transform: none;
        }
      }
    `}</style>
  );
}
