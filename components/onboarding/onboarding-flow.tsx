"use client";

import { type ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  FileSearch,
  FileUp,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FirstTrailForm } from "@/components/trails/first-trail-form";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { lobsterTwo } from "@/lib/fonts";
import type { ApplicationSubmission } from "@/lib/applications/types";
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

interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  optional?: boolean;
}

const steps: OnboardingStep[] = [
  {
    id: "trail",
    title: "Where are you headed?",
    description: "Tell us about your goal and we will build a personalized readiness trail.",
  },
  {
    id: "resume",
    title: "Add your resume.",
    description: "Upload one private resume so Trailgrad can personalize your first trail.",
  },
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
  const [trailDraft, setTrailDraft] = useState<Partial<OnboardingSubmission>>(
    () => ({
      targetRole: initialState?.onboarding?.targetRole ?? "",
      experienceLevel: initialState?.onboarding?.experienceLevel ?? "",
      trailFocus: initialState?.onboarding?.trailFocus ?? "job",
      targetCompany: initialState?.onboarding?.targetCompany ?? "",
      targetJobTitle: initialState?.onboarding?.targetJobTitle ?? "",
      applicationDate: initialState?.onboarding?.applicationDate ?? "",
      noDateYet: initialState?.onboarding?.noDateYet ?? true,
      preparationTimePerDay:
        initialState?.onboarding?.preparationTimePerDay ?? "30",
      preparationIntensity:
        initialState?.onboarding?.preparationIntensity ?? "standard",
      targetJobMode: initialState?.onboarding?.targetJobMode ?? "skip",
      jobDescription: initialState?.onboarding?.jobDescription ?? "",
    }),
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
    if (activeStep.id === "resume") {
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

  function getOnboardingDraft(
    draftOverride?: Partial<OnboardingSubmission>,
  ): Partial<OnboardingSubmission> {
    return {
      ...trailDraft,
      ...draftOverride,
      resumeName,
      ...(resumeContentType ? { resumeContentType } : {}),
      ...(resumeSize ? { resumeSize } : {}),
      ...(resumeUploadedAt ? { resumeUploadedAt } : {}),
    };
  }

  function validateStep(stepId: OnboardingStepId): string {
    if (stepId === "trail" && (!trailDraft.targetRole || !trailDraft.experienceLevel)) {
      return "Choose a target role and experience level.";
    }

    if (stepId === "resume" && resumeUploadIssue) {
      return "Upload a valid resume before creating your trail.";
    }

    if (stepId === "resume" && !resumeName) {
      return "Upload a PDF or DOCX resume before continuing.";
    }

    return "";
  }

  async function saveStep(
    nextStep: OnboardingStepId,
    draftOverride?: Partial<OnboardingSubmission>,
  ) {
    const response = await fetch("/api/profile/onboarding", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentStep: nextStep,
        onboarding: getOnboardingDraft(draftOverride),
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
    setResumeName("");
    setResumeContentType("");
    setResumeSize(0);
    setResumeUploadedAt("");
    setResumeProcessingStatus("");
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
        setResumeName("");
        setResumeContentType("");
        setResumeSize(0);
        setResumeUploadedAt("");
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
      setResumeName("");
      setResumeContentType("");
      setResumeSize(0);
      setResumeUploadedAt("");
      setResumeProcessingStatus("");
    } finally {
      setUploadingResume(false);
    }
  }

  async function completeOnboarding() {
    const validationError = validateStep("trail") || validateStep("resume");

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setCompleting(true);

    try {
      await saveStep("resume");

      try {
        window.sessionStorage.removeItem("trailgrad:onboarding");
      } catch {
        // A stale draft is harmless if browser storage is unavailable.
      }

      await createFirstTrail();
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
    ? "Creating trail"
    : savingStep
      ? "Saving"
      : activeStep.id === "resume"
        ? "Create trail"
        : "Continue";

  async function handleTrailDraftSubmit(draft: ApplicationSubmission) {
    setErrorMessage("");
    setSavingStep(true);

    try {
      setTrailDraft(draft);
      await saveStep("resume", draft);
      setDirection(1);
      setCurrentStep(getStepIndex("resume"));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save onboarding progress.",
      );
      throw error;
    } finally {
      setSavingStep(false);
    }
  }

  async function createFirstTrail() {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toApplicationRequest(trailDraft)),
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
      throw new Error(payload?.error ?? "Unable to create your first trail.");
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
  }

  if (activeStep.id === "trail") {
    return (
      <FirstTrailForm
        initialDraft={trailDraft}
        isFirstTrail
        onBack={() => {
          startRouteTransition();
          window.setTimeout(() => router.push("/"), reduceMotion ? 0 : 160);
        }}
        onDraftSubmit={handleTrailDraftSubmit}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#111827]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-white" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 pb-6 pt-6 sm:px-8 lg:px-10">
        <header className="flex min-h-16 items-center">
          <OnboardingBrand />
        </header>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <motion.article className="w-full max-w-[1120px]">
              <OnboardingProgress currentStep={currentStep} />
              <StepViewport
                busy={savingStep || completing}
                direction={direction}
                slideDistance={slideDistance}
                stepKey={activeStep.id}
                transition={transition}
              >
                <StepHeading step={activeStep} reduceMotion={reduceMotion} />

                {activeStep.id === "resume" ? (
                  <ResumeQuestion
                    busy={savingStep || completing}
                    resumeName={resumeName}
                    resumeSize={resumeSize}
                    processingStatus={resumeProcessingStatus}
                    inspectionStep={resumeInspectionStep}
                    uploadIssue={resumeUploadIssue}
                    uploading={uploadingResume}
                    onUpload={uploadResume}
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
                  <Button type="button" variant="ghost" onClick={goBack} disabled={!canContinue} className="h-11 justify-start rounded-lg px-3 text-[#4b5563] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#f3f4f6] focus-visible:!border-transparent focus-visible:!ring-0 sm:justify-center">
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={goForward}
                    disabled={!canContinue}
                    className="h-auto min-h-11 w-full min-w-0 whitespace-normal rounded-lg bg-[#0f9f8d] px-4 py-3 text-center font-semibold leading-5 text-white shadow-none transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#0d8d7d] hover:shadow-none focus-visible:!border-transparent focus-visible:!ring-0 disabled:opacity-80 sm:h-11 sm:w-auto sm:min-w-[176px] sm:whitespace-nowrap sm:px-6 sm:py-0"
                  >
                    {completing || savingStep ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        {primaryLabel}
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

function OnboardingProgress({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mx-auto mb-9 max-w-[620px]">
      <div
        className="flex items-center justify-center gap-1.5"
        aria-label="Onboarding progress"
      >
        {steps.map((step, index) => {
          const active = index <= currentStep;

          return (
            <span
              key={step.id}
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
    <header className="mx-auto max-w-[760px] text-center">
      <h1
        aria-label={step.title}
        className={`mx-auto max-w-[720px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#111827] ${
          compact ? "text-[30px] sm:text-[38px]" : "text-[32px] sm:text-[42px]"
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
      <p className="mx-auto mt-3 max-w-[620px] text-sm font-medium leading-6 text-[#5f6f6b]">
        {step.description}
      </p>
    </header>
  );
}

function ResumeQuestion({
  busy,
  inspectionStep,
  onUpload,
  processingStatus,
  resumeName,
  resumeSize,
  uploadIssue,
  uploading,
}: {
  busy: boolean;
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
  const showCardSkeleton = busy && !uploading;

  return (
    <div className="mx-auto mt-10 max-w-[640px] pb-10">
      <label
        htmlFor="resume"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!uploading && !busy) {
            onUpload(event.dataTransfer.files?.[0]);
          }
        }}
        className={`group flex min-h-[360px] min-w-0 flex-col items-center justify-center gap-8 rounded-[14px] border border-[#d9e3ea] bg-white px-9 py-10 text-center outline-none transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#fbfffe] sm:min-h-[270px] sm:flex-row sm:gap-14 sm:px-12 sm:py-10 sm:text-left ${
          busy ? "cursor-wait" : "cursor-pointer"
        } ${
          resumeName ? "bg-[#fbfffe]" : ""
        }`}
      >
        <input
          id="resume"
          type="file"
          accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
          className="sr-only"
          disabled={uploading || busy}
          onChange={(event) => onUpload(event.target.files?.[0])}
        />

        {showCardSkeleton ? (
          <ResumeUploadCardSkeleton />
        ) : (
          <>
            <span className="relative grid size-32 shrink-0 place-items-center rounded-full bg-[#e9fbf7] sm:size-36">
              <span className="relative h-[94px] w-[74px] rounded-[12px] bg-white shadow-[0_12px_26px_rgba(15,118,110,0.1)] ring-1 ring-[#dfe9e6]">
                <span className="absolute left-3.5 top-4 h-2.5 w-9 rounded-full bg-[#16a394]" />
                <span className="absolute right-3.5 top-4 h-2.5 w-6 rounded-full bg-[#a7ddd6]" />
                <span className="absolute left-3.5 top-9 h-2 w-12 rounded-full bg-[#d8e1e8]" />
                <span className="absolute left-3.5 top-14 h-2 w-10 rounded-full bg-[#16a394]" />
                <span className="absolute left-3.5 top-20 h-2 w-12 rounded-full bg-[#d8e1e8]" />
                <span className="absolute left-3.5 top-25 h-2 w-9 rounded-full bg-[#d8e1e8]" />
              </span>
              <span className="absolute bottom-3 right-4 grid size-10 place-items-center rounded-full bg-[#0f9f8d] text-white shadow-[0_12px_26px_rgba(15,159,141,0.22)] transition-transform duration-500 group-hover:scale-[1.04]">
                {uploading ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : uploadIssue ? (
                  <FileSearch className="size-5" />
                ) : resumeName ? (
                  <FileCheck2 className="size-5" />
                ) : (
                  <FileUp className="size-5" />
                )}
              </span>
            </span>

            <span className="flex w-full max-w-[300px] flex-col items-center sm:items-start">
              <span className="flex min-h-[106px] w-full flex-col items-center justify-center sm:items-start">
                {uploading ? (
                  <>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f9f8d]">
                      Private inspection
                    </span>
                    <span className="mt-2 block max-w-full text-xl font-semibold leading-6 text-[#111827]">
                      {activeInspectionStep.title}
                      <span className="ml-1 inline-flex w-5">
                        <AnimatedDots />
                      </span>
                    </span>
                    <span className="mt-2 block max-w-full text-sm font-medium leading-6 text-[#6b7280]">
                      {activeInspectionStep.description}
                    </span>
                    <span className="mt-2 text-xs font-semibold text-[#83aaa4]">
                      Step {Math.min(inspectionStep + 1, resumeInspectionSteps.length)} of{" "}
                      {resumeInspectionSteps.length}
                    </span>
                  </>
                ) : uploadIssue ? (
                  <>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c75263]">
                      Resume check
                    </span>
                    <span className="mt-2 block max-w-full text-xl font-semibold leading-6 text-[#111827]">
                      {uploadIssue.title}
                    </span>
                    <span className="mt-2 block max-w-full text-sm font-medium leading-6 text-[#7a5d63]">
                      {uploadIssue.message}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="line-clamp-2 max-w-full break-all text-xl font-semibold leading-6 text-[#111827]">
                      {resumeName || "Upload your resume"}
                    </span>
                    <span className="mt-2 block max-w-full break-words text-sm font-medium text-[#6b7280]">
                      {processingStatus || (resumeName ? formatFileSize(resumeSize) : "PDF or DOCX - Max 5MB")}
                    </span>
                  </>
                )}
              </span>
              <span className="mt-5 inline-flex h-11 min-w-[176px] items-center justify-center gap-2 rounded-lg bg-[#0f9f8d] px-5 text-sm font-semibold text-white transition-colors duration-500 group-hover:bg-[#0d8d7d]">
                {uploading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}
                {uploading
                  ? "Inspecting"
                  : resumeName || uploadIssue
                    ? "Change file"
                    : "Choose file"}
              </span>
              {!uploading ? (
                <span className="mt-4 block text-sm font-medium text-[#6b7280]">
                  or drag and drop your file here
                </span>
              ) : null}
            </span>
          </>
        )}
      </label>
    </div>
  );
}

function ResumeUploadCardSkeleton() {
  return (
    <>
      <span className="grid size-32 shrink-0 place-items-center rounded-full bg-[#eff6f5] sm:size-36">
        <span className="tg-shimmer size-[92px] rounded-[18px] sm:size-[104px]" />
      </span>

      <span className="flex w-full max-w-[300px] flex-col items-center sm:items-start">
        <span className="tg-shimmer h-6 w-56 max-w-full rounded-full" />
        <span className="tg-shimmer mt-3 h-4 w-44 max-w-full rounded-full" />
        <span className="tg-shimmer mt-7 h-11 w-44 rounded-lg" />
        <span className="tg-shimmer mt-4 h-4 w-60 max-w-full rounded-full" />
      </span>
    </>
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
    title: "Try another PDF or DOCX.",
    message: fallback ?? "Upload a PDF or DOCX resume and try again.",
  };
}

function toApplicationRequest(draft: Partial<OnboardingSubmission>) {
  return {
    trailFocus: draft.trailFocus ?? "job",
    targetCompany: draft.targetCompany,
    targetJobTitle: draft.targetJobTitle,
    applicationDate: draft.noDateYet ? undefined : draft.applicationDate,
    noDateYet: draft.noDateYet ?? true,
    preparationTimePerDay: draft.preparationTimePerDay ?? "30",
    preparationIntensity: draft.preparationIntensity ?? "standard",
    targetJobMode: draft.targetJobMode ?? "skip",
    jobDescription: draft.jobDescription,
  };
}

function getStepIndex(stepId: OnboardingStepId | undefined) {
  const index = steps.findIndex((step) => step.id === stepId);

  return index >= 0 ? index : 0;
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
          rgba(229, 231, 235, 0.78) 0%,
          rgba(255, 255, 255, 0.96) 48%,
          rgba(209, 213, 219, 0.72) 100%
        );
        background-size: 220% 100%;
        animation: tg-shimmer 1.1s ease-in-out infinite;
      }

      .tg-grid {
        background-image:
          linear-gradient(rgba(107, 114, 128, 0.16) 1px, transparent 1px),
          linear-gradient(90deg, rgba(107, 114, 128, 0.16) 1px, transparent 1px);
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
