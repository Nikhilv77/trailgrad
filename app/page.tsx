import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { Lobster_Two } from "next/font/google";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck,
  Check,
  CirclePlay,
  ClipboardList,
  Code2,
  FileText,
  Folder,
  ListChecks,
  Mic,
  Sparkles,
  Star,
  Target,
  Trophy,
  UploadCloud,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
});

type IconCard = {
  label: string;
  icon: LucideIcon;
  color: string;
  surface: string;
};

const improveOptions: IconCard[] = [
  { label: "Resume Review", icon: FileText, color: "text-[#5f58f7]", surface: "bg-[#f7f6ff]" },
  { label: "Interview Prep", icon: Mic, color: "text-[#7b50f2]", surface: "bg-[#fbf7ff]" },
  { label: "Project Deep Dive", icon: Code2, color: "text-[#229986]", surface: "bg-[#f7fcfb]" },
  { label: "JD Match", icon: Target, color: "text-[#229986]", surface: "bg-[#f8fcfb]" },
  { label: "AI Feedback", icon: Sparkles, color: "text-[#f19112]", surface: "bg-[#fffaf6]" },
  { label: "Practice Plan", icon: CalendarCheck, color: "text-[#fb3f5c]", surface: "bg-[#fff7fb]" },
];

const processSteps: IconCard[] = [
  { label: "Upload resume", icon: UploadCloud, color: "text-[#5f58f7]", surface: "bg-[#f2f0ff]" },
  { label: "Add details", icon: ClipboardList, color: "text-[#5f58f7]", surface: "bg-[#f2f0ff]" },
  { label: "Add projects", icon: Code2, color: "text-[#5f58f7]", surface: "bg-[#f2f0ff]" },
  { label: "Get risk report", icon: BarChart3, color: "text-[#5f58f7]", surface: "bg-[#f2f0ff]" },
  { label: "Practice", icon: Target, color: "text-[#5f58f7]", surface: "bg-[#f2f0ff]" },
  { label: "Improve", icon: Trophy, color: "text-[#5f58f7]", surface: "bg-[#f2f0ff]" },
];

const sprintSteps: IconCard[] = [
  { label: "Resume Fixes", icon: FileText, color: "text-[#5f58f7]", surface: "bg-[#f5f3ff]" },
  { label: "Project Deep-Dive", icon: Folder, color: "text-[#4d6dff]", surface: "bg-[#f4f7ff]" },
  { label: "Mock Interview", icon: Mic, color: "text-[#8a51f4]", surface: "bg-[#faf5ff]" },
  { label: "AI Answer Feedback", icon: ListChecks, color: "text-[#ef940e]", surface: "bg-[#fff8ef]" },
  { label: "Final Score", icon: Trophy, color: "text-[#26a48d]", surface: "bg-[#f1fbf8]" },
];

const socialAvatars = [
  "/trailgrad-user-1.png",
  "/trailgrad-user-2.png",
  "/trailgrad-user-3.png",
  "/trailgrad-user-4.png",
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="TrailGrad home">
      <Image
        src="/trailgrad-logo.png"
        alt=""
        width={172}
        height={194}
        className={compact ? "h-7 w-auto" : "h-[38px] w-auto"}
        priority
      />
      <span className={`${lobsterTwo.className} ${compact ? "text-[22px]" : "text-[30px]"} font-semibold leading-none tracking-[0] text-[#07133f]`}>
        Trailgrad
      </span>
    </Link>
  );
}

function HeroImage() {
  return (
    <div className="relative z-0 mx-auto h-[470px] w-full max-w-[630px] overflow-visible sm:h-[560px] lg:-ml-4 lg:h-[575px]">
      <Image
        src="/trailgrad-hero-v4.png"
        alt="TrailGrad interview readiness dashboard preview"
        width={1254}
        height={1254}
        priority
        unoptimized
        className="absolute left-1/2 top-[-8px] w-[520px] max-w-none -translate-x-1/2 sm:w-[650px] lg:top-[-36px] lg:w-[650px]"
      />
    </div>
  );
}

function ImproveStrip() {
  return (
    <section className="rounded-[18px] border border-[#ececf8] bg-white/90 px-8 py-7 shadow-[0_20px_60px_rgba(35,31,89,0.07)]">
      <div className="flex items-center justify-center gap-3 text-sm font-bold uppercase text-[#07133f]">
        <Sparkles className="size-4 text-[#6258f6]" />
        Choose what to improve
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-6 md:gap-0">
        {improveOptions.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="relative px-4">
              {index > 0 && <span className="absolute left-0 top-2 hidden h-[88px] w-px bg-[#e8e9f5] md:block" />}
              <div className={`${item.surface} grid h-[124px] place-items-center rounded-[12px] border border-[#ececf8] px-3 text-center`}>
                <Icon className={`size-10 ${item.color}`} strokeWidth={2.1} />
                <p className="mt-4 text-sm font-bold leading-5 text-[#07133f]">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-7">
      <div className="flex items-center justify-center gap-3 text-sm font-bold uppercase text-[#5d54f6]">
        <Sparkles className="size-4" />
        How TrailGrad Works
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-6 md:gap-3">
        {processSteps.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="relative grid place-items-center text-center">
              <div className={`${item.surface} grid size-[64px] place-items-center rounded-full text-[#5f58f7] shadow-[0_12px_32px_rgba(95,88,247,0.12)]`}>
                <Icon className="size-8" strokeWidth={2} />
              </div>
              <p className="mt-4 text-sm font-bold text-[#07133f]">{item.label}</p>
              {index < processSteps.length - 1 && (
                <div className="absolute left-[64%] top-[31px] hidden w-[72%] items-center md:flex">
                  <span className="h-px flex-1 border-t border-dashed border-[#aaa3ff]" />
                  <ArrowRight className="size-4 text-[#aaa3ff]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SprintCard() {
  return (
    <section className="grid gap-6 rounded-[14px] border border-[#ececf8] bg-[linear-gradient(100deg,#f7f5ff_0%,#ffffff_42%,#ffffff_100%)] p-6 shadow-[0_18px_54px_rgba(35,31,89,0.06)] lg:grid-cols-[0.3fr_0.7fr]">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold uppercase text-[#6258f6]">Your First Sprint</p>
        <h2 className="mt-3 max-w-[300px] text-3xl font-bold leading-tight text-[#07133f]">
          7-Day Interview Readiness Sprint
        </h2>
        <Link
          href="/onboarding"
          className={buttonVariants({
            className: "mt-6 h-12 w-fit rounded-[10px] px-7 text-sm font-bold text-white shadow-[0_16px_30px_rgba(98,88,247,0.24)]",
          })}
          style={{ background: "linear-gradient(135deg, #5f58f7 0%, #7c58f7 100%)" }}
        >
          Start This Sprint <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid rounded-[14px] border border-[#ececf8] bg-white shadow-[0_15px_38px_rgba(40,37,95,0.05)] md:grid-cols-5">
        {sprintSteps.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="relative grid min-h-[138px] place-items-center px-4 text-center">
              {index > 0 && <span className="absolute left-0 top-6 hidden h-[88px] w-px bg-[#e7e8f3] md:block" />}
              <span className={`${item.surface} grid size-14 place-items-center rounded-[14px]`}>
                <Icon className={`size-8 ${item.color}`} />
              </span>
              <p className="text-sm font-bold leading-5 text-[#07133f]">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ScoreCircle() {
  return (
    <div className="grid size-[112px] place-items-center rounded-full bg-[conic-gradient(from_-24deg,#5f58f7_0deg,#5f58f7_267deg,#ddd9ff_268deg,#ddd9ff_360deg)]">
      <div className="grid size-[88px] place-items-center rounded-full bg-white text-center">
        <p className="text-4xl font-bold leading-none text-[#07133f]">74</p>
        <p className="text-xs font-bold text-[#59617d]">/100</p>
      </div>
    </div>
  );
}

function BotIllustration() {
  return (
    <div className="relative hidden min-h-[118px] place-items-center lg:grid">
      <span className="absolute inset-y-2 left-8 right-2 rounded-full bg-[#f3f0ff]" />
      <Bot className="relative z-10 size-24 text-[#6258f6]" strokeWidth={1.8} />
      <span className="absolute left-10 top-8 h-3 w-9 rounded-full bg-white shadow-sm" />
      <span className="absolute right-8 top-9 h-3 w-8 rounded-full bg-white shadow-sm" />
      <Sparkles className="absolute right-4 top-4 size-5 text-[#b0a8ff]" />
      <Sparkles className="absolute left-4 bottom-6 size-4 text-[#b0a8ff]" />
    </div>
  );
}

function ReportSnapshot() {
  return (
    <section className="grid gap-6 rounded-[14px] border border-[#ececf8] bg-white p-7 shadow-[0_18px_54px_rgba(35,31,89,0.06)] lg:grid-cols-[0.16fr_0.26fr_0.22fr_0.22fr_0.14fr]">
      <div className="grid place-items-center border-[#e7e8f3] lg:border-r">
        <p className="mb-3 w-full text-sm font-bold text-[#07133f]">Overall Score</p>
        <ScoreCircle />
      </div>

      <div className="border-[#e7e8f3] lg:border-r lg:pr-8">
        <p className="text-sm font-bold text-[#07133f]">Breakdown</p>
        {[
          ["Clarity", "8/10", "w-[88%]", "bg-[#4f6dff]"],
          ["Technical Depth", "7/10", "w-[76%]", "bg-[#8b50f4]"],
          ["Confidence", "8/10", "w-[86%]", "bg-[#ff961c]"],
        ].map(([label, score, width, color]) => (
          <div key={label} className="mt-4">
            <div className="flex justify-between text-xs font-medium text-[#59617d]">
              <span>{label}</span>
              <span>{score}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#edf0fb]">
              <div className={`h-full rounded-full ${width} ${color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-[#e7e8f3] lg:border-r lg:pr-8">
        <p className="text-sm font-bold text-[#07133f]">What went well</p>
        {["Clear explanation", "Good project structure"].map((item) => (
          <p key={item} className="mt-5 flex items-center gap-3 text-sm text-[#59617d]">
            <Check className="size-4 rounded-full bg-[#e6fbf4] p-0.5 text-[#26a48d]" />
            {item}
          </p>
        ))}
      </div>

      <div className="border-[#e7e8f3] lg:border-r lg:pr-8">
        <p className="text-sm font-bold text-[#07133f]">Improve next</p>
        {["Add tradeoffs", "Explain metrics"].map((item) => (
          <p key={item} className="mt-5 flex items-center gap-3 text-sm text-[#59617d]">
            <span className="grid size-4 place-items-center rounded-full bg-[#fff2dc] text-[10px] font-bold text-[#ff9f1a]">!</span>
            {item}
          </p>
        ))}
      </div>

      <BotIllustration />
    </section>
  );
}

function FinalCta() {
  return (
    <section
      className="flex flex-col gap-5 rounded-[14px] px-8 py-6 text-white shadow-[0_18px_42px_rgba(98,88,247,0.18)] md:flex-row md:items-center md:justify-between"
      style={{ background: "linear-gradient(135deg, #514cf5 0%, #875cf8 100%)" }}
    >
      <div className="flex items-center gap-5">
        <span className="grid size-16 place-items-center rounded-[18px] bg-white/10">
          <Target className="size-9" />
        </span>
        <div>
          <h2 className="text-2xl font-bold">Stop guessing. Start preparing smarter.</h2>
          <p className="mt-1 text-base text-white/90">TrailGrad shows exactly what to fix before the interviewer finds it.</p>
        </div>
      </div>
      <Link
        href="/onboarding"
        className={buttonVariants({
          variant: "outline",
          className: "h-12 rounded-[10px] border-white bg-white px-8 text-sm font-bold text-[#07133f] hover:bg-white/95",
        })}
      >
        Get Started Free <ArrowRight className="size-4 text-[#6258f6]" />
      </Link>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfcff] text-[#07133f]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(226,219,255,0.68)_0%,rgba(255,255,255,0)_32%),radial-gradient(circle_at_86%_10%,rgba(226,246,255,0.78)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_72%_78%,rgba(255,244,225,0.6)_0%,rgba(255,255,255,0)_34%),linear-gradient(180deg,#ffffff_0%,#fbfaff_42%,#f8fbff_100%)]" />
        <div className="absolute -left-44 top-36 h-[560px] w-[560px] rounded-full bg-[#ebe6ff]/60 blur-3xl" />
        <div className="absolute -right-48 top-20 h-[620px] w-[620px] rounded-full bg-[#e8f8ff]/65 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[18%] h-[520px] w-[680px] rounded-full bg-[#fff1d8]/55 blur-3xl" />
        <div className="absolute right-0 top-28 h-[760px] w-[54vw] opacity-35 [background-image:radial-gradient(#c9c2ff_1.1px,transparent_1.1px)] [background-size:26px_26px]" />
        <div className="absolute left-[-80px] top-[720px] h-[360px] w-[420px] opacity-25 [background-image:radial-gradient(#bfb6ff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 pb-8 pt-8 sm:px-8 lg:px-10">
        <nav className="flex h-[54px] items-center justify-between">
          <Brand />
          <Link
            href="/onboarding"
            className={buttonVariants({
              className: "h-[46px] w-[158px] gap-2.5 rounded-[12px] px-0 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(98,88,247,0.24)]",
            })}
            style={{ background: "linear-gradient(135deg, #5b54f5 0%, #7c58f7 100%)" }}
          >
            Get Started <ArrowRight className="size-5" />
          </Link>
        </nav>

        <section className="relative isolate grid items-center gap-6 pb-10 pt-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8 lg:pb-8 lg:pt-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[-56px] top-4 -z-10 h-[610px] overflow-hidden rounded-[36px]">
            <div className="absolute right-[70px] top-[74px] h-[320px] w-[440px] opacity-65 [background-image:radial-gradient(#beb8ff_1.2px,transparent_1.2px)] [background-size:22px_22px]" />
            <div className="absolute right-[90px] top-[118px] h-[1px] w-[470px] rotate-[-10deg] bg-[linear-gradient(90deg,transparent,#c6beff,transparent)]" />
            <div className="absolute right-[80px] top-[410px] h-[1px] w-[420px] rotate-[7deg] bg-[linear-gradient(90deg,transparent,#d9d2ff,transparent)]" />
            <div className="absolute right-[210px] bottom-[38px] grid size-12 place-items-center rounded-[15px] border border-[#fff0d8] bg-white/76 text-[#f19112] shadow-[0_18px_42px_rgba(241,145,18,0.1)]">
              <BarChart3 className="size-6" />
            </div>
          </div>
          <div className="relative z-10 max-w-[520px]">

            <h1 className="mt-8 text-[48px] font-bold leading-[1.17] tracking-[0] text-[#07133f] sm:text-[54px]">
              Know your
              <br />
              rejection risks
              <br />
              <span className="whitespace-nowrap">
                before <span className="text-[#6258f6]">the interview.</span>
              </span>
            </h1>

            <div className="mt-9 space-y-4">
              {["Analyze your profile & projects", "Find weak points", "Get a clear practice plan"].map((item) => (
                <p key={item} className="flex items-center gap-4 text-[17px] text-[#4d5478]">
                  <Check className="size-5 rounded-full bg-[#6258f6] p-1 text-white" strokeWidth={3} />
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/onboarding"
                className={buttonVariants({
                  className: "h-[58px] w-[206px] rounded-[12px] px-0 text-[16px] font-bold text-white shadow-[0_18px_36px_rgba(98,88,247,0.28)]",
                })}
                style={{ background: "linear-gradient(135deg, #5f58f7 0%, #7e58f7 100%)" }}
              >
                Start Free Analysis <ArrowRight className="size-5" />
              </Link>
              <Link
                href="#how"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-[58px] w-[174px] rounded-[12px] border-[#dfe2f2] bg-white px-0 text-[15px] font-bold text-[#07133f] shadow-[0_12px_28px_rgba(36,31,98,0.04)] hover:bg-white",
                })}
              >
                <CirclePlay className="size-[22px] text-[#6258f6]" />
                See how it works
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <div className="flex -space-x-2.5">
                {socialAvatars.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={96}
                    height={96}
                    className="size-9 rounded-full object-cover"
                    priority={index === 0}
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex text-[#ffb11b]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-base font-bold text-[#07133f]">10,000+ users</span>
                </div>
                <p className="mt-1 text-sm text-[#59617d]">Students, freshers & working professionals</p>
              </div>
            </div>
          </div>

          <HeroImage />
        </section>

        <div className="space-y-8">
          <ImproveStrip />
          <div id="how">
            <HowItWorks />
          </div>
          <SprintCard />
          <ReportSnapshot />
          <FinalCta />
        </div>

        <footer className="flex flex-col gap-5 px-2 py-7 text-sm text-[#59617d] sm:flex-row sm:items-center sm:justify-between">
          <Brand compact />
          <div className="flex flex-wrap gap-12">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex gap-3">
            {["t", "in", "m"].map((item) => (
              <span key={item} className="grid size-10 place-items-center rounded-[10px] bg-[#f0f2fb] font-bold text-[#59617d]">
                {item}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
