"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
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
  CalendarClock,
  ChartColumn,
  Check,
  Clock3,
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
import { Input } from "@/components/ui/input";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { lobsterTwo } from "@/lib/fonts";
import type {
  OnboardingState,
  OnboardingStepId,
  OnboardingSubmission,
} from "@/lib/onboarding/types";

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

interface ResumeUploadIssue {
  code?: string;
  message: string;
  title: string;
}

interface ResumeInspectionStep {
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    id: "target-role",
    title: "Where are you headed?",
    description: "Pick the role and level Trailgrad should judge you against.",
  },
  {
    id: "timeline",
    title: "When do you want to be ready?",
    description: "Set the prep pace so recommendations fit your actual week.",
  },
  {
    id: "resume",
    title: "Add your resume.",
    description: "This becomes the evidence Trailgrad checks for risks and gaps.",
  },
  {
    id: "target-job",
    title: "Add a target job.",
    description: "Optional, but it makes the analysis sharper for one opening.",
    optional: true,
  },
  {
    id: "review",
    title: "Review your setup.",
    description: "Confirm the inputs before Trailgrad builds your first profile.",
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

const preparationTimeOptions: Option[] = [
  { id: "15", title: "15 minutes", description: "Tiny daily improvement", icon: Clock3 },
  { id: "30", title: "30 minutes", description: "Solid daily progress", icon: Clock3, badge: "Steady" },
  { id: "60", title: "60 minutes", description: "Deeper project and practice work", icon: CalendarClock },
  { id: "flexible", title: "Flexible", description: "Varies each day", icon: Rocket },
];

const intensityOptions: Option[] = [
  { id: "light", title: "Light", description: "Low pressure, keep momentum", icon: Clock3 },
  { id: "standard", title: "Standard", description: "Focused but sustainable", icon: CalendarClock, badge: "Balanced" },
  { id: "intensive", title: "Intensive", description: "Fastest path, more effort", icon: Rocket },
];

const targetJobOptions: Option[] = [
  { id: "paste", title: "Paste a job description", description: "Tailor risks to one role", icon: BriefcaseBusiness },
  { id: "skip", title: "Skip for now", description: "Use your target role only", icon: ArrowRight },
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
    title: "Preparing your profile input",
    description: "Saving the validated resume for the next analysis step.",
  },
];

interface OnboardingFlowProps {
  initialState?: OnboardingState;
}

export function OnboardingFlow({ initialState }: OnboardingFlowProps) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const [currentStep, setCurrentStep] = useState(() =>
    getStepIndex(initialState?.currentStep),
  );
  const [direction, setDirection] = useState(1);
  const [targetRole, setTargetRole] = useState(initialState?.onboarding?.targetRole ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    initialState?.onboarding?.experienceLevel ?? "",
  );
  const [targetCompany, setTargetCompany] = useState(
    initialState?.onboarding?.targetCompany ?? "",
  );
  const [targetJobTitle, setTargetJobTitle] = useState(
    initialState?.onboarding?.targetJobTitle ?? "",
  );
  const [interviewDate, setInterviewDate] = useState(
    initialState?.onboarding?.interviewDate ?? "",
  );
  const [noDateYet, setNoDateYet] = useState(
    Boolean(initialState?.onboarding?.noDateYet),
  );
  const [timelineDisplay, setTimelineDisplay] = useState(() =>
    getTimelineDisplay(
      initialState?.onboarding?.interviewDate ?? "",
      Boolean(initialState?.onboarding?.noDateYet),
    ),
  );
  const [preparationTimePerDay, setPreparationTimePerDay] = useState<
    OnboardingSubmission["preparationTimePerDay"] | ""
  >(initialState?.onboarding?.preparationTimePerDay ?? "");
  const [preparationIntensity, setPreparationIntensity] = useState<
    OnboardingSubmission["preparationIntensity"] | ""
  >(initialState?.onboarding?.preparationIntensity ?? "");
  const [resumeName, setResumeName] = useState(initialState?.onboarding?.resumeName ?? "");
  const [resumeContentType, setResumeContentType] = useState(
    initialState?.onboarding?.resumeContentType ?? "",
  );
  const [resumeSize, setResumeSize] = useState(initialState?.onboarding?.resumeSize ?? 0);
  const [resumeUploadedAt, setResumeUploadedAt] = useState(
    initialState?.onboarding?.resumeUploadedAt ?? "",
  );
  const [targetJobMode, setTargetJobMode] = useState<
    OnboardingSubmission["targetJobMode"] | ""
  >(initialState?.onboarding?.targetJobMode ?? "");
  const [jobDescription, setJobDescription] = useState(
    initialState?.onboarding?.jobDescription ?? "",
  );
  const [generating, setGenerating] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeProcessingStatus, setResumeProcessingStatus] = useState("");
  const [resumeInspectionStep, setResumeInspectionStep] = useState(0);
  const [resumeUploadIssue, setResumeUploadIssue] =
    useState<ResumeUploadIssue | null>(null);
  const [showAllRoles, setShowAllRoles] = useState(() =>
    Boolean(
      initialState?.onboarding?.targetRole &&
        !roleOptions
          .slice(0, 4)
          .some((option) => option.id === initialState.onboarding?.targetRole),
    ),
  );
  const [errorMessage, setErrorMessage] = useState(
    initialState?.analysisError ?? "",
  );

  const activeStep = steps[currentStep];
  const transition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.52, ease: [0.16, 1, 0.3, 1] };
  const slideDistance = reduceMotion ? 0 : 18;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const visibleRoleOptions = showAllRoles ? roleOptions : roleOptions.slice(0, 4);
  const hiddenRoleCount = roleOptions.length - visibleRoleOptions.length;

  const selectedLabels = useMemo(
    () => ({
      role: getOptionTitle(roleOptions, targetRole) || "Target role",
      experience:
        getOptionTitle(experienceOptions, experienceLevel) || "Experience level",
      preparation:
        getOptionTitle(preparationTimeOptions, preparationTimePerDay) ||
        "Preparation time",
      intensity:
        getOptionTitle(intensityOptions, preparationIntensity) ||
        "Preparation intensity",
    }),
    [experienceLevel, preparationIntensity, preparationTimePerDay, targetRole],
  );

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [currentStep, reduceMotion]);

  useEffect(() => {
    if (!uploadingResume) {
      return;
    }

    const timer = window.setInterval(() => {
      setResumeInspectionStep((step) =>
        Math.min(step + 1, resumeInspectionSteps.length - 1),
      );
    }, 850);

    return () => window.clearInterval(timer);
  }, [uploadingResume]);

  function selectOption(value: string) {
    if (activeStep.id === "target-role") setTargetRole(value);
    if (activeStep.id === "target-job") {
      setTargetJobMode(value as OnboardingSubmission["targetJobMode"]);
    }
  }

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

    await moveToStep(Math.max(currentStep - 1, 0), -1);
  }

  async function moveToStep(nextStep: number, nextDirection = nextStep > currentStep ? 1 : -1) {
    setErrorMessage("");
    setSavingStep(true);

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

    setDirection(nextDirection);
    setCurrentStep(nextStep);
  }

  function saveDraft() {
    try {
      window.sessionStorage.setItem(
        "trailgrad:onboarding",
        JSON.stringify(getPartialOnboardingDraft()),
      );
    } catch {
      // Storage is a convenience for the auth handoff, not a blocker.
    }
  }

  function getOnboardingDraft(): OnboardingSubmission {
    return {
      targetRole,
      experienceLevel,
      ...(targetCompany.trim() ? { targetCompany: targetCompany.trim() } : {}),
      ...(targetJobTitle.trim() ? { targetJobTitle: targetJobTitle.trim() } : {}),
      ...(interviewDate && !noDateYet ? { interviewDate } : {}),
      noDateYet,
      preparationTimePerDay:
        preparationTimePerDay || ("30" as OnboardingSubmission["preparationTimePerDay"]),
      preparationIntensity:
        preparationIntensity || ("standard" as OnboardingSubmission["preparationIntensity"]),
      resumeName,
      ...(resumeContentType ? { resumeContentType } : {}),
      ...(resumeSize ? { resumeSize } : {}),
      ...(resumeUploadedAt ? { resumeUploadedAt } : {}),
      targetJobMode: targetJobMode || "skip",
      ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      projectsMode: "skip",
    };
  }

  function getPartialOnboardingDraft(): Partial<OnboardingSubmission> {
    return {
      ...(targetRole ? { targetRole } : {}),
      ...(experienceLevel ? { experienceLevel } : {}),
      targetCompany: targetCompany.trim(),
      targetJobTitle: targetJobTitle.trim(),
      interviewDate: noDateYet ? "" : interviewDate,
      noDateYet,
      ...(preparationTimePerDay ? { preparationTimePerDay } : {}),
      ...(preparationIntensity ? { preparationIntensity } : {}),
      ...(resumeName ? { resumeName } : {}),
      ...(resumeContentType ? { resumeContentType } : {}),
      ...(resumeSize ? { resumeSize } : {}),
      ...(resumeUploadedAt ? { resumeUploadedAt } : {}),
      ...(targetJobMode ? { targetJobMode } : {}),
      jobDescription: jobDescription.trim(),
      projectsMode: "skip",
    };
  }

  function validateStep(stepId: OnboardingStepId): string {
    if (stepId === "target-role" && (!targetRole || !experienceLevel)) {
      return "Choose a target role and experience level.";
    }

    if (stepId === "timeline") {
      if (!noDateYet && !interviewDate) {
        return "Choose a date or select that you do not have one yet.";
      }

      if (!preparationTimePerDay || !preparationIntensity) {
        return "Choose your daily preparation time and intensity.";
      }
    }

    if (stepId === "resume" && !resumeName) {
      return "Upload a PDF or DOCX resume before continuing.";
    }

    if (stepId === "review") {
      return (
        validateStep("target-role") ||
        validateStep("timeline") ||
        validateStep("resume")
      );
    }

    return "";
  }

  async function saveStep(nextStep: OnboardingStepId) {
    saveDraft();

    const response = await fetch("/api/profile/onboarding", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentStep: nextStep,
        onboarding: getPartialOnboardingDraft(),
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
    if (!file) {
      return;
    }

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
    saveDraft();
    setGenerating(true);

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

        throw new Error(payload?.error ?? "Unable to build your Trailgrad profile.");
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
      setGenerating(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to build your Trailgrad profile.",
      );
    }
  }

  function startRouteTransition() {
    if (!reduceMotion) {
      window.dispatchEvent(new Event("trailgrad:route-transition-start"));
    }
  }

  const canContinue = !generating && !savingStep && !uploadingResume;
  const primaryLabel =
    generating
      ? "Starting analysis"
      : savingStep
        ? "Saving"
      : activeStep.id === "review"
        ? "Build my Trailgrad Profile"
        : activeStep.optional
          ? "Continue"
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
                busy={savingStep || generating}
                direction={direction}
                slideDistance={slideDistance}
                stepKey={activeStep.id}
                transition={transition}
              >
                <StepHeading step={activeStep} reduceMotion={reduceMotion} />

                {activeStep.id === "target-role" && (
                  <TargetRoleStep
                    experienceLevel={experienceLevel}
                    hiddenRoleCount={hiddenRoleCount}
                    onExperienceChange={setExperienceLevel}
                    onRoleChange={selectOption}
                    onShowAllRoles={() => setShowAllRoles(true)}
                    role={targetRole}
                    targetCompany={targetCompany}
                    targetJobTitle={targetJobTitle}
                    visibleRoleOptions={visibleRoleOptions}
                    showAllRoles={showAllRoles}
                    onTargetCompanyChange={setTargetCompany}
                    onTargetJobTitleChange={setTargetJobTitle}
                  />
                )}

                {activeStep.id === "timeline" && (
                  <TimelineStep
                    interviewDate={interviewDate}
                    noDateYet={noDateYet}
                    onInterviewDateChange={setInterviewDate}
	                    onNoDateYetChange={(checked) => {
	                      setNoDateYet(checked);
	                      if (checked) {
	                        setInterviewDate("");
	                        setTimelineDisplay("No date yet");
	                      }
	                    }}
	                    onTimelineDisplayChange={setTimelineDisplay}
                    onPreparationIntensityChange={(value) =>
                      setPreparationIntensity(
                        value as OnboardingSubmission["preparationIntensity"],
                      )
                    }
                    onPreparationTimeChange={(value) =>
                      setPreparationTimePerDay(
                        value as OnboardingSubmission["preparationTimePerDay"],
                      )
                    }
                    preparationIntensity={preparationIntensity}
                    preparationTimePerDay={preparationTimePerDay}
                  />
                )}

                {activeStep.id === "resume" && (
                  <ResumeQuestion
                    resumeName={resumeName}
                    resumeSize={resumeSize}
                    processingStatus={resumeProcessingStatus}
                    inspectionStep={resumeInspectionStep}
                    uploadIssue={resumeUploadIssue}
                    uploading={uploadingResume}
                    onUpload={uploadResume}
                  />
                )}

                {activeStep.id === "target-job" && (
                  <TargetJobStep
                    jobDescription={jobDescription}
                    mode={targetJobMode}
                    onDescriptionChange={setJobDescription}
                    onModeChange={selectOption}
                  />
                )}

                {activeStep.id === "review" && (
                  <ReviewStep
                    experience={selectedLabels.experience}
                    preparation={`${selectedLabels.preparation}, ${selectedLabels.intensity.toLowerCase()}`}
                    resumeName={resumeName}
                    role={selectedLabels.role}
                    targetJobStatus={
                      targetJobMode === "paste" && jobDescription.trim()
                        ? "Job description added"
                        : "Skipped for now"
                    }
	                    timeline={timelineDisplay || (noDateYet ? "No date yet" : interviewDate)}
	                    onEdit={(stepId) => void moveToStep(getStepIndex(stepId), -1)}
	                  />
                )}
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
                    {generating || savingStep ? (
                      <><LoaderCircle className="size-4 animate-spin" /> {primaryLabel}</>
                    ) : activeStep.id === "review" ? (
                      <>{primaryLabel} <Sparkles className="size-4" /></>
                    ) : (
                      <>{primaryLabel} <ArrowRight className="size-4" /></>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.article>
          </div>
        </div>
      </section>

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
      `}</style>
    </main>
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
      <span className={`${lobsterTwo.className} text-[27px] font-semibold leading-none text-[#111827]`}>
        Trailgrad
      </span>
    </Link>
  );
}

function ProgressDots({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
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

function StepHeading({ step, reduceMotion }: { step: OnboardingStep; reduceMotion: boolean }) {
  const compact = step.optional;
  const words = step.title.split(" ");

  return (
    <div className="mx-auto max-w-[650px] text-center">
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
    </div>
  );
}

interface StepOptionsProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  footer?: ReactNode;
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
              className={`group relative flex min-h-[96px] items-center gap-4 overflow-hidden rounded-[16px] border p-4 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-out ${
                active
                  ? "border-[#20b8a4] bg-[#f0fdfa] shadow-[0_16px_34px_rgba(15,118,110,0.11)]"
                  : "border-[#e5e7eb] bg-white hover:border-[#b7ddd7] hover:bg-[#fbfffe] hover:shadow-[0_14px_34px_rgba(15,118,110,0.08)]"
              }`}
            >
              <span aria-hidden="true" className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
              <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] transition-all duration-200 ease-out ${active ? "bg-[#0f9f8d] text-white shadow-[0_12px_24px_rgba(15,159,141,0.22)]" : "bg-[#f3f4f6] text-[#4b5563] group-hover:bg-[#ecfdf9] group-hover:text-[#0f766e]"}`}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#111827]">
                  {option.title}
                  {option.badge && <span className="rounded-full bg-[#fff2dc] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#966329]">{option.badge}</span>}
                </span>
                <span className="mt-1 block text-sm font-medium leading-5 text-[#6b7280]">
                  {option.description}
                </span>
              </span>
              <span className={`ml-auto grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-150 ease-out ${active ? "border-[#2b9f8f] bg-[#2b9f8f] text-white" : "border-[#cadbd7] text-transparent group-hover:border-[#9ccfc6]"}`}>
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
  onTargetCompanyChange,
  onTargetJobTitleChange,
  role,
  showAllRoles,
  targetCompany,
  targetJobTitle,
  visibleRoleOptions,
}: {
  experienceLevel: string;
  hiddenRoleCount: number;
  onExperienceChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onShowAllRoles: () => void;
  onTargetCompanyChange: (value: string) => void;
  onTargetJobTitleChange: (value: string) => void;
  role: string;
  showAllRoles: boolean;
  targetCompany: string;
  targetJobTitle: string;
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
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#d7e9e4] bg-white px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_26px_rgba(15,118,110,0.06)] outline-none transition-[border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#9bd8cf] hover:bg-[#f8fffd] hover:shadow-[0_12px_30px_rgba(15,118,110,0.09)]"
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
          description="This calibrates the strictness of the analysis."
        />
        <StepOptions options={experienceOptions} selected={experienceLevel} onSelect={onExperienceChange} />
      </div>

      <div className="mx-auto mt-6 grid max-w-[720px] gap-3 sm:grid-cols-2">
        <LabeledInput
          label="Target company"
          optional
          placeholder="Example: Stripe"
          value={targetCompany}
          onChange={onTargetCompanyChange}
        />
        <LabeledInput
          label="Target job title"
          optional
          placeholder="Example: AI Engineer Intern"
          value={targetJobTitle}
          onChange={onTargetJobTitleChange}
        />
      </div>
    </div>
  );
}

function TimelineStep({
  interviewDate,
  noDateYet,
  onInterviewDateChange,
  onNoDateYetChange,
  onTimelineDisplayChange,
  onPreparationIntensityChange,
  onPreparationTimeChange,
  preparationIntensity,
  preparationTimePerDay,
}: {
  interviewDate: string;
  noDateYet: boolean;
  onInterviewDateChange: (value: string) => void;
  onNoDateYetChange: (value: boolean) => void;
  onTimelineDisplayChange: (value: string) => void;
  onPreparationIntensityChange: (value: string) => void;
  onPreparationTimeChange: (value: string) => void;
  preparationIntensity: string;
  preparationTimePerDay: string;
}) {
  return (
    <div className="mx-auto mt-9 max-w-[720px] pb-8">
      <DateCapture
        date={interviewDate}
        noDateYet={noDateYet}
        onDateChange={onInterviewDateChange}
        onNoDateYetChange={onNoDateYetChange}
        onTimelineDisplayChange={onTimelineDisplayChange}
      />

      <div className="mt-7">
        <SectionPrompt
          title="Preparation time per day"
          description="Trailgrad will size tasks around this."
        />
        <StepOptions
          options={preparationTimeOptions}
          selected={preparationTimePerDay}
          onSelect={onPreparationTimeChange}
        />
      </div>

      <div className="mt-7">
        <SectionPrompt
          title="Preparation intensity"
          description="Choose the pace you can actually sustain."
        />
        <StepOptions
          options={intensityOptions}
          selected={preparationIntensity}
          onSelect={onPreparationIntensityChange}
        />
      </div>
    </div>
  );
}

function DateCapture({
  date,
  noDateYet,
  onDateChange,
  onNoDateYetChange,
  onTimelineDisplayChange,
}: {
  date: string;
  noDateYet: boolean;
  onDateChange: (value: string) => void;
  onNoDateYetChange: (value: boolean) => void;
  onTimelineDisplayChange: (value: string) => void;
}) {
  const dateOptions = [
    {
      id: "two-weeks",
      title: "7-15 days",
      description: "Interview soon",
      value: addDaysIso(14),
    },
    {
      id: "one-month",
      title: "1 month",
      description: "Steady prep window",
      value: addDaysIso(30),
    },
    {
      id: "three-months",
      title: "3 months",
      description: "Build deeper proof",
      value: addDaysIso(90),
    },
    {
      id: "no-date",
      title: "No date yet",
      description: "Keep planning flexible",
      value: "",
    },
  ];

  return (
    <div>
      <SectionPrompt
        title="Timeline"
        description="Choose the closest prep window. You can change it later."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {dateOptions.map((option) => {
          const active =
            option.id === "no-date"
              ? noDateYet
              : date === option.value && !noDateYet;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (option.id === "no-date") {
                  onNoDateYetChange(true);
                  onDateChange("");
                  onTimelineDisplayChange(option.title);
                  return;
                }

                onNoDateYetChange(false);
                onDateChange(option.value);
                onTimelineDisplayChange(option.title);
              }}
              className={`flex min-h-[78px] items-center justify-between gap-3 rounded-[16px] border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150 ease-out ${
                active
                  ? "border-[#20b8a4] bg-[#f0fdfa] shadow-[0_16px_34px_rgba(15,118,110,0.1)]"
                  : "border-[#e5e7eb] bg-white hover:border-[#b7ddd7] hover:bg-[#fbfffe]"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-[#111827]">
                  {option.title}
                </span>
                <span className="mt-1 block text-sm font-medium text-[#6b7280]">
                  {option.description}
                </span>
              </span>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-150 ease-out ${active ? "border-[#2b9f8f] bg-[#2b9f8f] text-white" : "border-[#cadbd7] text-transparent"}`}>
                <Check className="size-3" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResumeQuestion({
  resumeName,
  resumeSize,
  processingStatus,
  inspectionStep,
  uploadIssue,
  uploading,
  onUpload,
}: {
  resumeName: string;
  resumeSize: number;
  processingStatus: string;
  inspectionStep: number;
  uploadIssue: ResumeUploadIssue | null;
  uploading: boolean;
  onUpload: (file: File | undefined) => void;
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
            <p className="text-sm font-semibold text-[#111827]">Trailgrad will inspect</p>
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

function TargetJobStep({
  jobDescription,
  mode,
  onDescriptionChange,
  onModeChange,
}: {
  jobDescription: string;
  mode: string;
  onDescriptionChange: (value: string) => void;
  onModeChange: (value: string) => void;
}) {
  return (
    <div className="mx-auto mt-8 max-w-[720px] pb-4">
      <StepOptions options={targetJobOptions} selected={mode} onSelect={onModeChange} />
      <AnimatePresence initial={false}>
        {mode === "paste" ? (
          <motion.div
            key="target-job-description"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <textarea
              id="job-description"
              aria-label="Target job description"
              value={jobDescription}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Paste the job description or a few key requirements."
              className="tg-slim-scrollbar mt-4 min-h-[168px] w-full resize-none rounded-[18px] border border-[#d7e8e3] bg-[#fcfdfd] p-4 text-sm leading-6 text-[#111827] shadow-[0_10px_28px_rgba(15,118,110,0.045)] outline-none transition-colors duration-500 placeholder:text-[#9ca3af] focus:border-[#8bcfc5] focus:bg-white"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function LabeledInput({
  label,
  optional,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  optional?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <label htmlFor={id} className="text-sm font-semibold text-[#111827]">
      {label} {optional ? <OptionalLabel /> : null}
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 h-13 rounded-[14px] border-[#e5e7eb] bg-[#fcfdfd] text-sm text-[#111827] transition-colors duration-500 placeholder:text-[#9ca3af] focus-visible:border-[#8bcfc5] focus-visible:bg-white focus-visible:!ring-0"
      />
    </label>
  );
}

function OptionalLabel() {
  return <span className="text-xs font-medium text-[#6b7280]">(optional)</span>;
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
  onEdit,
  preparation,
  resumeName,
  role,
  targetJobStatus,
  timeline,
}: {
  experience: string;
  onEdit: (stepId: OnboardingStepId) => void;
  preparation: string;
  resumeName: string;
  role: string;
  targetJobStatus: string;
  timeline: string;
}) {
  const items: Array<{ label: string; value: string; step: OnboardingStepId }> = [
    { label: "Target role", value: role, step: "target-role" },
    { label: "Experience level", value: experience, step: "target-role" },
    { label: "Timeline", value: timeline || "No date yet", step: "timeline" },
    { label: "Preparation availability", value: preparation, step: "timeline" },
    { label: "Uploaded resume", value: resumeName, step: "resume" },
    { label: "Target job", value: targetJobStatus, step: "target-job" },
  ];

  return (
    <div className="mx-auto mt-9 max-w-[720px] pb-8">
      <div className="rounded-[18px] bg-[#fcfdfd] p-4 shadow-[0_8px_24px_rgba(15,118,110,0.035)]">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-[14px] bg-white p-4 ring-1 ring-[#e5e7eb]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#111827]">{item.value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(item.step)}
                  aria-label={`Edit ${item.label}`}
                  title={`Edit ${item.label}`}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#d7e8e3] bg-white text-[#0f766e] transition-colors duration-500 hover:border-[#9fd8d0] hover:bg-[#f4fbf9]"
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

function getOptionTitle(options: Option[], value: string) {
  return options.find((option) => option.id === value)?.title;
}

function getResumeUploadIssue(code: string | undefined, fallback?: string): ResumeUploadIssue {
  if (code === "RESUME_NOT_DETECTED") {
    return {
      code,
      title: "This does not look like a resume yet.",
      message:
        "Trailgrad could read the file, but it did not find enough resume structure to analyze it confidently.",
    };
  }

  if (code === "IMAGE_ONLY_PDF") {
    return {
      code,
      title: "This PDF looks scanned.",
      message:
        "Trailgrad needs selectable text. Export your resume as a text-based PDF or upload a DOCX version.",
    };
  }

  if (code === "RESUME_TOO_LONG") {
    return {
      code,
      title: "This looks more like a document than a resume.",
      message:
        "Trailgrad expects a concise resume, usually 1-3 pages. Upload your resume instead of a portfolio, product spec, or case study.",
    };
  }

  if (code === "UNSUPPORTED_FILE_TYPE" || code === "INVALID_EXTENSION") {
    return {
      code,
      title: "Upload a PDF or DOCX resume.",
      message:
        "Trailgrad can analyze resume files in PDF or DOCX format right now.",
    };
  }

  if (code === "OVERSIZED_FILE") {
    return {
      code,
      title: "This resume is too large.",
      message:
        "Use a smaller PDF or DOCX resume so Trailgrad can extract it safely.",
    };
  }

  return {
    code,
    title: "We could not process that resume.",
    message: fallback ?? "Try uploading a clean PDF or DOCX copy of your resume.",
  };
}

function getStepIndex(stepId: OnboardingStepId | undefined) {
  const index = steps.findIndex((step) => step.id === stepId);

  return index >= 0 ? index : 0;
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function getTimelineDisplay(date: string, noDateYet: boolean) {
  if (noDateYet || !date) {
    return "No date yet";
  }

  const timelineOptions = [
    { date: addDaysIso(14), label: "7-15 days" },
    { date: addDaysIso(30), label: "1 month" },
    { date: addDaysIso(90), label: "3 months" },
  ];

  return timelineOptions.find((option) => option.date === date)?.label ?? date;
}

function formatFileSize(size: number) {
  if (!size) {
    return "PDF or DOCX";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
