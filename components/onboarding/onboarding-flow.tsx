"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  Clock3,
  Code2,
  FileText,
  GitBranch,
  GraduationCap,
  Layers3,
  Link2,
  LoaderCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { SiteBrand } from "@/components/marketing/site-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

const steps = [
  { label: "Your goal", helper: "What you’re aiming for" },
  { label: "Experience", helper: "Where you’re starting" },
  { label: "Timeline", helper: "How fast to move" },
  { label: "Career context", helper: "Evidence for your plan" },
] as const;

const roleOptions: Option[] = [
  { id: "ai-engineer", title: "AI Engineer", description: "LLMs, RAG, agents, and applied ML systems", icon: Sparkles, badge: "Popular" },
  { id: "software-engineer", title: "Software Engineer", description: "Product engineering, backend, or full stack", icon: Code2 },
  { id: "data-scientist", title: "Data Scientist", description: "Modeling, experiments, and business insights", icon: Layers3 },
  { id: "product", title: "Product & strategy", description: "Product roles with a strong technical edge", icon: BriefcaseBusiness },
];

const experienceOptions: Option[] = [
  { id: "student", title: "Student or new graduate", description: "Building proof through projects and internships", icon: GraduationCap },
  { id: "early", title: "0–2 years", description: "Turning early work into compelling evidence", icon: Rocket, badge: "Most common" },
  { id: "mid", title: "3–5 years", description: "Positioning for deeper scope and ownership", icon: BriefcaseBusiness },
  { id: "switching", title: "Switching careers", description: "Translating existing strengths into a new field", icon: ArrowRight },
];

const timelineOptions: Option[] = [
  { id: "active", title: "Interviewing now", description: "I need a focused plan for the next 1–2 weeks", icon: Clock3, badge: "Intensive" },
  { id: "soon", title: "Applying this month", description: "I want to be ready before interviews land", icon: CalendarClock },
  { id: "exploring", title: "Exploring for later", description: "I’m strengthening my profile proactively", icon: Rocket },
];

export function OnboardingFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [timeline, setTimeline] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!generating) return;

    const timer = window.setTimeout(() => router.push("/dashboard"), 850);
    return () => window.clearTimeout(timer);
  }, [generating, router]);

  const activeValue = currentStep === 0 ? role : currentStep === 1 ? experience : currentStep === 2 ? timeline : "ready";

  function selectOption(value: string) {
    if (currentStep === 0) setRole(value);
    if (currentStep === 1) setExperience(value);
    if (currentStep === 2) setTimeline(value);
  }

  function goForward() {
    if (currentStep === steps.length - 1) {
      setGenerating(true);
      return;
    }

    setDirection(1);
    setCurrentStep((step) => step + 1);
  }

  function goBack() {
    if (currentStep === 0) {
      router.push("/");
      return;
    }

    setDirection(-1);
    setCurrentStep((step) => step - 1);
  }

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };
  const slideDistance = reduceMotion ? 0 : 22;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3faf8] text-[#153f3a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_5%_8%,rgba(115,219,199,0.2),transparent_25%),radial-gradient(circle_at_95%_90%,rgba(240,184,110,0.13),transparent_24%)]" />
      <div className="tg-grid absolute inset-0 opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col p-4 sm:p-6 lg:p-8">
        <header className="flex h-12 items-center justify-between px-1 lg:px-2">
          <SiteBrand compact />
          <div className="hidden items-center gap-2 rounded-full border border-[#d7e7e3] bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[#64807a] sm:flex">
            <ShieldCheck className="size-3.5 text-[#269b89]" />
            Your data stays private
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[1220px] flex-1 items-stretch gap-5 py-6 lg:grid-cols-[320px_1fr] lg:py-8">
          <aside className="hidden overflow-hidden rounded-[28px] bg-[#123f3a] p-7 text-white shadow-[0_26px_70px_rgba(18,63,58,0.17)] lg:flex lg:flex-col">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#76d9c5]">Set up your trail</p>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.08] tracking-[-0.04em]">A plan shaped around your actual goal.</h2>
              <p className="mt-4 text-sm leading-6 text-white/52">Four quick steps give TrailGrad enough context to prioritize the right gaps.</p>
            </div>

            <ol className="mt-10 space-y-1">
              {steps.map((step, index) => {
                const complete = index < currentStep;
                const active = index === currentStep;

                return (
                  <li key={step.label} className={`relative flex gap-4 rounded-2xl p-3.5 transition-colors ${active ? "bg-white/9" : ""}`}>
                    {index < steps.length - 1 && (
                      <span className={`absolute left-[27px] top-[43px] h-[29px] w-px ${complete ? "bg-[#67ceb9]" : "bg-white/12"}`} />
                    )}
                    <span className={`relative grid size-7 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${
                      complete
                        ? "border-[#72d7c3] bg-[#72d7c3] text-[#123f3a]"
                        : active
                          ? "border-[#78dbc8] bg-[#78dbc8]/12 text-[#8ee4d3]"
                          : "border-white/15 text-white/35"
                    }`}>
                      {complete ? <Check className="size-3.5" /> : index + 1}
                    </span>
                    <div>
                      <p className={`text-[13px] font-semibold ${active || complete ? "text-white" : "text-white/38"}`}>{step.label}</p>
                      <p className={`mt-1 text-[10px] ${active ? "text-white/48" : "text-white/25"}`}>{step.helper}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-auto rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-[#78dbc8]/12 text-[#82e0ce]">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Personalized, not generic</p>
                  <p className="mt-1 text-[10px] text-white/38">Every action maps back to your inputs.</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-[650px] flex-col overflow-hidden rounded-[28px] border border-white bg-white/88 p-5 shadow-[0_26px_80px_rgba(22,78,70,0.1)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#718782]">
                <span className="font-mono text-[#218c7c]">0{currentStep + 1}</span>
                <span className="h-px w-7 bg-[#cfdfdb]" />
                <span>0{steps.length}</span>
              </div>
              <span className="text-[11px] font-medium text-[#78908b]">About 2 minutes</span>
            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-[#eaf2f0] lg:hidden">
              <motion.div
                className="h-full rounded-full bg-[#2cae9b]"
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={transition}
              />
            </div>

            <div className="relative flex flex-1 flex-col pt-8 sm:pt-10">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * slideDistance }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -slideDistance }}
                  transition={transition}
                  className="flex flex-1 flex-col"
                >
                  {currentStep === 0 && (
                    <StepOptions
                      eyebrow="Your target"
                      title="Where are you headed?"
                      description="Choose the role you want TrailGrad to benchmark your profile against."
                      options={roleOptions}
                      selected={role}
                      onSelect={selectOption}
                    />
                  )}

                  {currentStep === 1 && (
                    <StepOptions
                      eyebrow="Your starting point"
                      title="Tell us where you are now."
                      description="This changes the proof level and interview depth we’ll expect from you."
                      options={experienceOptions}
                      selected={experience}
                      onSelect={selectOption}
                    />
                  )}

                  {currentStep === 2 && (
                    <StepOptions
                      eyebrow="Your pace"
                      title="When do you want to be ready?"
                      description="We’ll size your daily plan around the time and energy you actually have."
                      options={timelineOptions}
                      selected={timeline}
                      onSelect={selectOption}
                      compact
                    />
                  )}

                  {currentStep === 3 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#249481]">Your evidence</p>
                      <h1 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#143d39] sm:text-[42px]">Add your career context.</h1>
                      <p className="mt-4 max-w-[590px] text-sm leading-6 text-[#6e827e] sm:text-[15px]">Start with a resume. GitHub and LinkedIn help us connect your claims to stronger proof.</p>

                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <label htmlFor="resume" className="group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#bcd7d1] bg-[#f5faf8] p-6 text-center outline-none transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-[#5db8aa] hover:bg-[#eff8f5] focus-within:ring-2 focus-within:ring-[#4fb5a5]/30">
                          <input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="sr-only"
                            onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? "")}
                          />
                          <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#238d7d] shadow-sm ring-1 ring-[#deebe8]">
                            {resumeName ? <Check className="size-5" /> : <UploadCloud className="size-5" />}
                          </span>
                          <span className="mt-4 text-sm font-semibold text-[#214943]">{resumeName || "Upload your resume"}</span>
                          <span className="mt-1.5 text-[11px] text-[#849692]">PDF or DOCX · up to 10 MB</span>
                        </label>

                        <div className="flex min-h-44 flex-col rounded-[20px] border border-[#dce9e6] bg-white p-5">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 place-items-center rounded-xl bg-[#e7f5f1] text-[#2a8376]">
                              <FileText className="size-4.5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-[#234943]">Target job description</p>
                              <p className="mt-0.5 text-[10px] text-[#879995]">Optional, but improves your match score</p>
                            </div>
                          </div>
                          <textarea
                            aria-label="Target job description"
                            placeholder="Paste the job description or key requirements…"
                            className="mt-4 min-h-20 flex-1 resize-none rounded-xl border border-[#dfebe8] bg-[#f8fbfa] p-3 text-xs text-[#294e48] outline-none placeholder:text-[#a2b1ae] focus:border-[#62b8ab] focus:ring-2 focus:ring-[#5ec1b2]/15"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <GitBranch className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#708782]" />
                          <Input aria-label="GitHub profile URL" placeholder="GitHub profile URL" className="h-12 rounded-xl border-[#dce9e6] pl-10 text-sm focus-visible:border-[#5db8aa] focus-visible:ring-[#5db8aa]/15" />
                        </div>
                        <div className="relative">
                          <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#708782]" />
                          <Input aria-label="LinkedIn profile URL" placeholder="LinkedIn profile URL" className="h-12 rounded-xl border-[#dce9e6] pl-10 text-sm focus-visible:border-[#5db8aa] focus-visible:ring-[#5db8aa]/15" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#e7efed] pt-5">
              <Button type="button" variant="ghost" onClick={goBack} className="h-11 rounded-xl px-3 text-[#53716b] hover:bg-[#edf6f3]">
                <ArrowLeft className="size-4" /> {currentStep === 0 ? "Back home" : "Back"}
              </Button>
              <Button
                type="button"
                onClick={goForward}
                disabled={!activeValue || generating}
                className="h-11 rounded-xl bg-[#123f3a] px-5 font-semibold text-white shadow-[0_12px_28px_rgba(18,63,58,0.17)] hover:bg-[#0e342f] sm:px-6"
              >
                {generating ? (
                  <><LoaderCircle className="size-4 animate-spin" /> Building your map</>
                ) : currentStep === steps.length - 1 ? (
                  <>Build my workspace <Sparkles className="size-4" /></>
                ) : (
                  <>Continue <ArrowRight className="size-4" /></>
                )}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

interface StepOptionsProps {
  eyebrow: string;
  title: string;
  description: string;
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  compact?: boolean;
}

function StepOptions({ eyebrow, title, description, options, selected, onSelect, compact = false }: StepOptionsProps) {
  return (
    <fieldset>
      <legend className="sr-only">{title}</legend>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#249481]">{eyebrow}</p>
      <h1 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#143d39] sm:text-[42px]">{title}</h1>
      <p className="mt-4 max-w-[590px] text-sm leading-6 text-[#6e827e] sm:text-[15px]">{description}</p>

      <div className={`mt-8 grid gap-3.5 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
        {options.map((option) => {
          const active = option.id === selected;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={`group relative flex min-h-[112px] items-start gap-4 rounded-[18px] border p-4 text-left outline-none transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#55b6a7]/35 ${
                active
                  ? "border-[#4caf9f] bg-[#eff9f6] shadow-[0_10px_28px_rgba(34,126,113,0.09)]"
                  : "border-[#dce9e6] bg-white hover:border-[#acd4cb] hover:bg-[#fbfdfc]"
              }`}
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] transition-colors ${active ? "bg-[#1b8f7e] text-white" : "bg-[#edf6f3] text-[#387b71] group-hover:bg-[#e3f2ee]"}`}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#214943]">
                  {option.title}
                  {option.badge && <span className="rounded-full bg-[#fff2dc] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#966329]">{option.badge}</span>}
                </span>
                <span className="mt-1.5 block text-[11px] leading-5 text-[#7c918d]">{option.description}</span>
              </span>
              <span className={`ml-auto mt-1 grid size-5 shrink-0 place-items-center rounded-full border ${active ? "border-[#2b9f8f] bg-[#2b9f8f] text-white" : "border-[#cadbd7] text-transparent"}`}>
                <Check className="size-3" />
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
