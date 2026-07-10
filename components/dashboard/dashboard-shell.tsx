"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  FileSearch,
  Home,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { SiteBrand } from "@/components/marketing/site-brand";
import { Button } from "@/components/ui/button";
import { mockDashboard } from "@/lib/mock/dashboard";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}

const navigation: NavItem[] = [
  { label: "Overview", icon: Home, href: "#overview", active: true },
  { label: "Readiness", icon: BarChart3, href: "#readiness" },
  { label: "Resume review", icon: FileSearch, href: "#resume" },
  { label: "Role match", icon: Target, href: "#role-match" },
  { label: "Projects", icon: BriefcaseBusiness, href: "#projects" },
  { label: "Mock practice", icon: MessageSquareText, href: "#practice" },
];

const supportNavigation: NavItem[] = [
  { label: "Profile", icon: UserRound, href: "#profile" },
  { label: "Settings", icon: Settings, href: "#settings" },
  { label: "Help center", icon: CircleHelp, href: "#help" },
];

const readinessSkills = [
  { label: "Resume proof", value: 84, change: "+12", color: "#26ad99" },
  { label: "Project narrative", value: 68, change: "+8", color: "#59b8a9" },
  { label: "Technical depth", value: 57, change: "+4", color: "#e9ad5c" },
  { label: "System design", value: 43, change: "+2", color: "#df8b72" },
];

const chartPoints = "0,92 42,87 84,78 126,82 168,62 210,65 252,49 294,54 336,35 378,28 420,18";

export function DashboardShell() {
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>(["today-1"]);

  function toggleTask(taskId: string) {
    setCompletedTasks((tasks) =>
      tasks.includes(taskId) ? tasks.filter((id) => id !== taskId) : [...tasks, taskId],
    );
  }

  const rise = reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="min-h-screen bg-[#edf5f2] text-[#173f3a]">
      <div className="grid min-h-screen lg:grid-cols-[252px_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-[#123f3a] px-4 py-5 text-white lg:flex">
          <div className="px-2 py-1">
            <SiteBrand tone="light" compact />
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3.5">
            <Image src="/images/avatars/trailgrad-user-1.png" alt="Arjun Rao" width={38} height={38} className="size-9.5 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Arjun Rao</p>
              <p className="mt-0.5 truncate text-[10px] text-white/38">AI Engineer track</p>
            </div>
            <MoreHorizontal className="ml-auto size-4 text-white/35" />
          </div>

          <SidebarNav items={navigation} className="mt-7" />

          <div className="my-5 h-px bg-white/8" />
          <SidebarNav items={supportNavigation} />

          <div className="mt-auto pt-7">
            <div className="relative overflow-hidden rounded-[20px] border border-[#7bd9c7]/16 bg-[#1a514b] p-4">
              <div className="absolute -right-6 -top-7 size-24 rounded-full bg-[#70d8c4]/10" />
              <span className="grid size-8 place-items-center rounded-xl bg-[#75d9c6]/14 text-[#89e3d2]">
                <Sparkles className="size-4" />
              </span>
              <p className="mt-4 text-xs font-semibold">7-day interview sprint</p>
              <p className="mt-1.5 text-[10px] leading-4 text-white/42">Turn your top gaps into a focused daily plan.</p>
              <button className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-[#8fe5d4] hover:text-white">
                View sprint <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-[#09231f]/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />
            <motion.aside
              initial={reduceMotion ? false : { x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="relative flex h-full w-[286px] flex-col bg-[#123f3a] p-5 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <SiteBrand tone="light" compact />
                <button onClick={() => setMenuOpen(false)} className="grid size-9 place-items-center rounded-xl bg-white/8 text-white/70" aria-label="Close navigation">
                  <X className="size-4" />
                </button>
              </div>
              <SidebarNav items={navigation} className="mt-8" onNavigate={() => setMenuOpen(false)} />
              <div className="my-5 h-px bg-white/8" />
              <SidebarNav items={supportNavigation} onNavigate={() => setMenuOpen(false)} />
            </motion.aside>
          </div>
        )}

        <section className="min-w-0 px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6 xl:px-10">
          <header className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-xl border border-[#d6e5e1] bg-white text-[#315f58] lg:hidden" aria-label="Open navigation" aria-expanded={menuOpen}>
                <Menu className="size-5" />
              </button>
              <div className="hidden items-center gap-2 rounded-xl border border-[#d7e6e2] bg-white/75 px-3 py-2 text-[#7b918c] md:flex">
                <Search className="size-4" />
                <span className="w-40 text-xs">Search workspace</span>
                <kbd className="rounded-md bg-[#edf4f2] px-1.5 py-0.5 font-mono text-[9px] text-[#7b8f8b]">⌘ K</kbd>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button className="hidden h-10 items-center gap-3 rounded-xl border border-[#d5e4e0] bg-white px-3 text-left sm:flex">
                <span>
                  <span className="block text-[8px] font-medium uppercase tracking-[0.1em] text-[#8a9c98]">Target role</span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-[#264d47]">AI Engineer</span>
                </span>
                <ChevronDown className="size-3.5 text-[#7a908b]" />
              </button>
              <button className="relative grid size-10 place-items-center rounded-xl border border-[#d5e4e0] bg-white text-[#56716c]" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e59868] ring-2 ring-white" />
              </button>
              <Image src="/images/avatars/trailgrad-user-1.png" alt="Arjun Rao" width={40} height={40} className="size-10 rounded-xl object-cover ring-1 ring-[#d4e4df]" />
            </div>
          </header>

          <div id="overview" className="mx-auto max-w-[1380px]">
            <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#478078]">
                  <CalendarDays className="size-3.5" /> Friday, July 10
                </div>
                <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#153f3a] sm:text-[36px]">Good morning, Arjun.</h1>
                <p className="mt-1.5 text-sm text-[#6f8580]">Your readiness moved up. Here’s the next gap worth closing.</p>
              </div>
              <Button className="h-11 self-start rounded-xl bg-[#123f3a] px-4 font-semibold text-white shadow-[0_12px_26px_rgba(18,63,58,0.16)] hover:bg-[#0e342f] sm:self-auto">
                <Play className="size-3.5 fill-current" /> Start today’s practice
              </Button>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
              <motion.article {...rise} transition={{ duration: 0.35 }} className="relative overflow-hidden rounded-[24px] bg-[#123f3a] p-6 text-white shadow-[0_20px_48px_rgba(18,63,58,0.16)] sm:p-7">
                <div className="absolute -right-20 -top-20 size-64 rounded-full border-[40px] border-[#67ceb9]/5" />
                <div className="relative flex h-full flex-col justify-between gap-8 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#78dbc8]">Interview readiness</p>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">You’re on the right trail.</h2>
                    <p className="mt-2 max-w-[280px] text-xs leading-5 text-white/45">Close the two technical-depth gaps to reach your target zone.</p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-[#8ce4d3]">
                      <TrendingUp className="size-3.5" /> Up 8 points this week
                    </div>
                  </div>
                  <ReadinessGauge value={72} />
                </div>
              </motion.article>

              <motion.article {...rise} transition={{ duration: 0.35, delay: 0.06 }} className="rounded-[24px] border border-white bg-white/86 p-6 shadow-[0_15px_38px_rgba(25,80,72,0.07)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-[14px] bg-[#fff2df] text-[#b67b32]">
                    <Zap className="size-4.5" />
                  </span>
                  <span className="rounded-full bg-[#fff3e2] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#9f6c2e]">High impact</span>
                </div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8b9c98]">Next best action</p>
                <h2 className="mt-2 text-base font-semibold leading-6 tracking-[-0.025em] text-[#214943]">Explain your RAG project in 90 seconds.</h2>
                <div className="mt-5 flex items-center justify-between text-[11px]">
                  <span className="text-[#768b86]">12 min · Guided</span>
                  <button className="grid size-8 place-items-center rounded-full bg-[#e5f5f1] text-[#208a7a]" aria-label="Start recommended practice">
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </motion.article>

              <motion.article {...rise} transition={{ duration: 0.35, delay: 0.12 }} className="rounded-[24px] border border-white bg-white/86 p-6 shadow-[0_15px_38px_rgba(25,80,72,0.07)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-[14px] bg-[#e3f5f1] text-[#258979]">
                    <Target className="size-4.5" />
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#278d7d]">71% match</span>
                </div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8b9c98]">Target role</p>
                <h2 className="mt-2 text-base font-semibold tracking-[-0.025em] text-[#214943]">AI Engineer</h2>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#edf3f1]">
                  <div className="h-full w-[71%] rounded-full bg-[#2dad99]" />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#768b86]">Strong fit. Add one deployment example to stand out.</p>
              </motion.article>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
              <motion.article id="readiness" {...rise} transition={{ duration: 0.35, delay: 0.16 }} className="rounded-[24px] border border-white bg-white/86 p-5 shadow-[0_15px_38px_rgba(25,80,72,0.07)] sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#829591]">Readiness trend</p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#204842]">Momentum over 6 weeks</h2>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[#758a85]">
                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#26ad99]" /> Readiness</span>
                    <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#d8e7e3]" /> Target 80</span>
                  </div>
                </div>
                <div className="mt-7 grid gap-6 md:grid-cols-[1fr_190px]">
                  <ReadinessChart />
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                    <div className="rounded-2xl bg-[#f2f8f6] p-4">
                      <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#8a9b97]">Strongest signal</p>
                      <p className="mt-2 text-sm font-semibold text-[#244b45]">Resume proof</p>
                      <p className="mt-1 font-mono text-[10px] text-[#23917f]">84 / 100</p>
                    </div>
                    <div className="rounded-2xl bg-[#fff7eb] p-4">
                      <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#9c8e77]">Needs focus</p>
                      <p className="mt-2 text-sm font-semibold text-[#5b4a32]">System design</p>
                      <p className="mt-1 font-mono text-[10px] text-[#bd7e32]">43 / 100</p>
                    </div>
                  </div>
                </div>
              </motion.article>

              <motion.article {...rise} transition={{ duration: 0.35, delay: 0.2 }} className="rounded-[24px] border border-white bg-white/86 p-5 shadow-[0_15px_38px_rgba(25,80,72,0.07)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#829591]">Readiness map</p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#204842]">Skill breakdown</h2>
                  </div>
                  <button className="grid size-8 place-items-center rounded-lg text-[#839691] hover:bg-[#eef5f3]" aria-label="More readiness options"><MoreHorizontal className="size-4" /></button>
                </div>
                <div className="mt-6 space-y-4.5">
                  {readinessSkills.map((skill) => (
                    <div key={skill.label}>
                      <div className="mb-2 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#4e6b65]">{skill.label}</span>
                        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#6c817d]">
                          {skill.value}<span className="text-[#2b9b8b]">{skill.change}</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#edf3f1]">
                        <div className="h-full rounded-full" style={{ width: `${skill.value}%`, backgroundColor: skill.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#dce8e5] py-2.5 text-[11px] font-semibold text-[#48736c] hover:bg-[#f4f9f7]">
                  View full analysis <ArrowRight className="size-3" />
                </button>
              </motion.article>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <motion.article {...rise} transition={{ duration: 0.35, delay: 0.24 }} className="rounded-[24px] border border-white bg-white/86 p-5 shadow-[0_15px_38px_rgba(25,80,72,0.07)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#829591]">Rejection risks</p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#204842]">What could cost the interview</h2>
                  </div>
                  <span className="rounded-full bg-[#fff0eb] px-2.5 py-1 text-[9px] font-semibold text-[#b56d59]">3 found</span>
                </div>
                <div className="mt-5 space-y-2.5">
                  {mockDashboard.topRisks.map((risk, index) => (
                    <div key={risk} className="flex items-start gap-3 rounded-2xl bg-[#f8faf9] p-3.5">
                      <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] ${index === 0 ? "bg-[#ffebe5] text-[#b86250]" : "bg-[#fff3df] text-[#a87532]"}`}>0{index + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-5 text-[#355750]">{risk}</p>
                        <p className="mt-1 text-[10px] text-[#839591]">{index === 0 ? "High impact · Add one measurable evaluation" : index === 1 ? "Medium impact · Connect it to deployment" : "Medium impact · Map the architecture"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article id="practice" {...rise} transition={{ duration: 0.35, delay: 0.28 }} className="rounded-[24px] border border-white bg-white/86 p-5 shadow-[0_15px_38px_rgba(25,80,72,0.07)] sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#829591]">Today’s plan</p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#204842]">Three actions, 34 minutes</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#e8f0ee]">
                      <div className="h-full rounded-full bg-[#2caf9b] transition-[width] duration-300" style={{ width: `${(completedTasks.length / mockDashboard.todayPlan.length) * 100}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-[#6e847f]">{completedTasks.length}/{mockDashboard.todayPlan.length}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  {mockDashboard.todayPlan.map((task, index) => {
                    const complete = completedTasks.includes(task.id);
                    return (
                      <button key={task.id} onClick={() => toggleTask(task.id)} aria-pressed={complete} className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${complete ? "border-[#c9e5de] bg-[#f0f8f6]" : "border-[#e4ecea] bg-white hover:bg-[#f8fbfa]"}`}>
                        <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${complete ? "border-[#2aaa97] bg-[#2aaa97] text-white" : "border-[#c9d8d4] text-transparent"}`}><Check className="size-3.5" /></span>
                        <span className="min-w-0">
                          <span className={`block text-xs font-semibold leading-5 ${complete ? "text-[#64807a] line-through" : "text-[#355750]"}`}>{task.title}</span>
                          <span className="mt-1 block text-[10px] text-[#849692]">{task.area} · {index === 0 ? "12" : index === 1 ? "10" : "12"} min</span>
                        </span>
                        <span className="ml-auto hidden rounded-full bg-[#f1f6f4] px-2 py-1 text-[9px] text-[#708681] sm:block">{index === 0 ? "Guided" : "Practice"}</span>
                      </button>
                    );
                  })}
                </div>
                <Button className="mt-5 h-11 w-full rounded-xl bg-[#123f3a] font-semibold text-white hover:bg-[#0e342f]">
                  <BookOpenCheck className="size-4" /> Continue plan
                </Button>
              </motion.article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SidebarNav({ items, className = "", onNavigate }: { items: NavItem[]; className?: string; onNavigate?: () => void }) {
  return (
    <nav className={`space-y-1 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.label} href={item.href} onClick={onNavigate} className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[11px] font-medium transition-colors ${item.active ? "bg-[#75d9c6]/12 text-[#8de4d3]" : "text-white/48 hover:bg-white/5 hover:text-white/75"}`}>
            <Icon className="size-4" />
            {item.label}
            {item.active && <span className="ml-auto size-1.5 rounded-full bg-[#78dbc8]" />}
          </a>
        );
      })}
    </nav>
  );
}

function ReadinessGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 42;
  const progress = (value / 100) * circumference;

  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90" role="img" aria-label={`Interview readiness ${value} out of 100`}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#78dbc8" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${progress} ${circumference - progress}`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <span className="block text-3xl font-semibold tracking-[-0.06em]">{value}</span>
          <span className="mt-0.5 block text-[8px] uppercase tracking-[0.14em] text-white/38">of 100</span>
        </div>
      </div>
    </div>
  );
}

function ReadinessChart() {
  return (
    <div className="relative min-h-48 overflow-hidden rounded-2xl bg-[#f5f9f8] px-3 pb-2 pt-4">
      <div className="absolute inset-x-3 top-[33%] border-t border-dashed border-[#d4e2df]" />
      <div className="absolute inset-x-3 top-[61%] border-t border-[#e5edeb]" />
      <svg viewBox="0 0 420 110" className="relative h-[150px] w-full overflow-visible" role="img" aria-labelledby="readiness-chart-title">
        <title id="readiness-chart-title">Readiness score increased from 42 to 72 across six weeks</title>
        <defs>
          <linearGradient id="readiness-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#36b8a3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#36b8a3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${chartPoints} 420,110 0,110`} fill="url(#readiness-area)" />
        <polyline points={chartPoints} fill="none" stroke="#2aad99" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="420" cy="18" r="5" fill="#ffffff" stroke="#2aad99" strokeWidth="3" />
      </svg>
      <div className="flex justify-between px-1 font-mono text-[8px] text-[#99aaa6]">
        <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
      </div>
    </div>
  );
}
