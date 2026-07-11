"use client";

import { type ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  FileUp,
  GitBranch,
  GraduationCap,
  Layers3,
  Link2,
  LoaderCircle,
  MonitorSmartphone,
  Rocket,
  ServerCog,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { lobsterTwo } from "@/lib/fonts";

interface Option {
  id: string;
  title: string;
  icon: LucideIcon;
  badge?: string;
}

type StepId =
  | "role"
  | "experience"
  | "timeline"
  | "resume"
  | "job-description"
  | "github"
  | "linkedin"
  | "review";

interface OnboardingStep {
  id: StepId;
  title: string;
  optional?: boolean;
}

const steps: OnboardingStep[] = [
  {
    id: "role",
    title: "Where are you headed?",
  },
  {
    id: "experience",
    title: "Where are you right now?",
  },
  {
    id: "timeline",
    title: "When do you want to be ready?",
  },
  {
    id: "resume",
    title: "Add your resume.",
    optional: true,
  },
  {
    id: "job-description",
    title: "Paste the target job.",
    optional: true,
  },
  {
    id: "github",
    title: "Add GitHub.",
    optional: true,
  },
  {
    id: "linkedin",
    title: "Add LinkedIn.",
    optional: true,
  },
  {
    id: "review",
    title: "Ready to build your workspace.",
  },
];

const roleOptions: Option[] = [
  { id: "ai-engineer", title: "AI Engineer", icon: Sparkles, badge: "Popular" },
  { id: "ml-engineer", title: "ML Engineer", icon: BrainCircuit },
  { id: "software-engineer", title: "Software Engineer", icon: Code2 },
  { id: "frontend-engineer", title: "Frontend Engineer", icon: MonitorSmartphone },
  { id: "backend-engineer", title: "Backend Engineer", icon: ServerCog },
  { id: "full-stack-engineer", title: "Full Stack Engineer", icon: BrainCircuit },
  { id: "data-scientist", title: "Data Scientist", icon: Layers3 },
  { id: "data-analyst", title: "Data Analyst", icon: ChartColumn },
  { id: "data-engineer", title: "Data Engineer", icon: Database },
  { id: "product", title: "Product & strategy", icon: BriefcaseBusiness },
];

const experienceOptions: Option[] = [
  { id: "student", title: "Student or new graduate", icon: GraduationCap },
  { id: "early", title: "0-2 years", icon: Rocket, badge: "Most common" },
  { id: "mid", title: "3-5 years", icon: BriefcaseBusiness },
  { id: "switching", title: "Switching careers", icon: ArrowRight },
];

const timelineOptions: Option[] = [
  { id: "active", title: "Interviewing now", icon: Clock3, badge: "Intensive" },
  { id: "soon", title: "Applying this month", icon: CalendarClock },
  { id: "exploring", title: "Exploring for later", icon: Rocket },
];

interface OnboardingFlowProps {
  completionRedirectUrl?: string;
}

export function OnboardingFlow({
  completionRedirectUrl = "/today",
}: OnboardingFlowProps) {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [timeline, setTimeline] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [jdText, setJdText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeStep = steps[currentStep];
  const transition: Transition = reduceMotion ? { duration: 0 } : { duration: 0.52, ease: [0.16, 1, 0.3, 1] };
  const slideDistance = reduceMotion ? 0 : 18;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const visibleRoleOptions = showAllRoles ? roleOptions : roleOptions.slice(0, 4);
  const hiddenRoleCount = roleOptions.length - visibleRoleOptions.length;

  const selectedLabels = useMemo(
    () => ({
      role: getOptionTitle(roleOptions, role) || "Target role",
      experience: getOptionTitle(experienceOptions, experience) || "Experience",
      timeline: getOptionTitle(timelineOptions, timeline) || "Timeline",
    }),
    [experience, role, timeline],
  );

  function getStepValue(stepId = activeStep.id) {
    if (stepId === "role") return role;
    if (stepId === "experience") return experience;
    if (stepId === "timeline") return timeline;
    if (stepId === "resume") return resumeName;
    if (stepId === "job-description") return jdText.trim();
    if (stepId === "github") return githubUrl.trim();
    if (stepId === "linkedin") return linkedinUrl.trim();
    return "ready";
  }

  function selectOption(value: string) {
    if (activeStep.id === "role") setRole(value);
    if (activeStep.id === "experience") setExperience(value);
    if (activeStep.id === "timeline") setTimeline(value);
  }

  function goForward() {
    if (activeStep.id === "review") {
      void completeOnboarding();
      return;
    }

    setErrorMessage("");
    setDirection(1);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    if (currentStep === 0) {
      startRouteTransition();
      window.setTimeout(() => router.push("/"), reduceMotion ? 0 : 160);
      return;
    }

    setDirection(-1);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function saveDraft() {
    try {
      window.sessionStorage.setItem(
        "trailgrad:onboarding",
        JSON.stringify({
          role,
          experience,
          timeline,
          resumeName,
          jdText,
          githubUrl,
          linkedinUrl,
        }),
      );
    } catch {
      // Storage is a convenience for the next auth handoff, not a blocker.
    }
  }

  async function completeOnboarding() {
    setErrorMessage("");
    saveDraft();
    setGenerating(true);

    try {
      const response = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          experience,
          timeline,
          resumeName,
          jdText,
          githubUrl,
          linkedinUrl,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(payload?.error ?? "Unable to save onboarding.");
      }

      try {
        window.sessionStorage.removeItem("trailgrad:onboarding");
      } catch {
        // A stale draft is harmless if browser storage is unavailable.
      }

      startRouteTransition();
      window.setTimeout(
        () => router.replace(completionRedirectUrl),
        reduceMotion ? 0 : 450,
      );
    } catch (error) {
      setGenerating(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save onboarding.",
      );
    }
  }

  function startRouteTransition() {
    if (!reduceMotion) {
      window.dispatchEvent(new Event("trailgrad:route-transition-start"));
    }
  }

  const canContinue = activeStep.optional || Boolean(getStepValue()) || activeStep.id === "review";
  const primaryLabel =
    generating
      ? "Saving workspace"
      : activeStep.id === "review"
        ? "Save workspace"
        : activeStep.optional && !getStepValue()
          ? "Skip for now"
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
                direction={direction}
                measureKey={`${activeStep.id}-${showAllRoles ? "all" : "short"}`}
                slideDistance={slideDistance}
                stepKey={activeStep.id}
                transition={transition}
              >
                <StepHeading step={activeStep} reduceMotion={reduceMotion} />

                {activeStep.id === "role" && (
                  <StepOptions
                    options={visibleRoleOptions}
                    selected={role}
                    onSelect={selectOption}
                    spacious
                    footer={
                      !showAllRoles && hiddenRoleCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setShowAllRoles(true)}
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
                )}

                {activeStep.id === "experience" && (
                  <StepOptions options={experienceOptions} selected={experience} onSelect={selectOption} />
                )}

                {activeStep.id === "timeline" && (
                  <StepOptions options={timelineOptions} selected={timeline} onSelect={selectOption} />
                )}

                {activeStep.id === "resume" && (
                  <ResumeQuestion resumeName={resumeName} onResumeNameChange={setResumeName} />
                )}

                {activeStep.id === "job-description" && (
                  <JobDescriptionQuestion value={jdText} onChange={setJdText} />
                )}

                {activeStep.id === "github" && (
                  <UrlQuestion
                    icon={GitBranch}
                    label="GitHub profile URL"
                    placeholder="https://github.com/yourname"
                    value={githubUrl}
                    onChange={setGithubUrl}
                  />
                )}

                {activeStep.id === "linkedin" && (
                  <UrlQuestion
                    icon={Link2}
                    label="LinkedIn profile URL"
                    placeholder="https://linkedin.com/in/yourname"
                    value={linkedinUrl}
                    onChange={setLinkedinUrl}
                  />
                )}

                {activeStep.id === "review" && (
                  <ReviewStep
                    role={selectedLabels.role}
                    experience={selectedLabels.experience}
                    timeline={selectedLabels.timeline}
                    resumeName={resumeName}
                    hasJd={Boolean(jdText.trim())}
                    hasGithub={Boolean(githubUrl.trim())}
                    hasLinkedin={Boolean(linkedinUrl.trim())}
                  />
                )}
              </StepViewport>

              <motion.div layout className="relative mt-6">
                {errorMessage ? (
                  <p className="mb-3 rounded-lg border border-[#f3c7b8] bg-[#fff7f3] px-3 py-2 text-sm font-medium text-[#9b4f3f]" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <Button type="button" variant="ghost" onClick={goBack} className="h-11 rounded-lg px-3 text-[#4b5563] transition-all duration-500 hover:bg-[#edf6f3] focus-visible:!border-transparent focus-visible:!ring-0">
                    <ArrowLeft className="size-4" /> {currentStep === 0 ? "Back home" : "Back"}
                  </Button>
                  <Button
                    type="button"
                    onClick={goForward}
                    disabled={!canContinue || generating}
                    className="h-11 min-w-[150px] rounded-lg bg-[#0f9f8d] px-5 font-semibold text-white shadow-[0_14px_32px_rgba(15,159,141,0.24)] transition-all duration-500 hover:bg-[#0d8d7d] hover:shadow-[0_18px_38px_rgba(15,159,141,0.28)] focus-visible:!border-transparent focus-visible:!ring-0 sm:px-6"
                  >
                    {generating ? (
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
  children,
  direction,
  measureKey,
  slideDistance,
  stepKey,
  transition,
}: {
  children: ReactNode;
  direction: number;
  measureKey: string;
  slideDistance: number;
  stepKey: StepId;
  transition: Transition;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    const measure = () => {
      const nextHeight = Math.max(content.getBoundingClientRect().height, content.scrollHeight);

      if (nextHeight < 1) {
        return;
      }

      setHeight((currentHeight) =>
        currentHeight !== undefined && Math.abs(currentHeight - nextHeight) < 0.5 ? currentHeight : nextHeight,
      );
    };

    measure();
    frameRef.current = window.requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      observer.disconnect();
    };
  }, [measureKey]);

  return (
    <div
      className="tg-step-viewport relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      style={{ height: height === undefined ? "auto" : `${height}px` }}
    >
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={stepKey}
          custom={direction}
          initial={{ opacity: 0, x: direction * slideDistance, filter: "blur(5px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: direction * -slideDistance, filter: "blur(4px)" }}
          transition={transition}
          className={`tg-step-pane ${height === undefined ? "relative" : "absolute inset-x-0 top-0"} will-change-transform`}
        >
          <div ref={contentRef} className="pt-10">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
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
    </div>
  );
}

interface StepOptionsProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  spacious?: boolean;
  footer?: ReactNode;
}

function StepOptions({ options, selected, onSelect, spacious = false, footer }: StepOptionsProps) {
  return (
    <fieldset className={`mx-auto mt-10 ${spacious ? "max-w-[720px]" : "max-w-[620px]"} ${footer ? "pb-4" : ""}`}>
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
              className={`group relative flex min-h-[88px] items-center gap-4 overflow-hidden rounded-[16px] border p-4 text-left outline-none transition-[border-color,background-color,box-shadow] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                active
                  ? "border-[#20b8a4] bg-[#f0fdfa] shadow-[0_16px_34px_rgba(15,118,110,0.11)]"
                  : "border-[#e5e7eb] bg-white hover:border-[#b7ddd7] hover:bg-[#fbfffe] hover:shadow-[0_14px_34px_rgba(15,118,110,0.08)]"
              }`}
            >
              <span aria-hidden="true" className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
              <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] transition-all duration-1000 ${active ? "bg-[#0f9f8d] text-white shadow-[0_12px_24px_rgba(15,159,141,0.22)]" : "bg-[#f3f4f6] text-[#4b5563] group-hover:bg-[#ecfdf9] group-hover:text-[#0f766e]"}`}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#111827]">
                  {option.title}
                  {option.badge && <span className="rounded-full bg-[#fff2dc] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#966329]">{option.badge}</span>}
                </span>
              </span>
              <span className={`ml-auto grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-1000 ${active ? "border-[#2b9f8f] bg-[#2b9f8f] text-white" : "border-[#cadbd7] text-transparent group-hover:border-[#9ccfc6]"}`}>
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

function ResumeQuestion({
  resumeName,
  onResumeNameChange,
}: {
  resumeName: string;
  onResumeNameChange: (value: string) => void;
}) {
  return (
    <div className="mx-auto mt-9 max-w-[320px] pb-10">
      <label
        htmlFor="resume"
        className={`group flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-[22px] border bg-white p-6 text-center outline-none shadow-[0_8px_22px_rgba(15,118,110,0.028)] transition-[border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#9fd8d0] hover:bg-[#fdfffe] hover:shadow-[0_12px_28px_rgba(15,118,110,0.045)] ${
          resumeName ? "border-[#8fd5cb] bg-[#fbfffe]" : "border-[#e7ecea]"
        }`}
      >
        <input
          id="resume"
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => onResumeNameChange(event.target.files?.[0]?.name ?? "")}
        />
        <span className="grid size-16 place-items-center rounded-[18px] border border-[#dff2ee] bg-[#effbf8] text-[#0f9f8d] transition-transform duration-700 group-hover:scale-[1.025]">
          {resumeName ? <FileCheck2 className="size-7" /> : <FileUp className="size-7" />}
        </span>

        <span className="mt-5 block max-w-full truncate text-base font-semibold text-[#111827]">
          {resumeName || "Upload PDF resume"}
        </span>
        <span className="mt-2 text-sm font-medium text-[#6b7280]">
          {resumeName ? "PDF selected" : "PDF"}
        </span>
        <span className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d7e8e3] bg-white px-3 text-sm font-semibold text-[#0f766e] transition-colors duration-500 group-hover:border-[#9fd8d0] group-hover:bg-[#f4fbf9]">
          {resumeName ? "Change PDF" : "Browse PDF"}
          {resumeName ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </span>
      </label>
    </div>
  );
}

function JobDescriptionQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mx-auto mt-9 max-w-[620px] pb-10">
      <textarea
        aria-label="Target job description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste the job description or the key requirements..."
        className="tg-slim-scrollbar min-h-[180px] w-full resize-none rounded-[16px] border border-[#e5e7eb] bg-[#fcfdfd] p-4 text-sm leading-6 text-[#111827] outline-none transition-colors duration-500 placeholder:text-[#9ca3af] focus:border-[#8bcfc5] focus:bg-white"
      />
    </div>
  );
}

function UrlQuestion({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mx-auto mt-9 max-w-[560px] pb-10">
      <label htmlFor={label} className="text-sm font-semibold text-[#111827]">
        {label}
      </label>
      <div className="relative mt-3">
        <Icon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6b7280]" />
        <Input
          id={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-13 rounded-[14px] border-[#e5e7eb] bg-[#fcfdfd] pl-11 text-sm text-[#111827] transition-colors duration-500 placeholder:text-[#9ca3af] focus-visible:border-[#8bcfc5] focus-visible:bg-white focus-visible:!ring-0"
        />
      </div>
    </div>
  );
}

function ReviewStep({
  role,
  experience,
  timeline,
  resumeName,
  hasJd,
  hasGithub,
  hasLinkedin,
}: {
  role: string;
  experience: string;
  timeline: string;
  resumeName: string;
  hasJd: boolean;
  hasGithub: boolean;
  hasLinkedin: boolean;
}) {
  const evidence = [
    resumeName ? "Resume added" : "Resume later",
    hasJd ? "JD added" : "JD later",
    hasGithub ? "GitHub added" : "GitHub later",
    hasLinkedin ? "LinkedIn added" : "LinkedIn later",
  ];

  return (
    <div className="mx-auto mt-9 max-w-[680px] pb-8">
      <div className="rounded-[18px] bg-[#fcfdfd] p-4 shadow-[0_8px_24px_rgba(15,118,110,0.035)]">
        <div className="grid gap-3 sm:grid-cols-3">
          {[role, experience, timeline].map((item) => (
            <div key={item} className="rounded-[14px] bg-white p-4 ring-1 ring-[#e5e7eb]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Signal</p>
              <p className="mt-2 text-sm font-semibold text-[#111827]">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {evidence.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e8e3] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563]">
              <Check className="size-3.5 text-[#159b89]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function getOptionTitle(options: Option[], value: string) {
  return options.find((option) => option.id === value)?.title;
}
