"use client";

import { SignOutButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Flame,
  Home,
  Layers3,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

import { SiteBrand } from "@/components/marketing/site-brand";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { mockDashboard } from "@/lib/mock/dashboard";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}

interface FocusSignal {
  id: string;
  label: string;
  metric: string;
  summary: string;
  action: string;
  tone: "teal" | "amber" | "coral";
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { label: "Overview", icon: Home, href: "#overview", active: true },
  { label: "Readiness", icon: BarChart3, href: "#readiness" },
  { label: "Risks", icon: ShieldAlert, href: "#risks" },
  { label: "Practice", icon: MessageSquareText, href: "#practice" },
  { label: "Projects", icon: BriefcaseBusiness, href: "#projects" },
];

const supportNavigation: NavItem[] = [
  { label: "Profile", icon: UserRound, href: "#profile" },
  { label: "Settings", icon: Settings, href: "#settings" },
  { label: "Help center", icon: CircleHelp, href: "#help" },
];

const focusSignals: FocusSignal[] = [
  {
    id: "project-proof",
    label: "Project proof",
    metric: "84",
    summary: "Your strongest signal. Tie it to measurable evaluation and deployment context.",
    action: "Add one metric to the RAG project story.",
    tone: "teal",
    icon: Layers3,
  },
  {
    id: "technical-depth",
    label: "Technical depth",
    metric: "57",
    summary: "The biggest interview unlock. Practice vector DB tradeoffs before applying.",
    action: "Answer 5 retrieval questions.",
    tone: "amber",
    icon: Brain,
  },
  {
    id: "system-design",
    label: "System design",
    metric: "43",
    summary: "This is still thin. Show architecture choices, failure modes, and scaling limits.",
    action: "Map the RAG architecture in 6 blocks.",
    tone: "coral",
    icon: Target,
  },
];

const readinessSkills = [
  { label: "Resume proof", value: 84, change: "+12", tone: "teal" },
  { label: "Project narrative", value: 68, change: "+8", tone: "teal" },
  { label: "Technical depth", value: 57, change: "+4", tone: "amber" },
  { label: "System design", value: 43, change: "+2", tone: "coral" },
];

const chartPoints = "0,92 42,87 84,78 126,82 168,62 210,65 252,49 294,54 336,35 378,28 420,18";

const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function DashboardShell() {
  const reduceMotion = usePrefersReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("today");
  const [selectedSignal, setSelectedSignal] = useState(focusSignals[1].id);
  const [expandedRisk, setExpandedRisk] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>(["today-1"]);

  const selectedFocus = useMemo(
    () => focusSignals.find((signal) => signal.id === selectedSignal) ?? focusSignals[0],
    [selectedSignal],
  );

  const completionPercent = Math.round(
    (completedTasks.length / mockDashboard.todayPlan.length) * 100,
  );

  function toggleTask(taskId: string) {
    setCompletedTasks((tasks) =>
      tasks.includes(taskId) ? tasks.filter((id) => id !== taskId) : [...tasks, taskId],
    );
  }

  const rise = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] text-[#123f3a]">
      <DashboardAmbient />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[286px_1fr]">
        <DesktopSidebar />

        {menuOpen ? (
          <MobileSidebar
            reduceMotion={reduceMotion}
            onClose={() => setMenuOpen(false)}
          />
        ) : null}

        <section className="min-w-0 px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6 xl:px-10">
          <TopBar onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />

          <div id="overview" className="mx-auto max-w-[1420px]">
            <motion.section
              {...rise}
              transition={{ duration: 0.42 }}
              className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]"
            >
              <section className="relative overflow-hidden rounded-lg border border-white/85 bg-white/78 p-5 shadow-[0_22px_70px_rgba(15,118,110,0.10)] backdrop-blur-2xl sm:p-6 lg:p-7">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.84),rgba(255,255,255,0.32)_44%,rgba(20,184,166,0.08))]" />
                <div className="relative grid gap-7 lg:grid-cols-[1fr_260px] lg:items-center">
                  <div>
                    <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#cce8e3] bg-[#f4fffc] px-3 text-[11px] font-semibold uppercase text-[#128b7c]">
                      <Sparkles className="size-3.5" />
                      Readiness cockpit
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-[12px] font-semibold text-[#66827c]">
                          <CalendarDays className="size-4 text-[#159b89]" />
                          Today&apos;s focus
                        </p>
                        <h1 className="mt-2 max-w-[620px] text-[34px] font-semibold leading-[1.02] tracking-normal text-[#082f35] sm:text-[44px]">
                          Good morning, Arjun.
                        </h1>
                      </div>
                      <Button className="h-10 w-full rounded-lg bg-[#123f3a] px-4 text-[13px] font-semibold text-white shadow-[0_14px_34px_rgba(18,63,58,0.18)] hover:bg-[#0e342f] sm:w-auto">
                        <Play className="size-4 fill-current" />
                        Start practice
                      </Button>
                    </div>
                    <p className="mt-4 max-w-[600px] text-sm leading-6 text-[#607c77]">
                      Your dashboard is prioritizing the highest-leverage work before you apply: project proof, technical depth, and one polished practice loop.
                    </p>

                    <div className="mt-6 grid gap-2 sm:grid-cols-3">
                      {focusSignals.map((signal) => {
                        const Icon = signal.icon;
                        const active = selectedSignal === signal.id;

                        return (
                          <button
                            key={signal.id}
                            type="button"
                            onClick={() => setSelectedSignal(signal.id)}
                            className={`group min-h-[92px] rounded-lg border p-3 text-left transition-all ${
                              active
                                ? "border-[#8eddd0] bg-[#effbf8] shadow-[0_14px_34px_rgba(15,118,110,0.10)]"
                                : "border-[#dcece8] bg-white/68 hover:border-[#b9ded7] hover:bg-white"
                            }`}
                            aria-pressed={active}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className={`grid size-8 place-items-center rounded-lg ${toneIconClass(signal.tone)}`}>
                                <Icon className="size-4" />
                              </span>
                              <span className="font-mono text-[12px] font-semibold text-[#315f58]">
                                {signal.metric}
                              </span>
                            </span>
                            <span className="mt-3 block text-[12px] font-semibold text-[#173f3a]">
                              {signal.label}
                            </span>
                            <span className="mt-1 block text-[11px] leading-4 text-[#6f8580]">
                              {signal.action}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative mx-auto w-full max-w-[250px]">
                    <ReadinessGauge value={72} />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-white/85 bg-[#123f3a] p-5 text-white shadow-[0_22px_70px_rgba(18,63,58,0.16)] sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-[#8ce4d3]">
                    <Zap className="size-5" />
                  </span>
                  <span className="rounded-full bg-[#f3b76f]/14 px-2.5 py-1 text-[10px] font-semibold text-[#ffd7a4]">
                    High impact
                  </span>
                </div>
                <p className="mt-7 text-[11px] font-semibold uppercase text-[#8ce4d3]">
                  Next best action
                </p>
                <h2 className="mt-2 text-[22px] font-semibold leading-7 tracking-normal">
                  Explain your RAG project in 90 seconds.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  Record once, remove vague tool-name claims, and add one measurable evaluation.
                </p>
                <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-lg border border-white/10">
                  {[
                    ["12", "min"],
                    ["1", "take"],
                    ["8", "pts"],
                  ].map(([value, label]) => (
                    <div key={label} className="border-r border-white/10 p-3 last:border-r-0">
                      <span className="block text-lg font-semibold">{value}</span>
                      <span className="mt-0.5 block text-[10px] text-white/44">{label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </motion.section>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <SegmentedControl value={activeMode} onChange={setActiveMode} />
              <div className="flex items-center gap-2 text-[11px] text-[#66827c]">
                <span className="size-2 rounded-full bg-[#159b89]" />
                Live workspace mockup
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <motion.section
                id="practice"
                {...rise}
                transition={{ duration: 0.38, delay: 0.08 }}
                className="rounded-lg border border-white/85 bg-white/82 p-5 shadow-[0_16px_48px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-[#728b86]">
                      Today&apos;s sprint
                    </p>
                    <h2 className="mt-1 text-[22px] font-semibold tracking-normal text-[#123f3a]">
                      Three actions, 34 minutes
                    </h2>
                  </div>
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-[#dcece8] bg-[#f7fcfa] px-3">
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[#dcece8]">
                      <span
                        className="block h-full rounded-full bg-[#159b89] transition-[width] duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#456b64]">
                      {completionPercent}%
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {mockDashboard.todayPlan.map((task, index) => {
                    const complete = completedTasks.includes(task.id);

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        aria-pressed={complete}
                        className={`group flex min-h-[82px] w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                          complete
                            ? "border-[#bfe4dc] bg-[#effbf8]"
                            : "border-[#dfecea] bg-white/76 hover:border-[#b9ded7] hover:bg-white"
                        }`}
                      >
                        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border transition-colors ${
                          complete
                            ? "border-[#159b89] bg-[#159b89] text-white"
                            : "border-[#cbded9] bg-[#f8fbfa] text-transparent group-hover:text-[#9db4ae]"
                        }`}>
                          <Check className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[13px] font-semibold leading-5 ${
                            complete ? "text-[#6f8580] line-through" : "text-[#214943]"
                          }`}>
                            {task.title}
                          </span>
                          <span className="mt-1.5 block text-[11px] leading-4 text-[#7b918c]">
                            {task.detail}
                          </span>
                        </span>
                        <span className="hidden rounded-lg bg-[#f0f7f5] px-2 py-1 text-[10px] font-medium text-[#64807a] sm:block">
                          {index === 0 ? "Guided" : "Practice"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.section>

              <motion.section
                {...rise}
                transition={{ duration: 0.38, delay: 0.12 }}
                className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]"
              >
                <FocusCoach signal={selectedFocus} />
                <RiskStack expandedRisk={expandedRisk} onToggle={setExpandedRisk} />
              </motion.section>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <motion.section
                id="readiness"
                {...rise}
                transition={{ duration: 0.38, delay: 0.16 }}
                className="rounded-lg border border-white/85 bg-white/82 p-5 shadow-[0_16px_48px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-[#728b86]">
                      Readiness trend
                    </p>
                    <h2 className="mt-1 text-[22px] font-semibold tracking-normal text-[#123f3a]">
                      Momentum over 6 weeks
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#758a85]">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#159b89]" />
                      Readiness
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#f3b76f]" />
                      Target
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <ReadinessChart />
                </div>
              </motion.section>

              <motion.section
                {...rise}
                transition={{ duration: 0.38, delay: 0.2 }}
                className="rounded-lg border border-white/85 bg-white/82 p-5 shadow-[0_16px_48px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-[#728b86]">
                      Readiness map
                    </p>
                    <h2 className="mt-1 text-[22px] font-semibold tracking-normal text-[#123f3a]">
                      Skill breakdown
                    </h2>
                  </div>
                  <button className="grid size-8 place-items-center rounded-lg text-[#78908b] hover:bg-[#edf7f4]" aria-label="More readiness options">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
                <div className="mt-5 space-y-4">
                  {readinessSkills.map((skill) => (
                    <SkillBar key={skill.label} skill={skill} />
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardAmbient() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#f4fbf9]" />
      <div className="tg-dashboard-aurora absolute inset-[-18%]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.12)_48%,rgba(255,255,255,0.62))]" />
      <div className="absolute inset-0 opacity-[0.45] [background-image:linear-gradient(rgba(15,118,110,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.05)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <style jsx>{`
        @keyframes tg-dashboard-aurora {
          from {
            transform: translate3d(-1%, -1%, 0) scale(1);
          }

          to {
            transform: translate3d(1.8%, 1.2%, 0) scale(1.02);
          }
        }

        .tg-dashboard-aurora {
          background:
            radial-gradient(ellipse 38% 32% at 14% 20%, rgba(45, 212, 191, 0.22), transparent 68%),
            radial-gradient(ellipse 42% 30% at 86% 22%, rgba(125, 232, 218, 0.22), transparent 72%),
            radial-gradient(ellipse 40% 26% at 70% 86%, rgba(243, 183, 111, 0.12), transparent 72%),
            linear-gradient(135deg, #f8fffd 0%, #e5faf5 48%, #fbfefd 100%);
          filter: blur(42px) saturate(1.08);
          animation: tg-dashboard-aurora 12s ease-in-out infinite alternate;
        }

        @media (prefers-reduced-motion: reduce) {
          .tg-dashboard-aurora {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-white/12 bg-[#103b37]/96 px-4 py-5 text-white shadow-[18px_0_60px_rgba(9,35,31,0.18)] backdrop-blur-2xl lg:flex">
      <div className="px-1">
        <SiteBrand tone="light" compact iconFrame={false} />
      </div>

      <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <Image
            src="/images/avatars/trailgrad-user-1.png"
            alt="Arjun Rao"
            width={42}
            height={42}
            className="size-10 rounded-lg object-cover ring-1 ring-white/12"
          />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">Arjun Rao</p>
            <p className="mt-0.5 truncate text-[11px] text-white/44">AI Engineer track</p>
          </div>
          <MoreHorizontal className="ml-auto size-4 text-white/34" />
        </div>
        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-lg border border-white/10">
          <SidebarMetric value="72" label="Ready" />
          <SidebarMetric value="3" label="Streak" />
          <SidebarMetric value="71" label="Match" />
        </div>
      </div>

      <SidebarNav items={navigation} className="mt-7" />

      <div className="my-5 h-px bg-white/10" />
      <SidebarNav items={supportNavigation} />

      <div className="mt-auto pt-7">
        <div className="relative overflow-hidden rounded-lg border border-[#7bd9c7]/18 bg-[#164a44] p-4">
          <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[#7de4d0]/10" />
          <span className="grid size-9 place-items-center rounded-lg bg-[#75d9c6]/14 text-[#92ead9]">
            <Flame className="size-4" />
          </span>
          <p className="mt-4 text-[13px] font-semibold">7-day interview sprint</p>
          <p className="mt-1.5 text-[11px] leading-4 text-white/46">
            Convert the top gap into a focused practice rhythm.
          </p>
          <button className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#8fe5d4] hover:text-white">
            View sprint
            <ArrowRight className="size-3" />
          </button>
        </div>
        <DashboardSignOutButton className="mt-4 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[12px] font-medium text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/82">
          <LogOut className="size-4" />
          Sign out
        </DashboardSignOutButton>
      </div>
    </aside>
  );
}

function MobileSidebar({
  reduceMotion,
  onClose,
}: {
  reduceMotion: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-[#09231f]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigation"
      />
      <motion.aside
        initial={reduceMotion ? false : { x: -28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative flex h-full w-[286px] flex-col bg-[#103b37] p-5 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <SiteBrand tone="light" compact iconFrame={false} />
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg bg-white/[0.08] text-white/70"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>
        <SidebarNav items={navigation} className="mt-8" onNavigate={onClose} />
        <div className="my-5 h-px bg-white/10" />
        <SidebarNav items={supportNavigation} onNavigate={onClose} />
        <div className="mt-auto border-t border-white/10 pt-5">
          <DashboardSignOutButton
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[12px] font-medium text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/82"
            onSignOut={onClose}
          >
            <LogOut className="size-4" />
            Sign out
          </DashboardSignOutButton>
        </div>
      </motion.aside>
    </div>
  );
}

function TopBar({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  return (
    <header className="flex h-14 items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="grid size-10 place-items-center rounded-lg border border-[#d6e5e1] bg-white/80 text-[#315f58] shadow-sm lg:hidden"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden h-10 items-center gap-2 rounded-lg border border-[#d7e6e2] bg-white/78 px-3 text-[#7b918c] shadow-sm md:flex">
          <Search className="size-4" />
          <span className="w-44 text-[12px]">Search workspace</span>
          <kbd className="rounded-md bg-[#edf4f2] px-1.5 py-0.5 font-mono text-[9px] text-[#7b8f8b]">
            <Command className="inline size-2.5" /> K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden h-10 items-center gap-3 rounded-lg border border-[#d5e4e0] bg-white/80 px-3 text-left shadow-sm sm:flex">
          <span>
            <span className="block text-[9px] font-semibold uppercase text-[#8a9c98]">
              Target role
            </span>
            <span className="mt-0.5 block text-[12px] font-semibold text-[#264d47]">
              AI Engineer
            </span>
          </span>
          <ChevronDown className="size-3.5 text-[#7a908b]" />
        </button>
        <button className="relative grid size-10 place-items-center rounded-lg border border-[#d5e4e0] bg-white/80 text-[#56716c] shadow-sm" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#f3a76d] ring-2 ring-white" />
        </button>
        <Image
          src="/images/avatars/trailgrad-user-1.png"
          alt="Arjun Rao"
          width={40}
          height={40}
          className="size-10 rounded-lg object-cover ring-1 ring-[#d4e4df]"
        />
      </div>
    </header>
  );
}

function SidebarMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-r border-white/10 p-2.5 last:border-r-0">
      <span className="block text-[14px] font-semibold text-white">{value}</span>
      <span className="mt-0.5 block text-[9px] uppercase text-white/38">{label}</span>
    </div>
  );
}

function SidebarNav({
  items,
  className = "",
  onNavigate,
}: {
  items: NavItem[];
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className={`space-y-1 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[12px] font-medium transition-colors ${
              item.active
                ? "bg-[#75d9c6]/14 text-[#94ebda]"
                : "text-white/50 hover:bg-white/[0.07] hover:text-white/82"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
            {item.active ? <span className="ml-auto size-1.5 rounded-full bg-[#78dbc8]" /> : null}
          </a>
        );
      })}
    </nav>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const modes = [
    { id: "today", label: "Today", icon: Clock3 },
    { id: "gaps", label: "Gaps", icon: ShieldAlert },
    { id: "practice", label: "Practice", icon: BookOpenCheck },
  ];

  return (
    <div className="inline-flex h-10 rounded-lg border border-[#d9e8e4] bg-white/78 p-1 shadow-sm">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`flex h-8 min-w-[96px] items-center justify-center gap-2 rounded-md px-3 text-[12px] font-semibold transition-colors ${
              active ? "bg-[#123f3a] text-white shadow-sm" : "text-[#607c77] hover:bg-[#f3faf7]"
            }`}
            aria-pressed={active}
          >
            <Icon className="size-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function FocusCoach({ signal }: { signal: FocusSignal }) {
  const Icon = signal.icon;

  return (
    <section className="rounded-lg border border-white/85 bg-white/82 p-5 shadow-[0_16px_48px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6">
      <div className="flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-lg ${toneIconClass(signal.tone)}`}>
          <Icon className="size-5" />
        </span>
        <span className="font-mono text-[12px] font-semibold text-[#159b89]">
          {signal.metric}/100
        </span>
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase text-[#728b86]">
        Coach focus
      </p>
      <h2 className="mt-1 text-[22px] font-semibold tracking-normal text-[#123f3a]">
        {signal.label}
      </h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={signal.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="mt-3 min-h-[72px] text-sm leading-6 text-[#607c77]"
        >
          {signal.summary}
        </motion.p>
      </AnimatePresence>
      <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#d9e9e5] bg-[#f7fcfa] text-[12px] font-semibold text-[#315f58] hover:bg-white">
        Build drill
        <ArrowRight className="size-3.5" />
      </button>
    </section>
  );
}

function RiskStack({
  expandedRisk,
  onToggle,
}: {
  expandedRisk: number;
  onToggle: (index: number) => void;
}) {
  return (
    <section id="risks" className="rounded-lg border border-white/85 bg-white/82 p-5 shadow-[0_16px_48px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase text-[#728b86]">
            Rejection risks
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-normal text-[#123f3a]">
            What could cost the interview
          </h2>
        </div>
        <span className="rounded-full bg-[#fff0eb] px-2.5 py-1 text-[10px] font-semibold text-[#b56d59]">
          3 found
        </span>
      </div>
      <div className="mt-5 space-y-2">
        {mockDashboard.topRisks.map((risk, index) => {
          const active = expandedRisk === index;

          return (
            <button
              key={risk}
              type="button"
              onClick={() => onToggle(index)}
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                active
                  ? "border-[#f3c7b8] bg-[#fff7f3]"
                  : "border-[#e4ecea] bg-white/70 hover:bg-white"
              }`}
              aria-expanded={active}
            >
              <span className="flex items-start gap-3">
                <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] ${
                  index === 0 ? "bg-[#ffebe5] text-[#b86250]" : "bg-[#fff3df] text-[#a87532]"
                }`}>
                  0{index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-5 text-[#355750]">
                    {risk}
                  </span>
                  <AnimatePresence initial={false}>
                    {active ? (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 block overflow-hidden text-[11px] leading-5 text-[#7f665b]"
                      >
                        {index === 0
                          ? "Add one metric and a quick before/after result so the project reads like proof, not a tool list."
                          : index === 1
                            ? "Connect certification to a deployed artifact, reliability decision, or operating constraint."
                            : "Name the retrieval path, fallback behavior, and where evaluation happens."}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SkillBar({
  skill,
}: {
  skill: { label: string; value: number; change: string; tone: string };
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="font-medium text-[#4e6b65]">{skill.label}</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#6c817d]">
          {skill.value}
          <span className="text-[#159b89]">{skill.change}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#edf3f1]">
        <span
          className={`block h-full rounded-full ${toneBarClass(skill.tone)}`}
          style={{ width: `${skill.value}%` }}
        />
      </div>
    </div>
  );
}

function DashboardSignOutButton({
  children,
  className,
  onSignOut,
}: {
  children: ReactNode;
  className: string;
  onSignOut?: () => void;
}) {
  if (!hasClerkPublishableKey) {
    return (
      <Link
        href="/"
        className={className}
        onClick={onSignOut}
        aria-label="Sign out"
      >
        {children}
      </Link>
    );
  }

  return (
    <SignOutButton redirectUrl="/">
      <button
        type="button"
        className={className}
        onClick={onSignOut}
        aria-label="Sign out"
      >
        {children}
      </button>
    </SignOutButton>
  );
}

function ReadinessGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 44;
  const progress = (value / 100) * circumference;

  return (
    <div className="relative mx-auto size-[220px]">
      <div className="absolute inset-4 rounded-full bg-[#f5fffc]/70 shadow-[inset_0_0_0_1px_rgba(15,118,110,0.08)]" />
      <svg viewBox="0 0 120 120" className="relative size-full -rotate-90" role="img" aria-label={`Interview readiness ${value} out of 100`}>
        <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(18,63,58,0.08)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="#159b89"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <span className="block text-[44px] font-semibold leading-none text-[#123f3a]">
            {value}
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase text-[#6f8580]">
            readiness
          </span>
        </div>
      </div>
      <span className="absolute left-4 top-9 grid size-9 place-items-center rounded-lg bg-white text-[#159b89] shadow-[0_12px_28px_rgba(15,118,110,0.13)]">
        <TrendingUp className="size-4" />
      </span>
      <span className="absolute bottom-8 right-3 grid size-10 place-items-center rounded-lg bg-[#fff7eb] text-[#b67b32] shadow-[0_12px_28px_rgba(175,111,33,0.12)]">
        <Zap className="size-4" />
      </span>
    </div>
  );
}

function ReadinessChart() {
  return (
    <div className="relative min-h-[230px] overflow-hidden rounded-lg bg-[#f5f9f8] px-3 pb-3 pt-5">
      <div className="absolute inset-x-3 top-[35%] border-t border-dashed border-[#d4e2df]" />
      <div className="absolute inset-x-3 top-[62%] border-t border-[#e5edeb]" />
      <svg viewBox="0 0 420 120" className="relative h-[170px] w-full overflow-visible" role="img" aria-labelledby="readiness-chart-title">
        <title id="readiness-chart-title">Readiness score increased from 42 to 72 across six weeks</title>
        <defs>
          <linearGradient id="readiness-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#36b8a3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#36b8a3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${chartPoints} 420,120 0,120`} fill="url(#readiness-area)" />
        <polyline points={chartPoints} fill="none" stroke="#159b89" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="0" x2="420" y1="38" y2="38" stroke="#f3b76f" strokeWidth="2" strokeDasharray="5 8" />
        <circle cx="420" cy="18" r="5" fill="#ffffff" stroke="#159b89" strokeWidth="3" />
      </svg>
      <div className="flex justify-between px-1 font-mono text-[10px] text-[#99aaa6]">
        <span>W1</span>
        <span>W2</span>
        <span>W3</span>
        <span>W4</span>
        <span>W5</span>
        <span>W6</span>
      </div>
    </div>
  );
}

function toneIconClass(tone: FocusSignal["tone"]) {
  if (tone === "amber") return "bg-[#fff2df] text-[#b67b32]";
  if (tone === "coral") return "bg-[#ffebe5] text-[#b86250]";
  return "bg-[#e3f5f1] text-[#159b89]";
}

function toneBarClass(tone: string) {
  if (tone === "amber") return "bg-[#f3b76f]";
  if (tone === "coral") return "bg-[#df8b72]";
  return "bg-[#159b89]";
}
