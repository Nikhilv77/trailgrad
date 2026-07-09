import Link from "next/link";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  FileSearch,
  FileText,
  Home,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { mockDashboard } from "@/lib/mock/dashboard";

const nav = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Resume Analyzer", icon: FileSearch },
  { label: "JD Match", icon: Target },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Mock Interview", icon: MessageSquareText },
  { label: "Answer Review", icon: FileText },
  { label: "Rejection Report", icon: ShieldCheck },
  { label: "Practice Plan", icon: BarChart3 },
  { label: "Progress", icon: BarChart3 },
  { label: "Profile", icon: UserRound },
  { label: "Settings", icon: Settings },
];

const cards = [
  { label: "Interview Readiness", value: "58%", hint: "Needs Improvement", tone: "text-slate-950", line: "red" },
  { label: "Rejection Risk", value: "High (64%)", hint: "At high risk before applying", tone: "text-red-500", line: "red" },
  { label: "JD Match", value: "71%", hint: "Good Match", tone: "text-emerald-500", line: "green" },
  { label: "Project Depth", value: "Medium", hint: "Strongest proof needed", tone: "text-amber-500", line: "amber" },
  { label: "Practice Streak", value: "3 days", hint: "Keep it up! 🔥", tone: "text-blue-700", line: "blue" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2">
      <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <ShieldCheck className="size-4" />
      </span>
      <span className="logo-script text-2xl font-semibold text-slate-950">TraiGrad</span>
    </Link>
  );
}

function Sparkline({ tone }: { tone: string }) {
  const color = tone === "green" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : tone === "blue" ? "text-blue-400" : "text-red-300";
  return (
    <svg viewBox="0 0 160 36" className={`mt-4 h-9 w-full ${color}`}>
      <path d="M0 27 C17 20 27 33 43 24 C58 15 70 19 83 24 C99 32 110 28 123 17 C137 6 149 14 160 8" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M0 36 L0 27 C17 20 27 33 43 24 C58 15 70 19 83 24 C99 32 110 28 123 17 C137 6 149 14 160 8 L160 36 Z" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <aside className="hidden border-r border-slate-100 bg-white px-4 py-6 lg:block">
          <Brand />
          <nav className="mt-8 space-y-1">
            {nav.map((item) => (
              <a key={item.label} className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold ${item.active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`} href="#">
                <item.icon className="size-4" />
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-14 rounded-xl bg-blue-50 p-5">
            <p className="text-sm font-bold">Upgrade to Pro</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Unlock unlimited mocks, advanced analytics and more.</p>
            <Button className="mt-4 h-9 w-full rounded-md bg-white text-blue-700 shadow-sm hover:bg-white">Upgrade Now</Button>
          </div>
        </aside>
        <section className="px-5 py-6 lg:px-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hi, Arjun 👋</h1>
              <p className="mt-1 text-sm text-slate-500">Here&apos;s your interview readiness snapshot.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-12 items-center gap-4 rounded-md border border-slate-100 bg-white px-4 text-left text-xs shadow-sm">
                <span><span className="block text-[10px] text-slate-400">Target Role</span><span className="font-bold">AI Engineer</span></span>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
              <button className="relative grid size-12 place-items-center rounded-md border border-slate-100 bg-white shadow-sm">
                <Bell className="size-5 text-slate-600" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
              </button>
              <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">AR</span>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
                <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
                <Sparkline tone={card.line} />
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold">Top 3 Rejection Risks</h2>
              <div className="mt-6 space-y-5">
                {mockDashboard.topRisks.map((risk, index) => (
                  <div key={risk} className="grid grid-cols-[30px_1fr] gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-red-50 text-xs font-bold text-red-500">{index + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{risk}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {index === 0 ? "Interviewers may doubt the impact and reliability of your project." : index === 1 ? "It looks like theoretical knowledge without practical usage." : "You may struggle in deep-dive technical questions."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" className="rounded-md bg-white px-8">View Full Rejection Report</Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold">Today&apos;s Practice Plan</h2>
              <div className="mt-6 space-y-4">
                {["Explain your RAG project in 90 seconds", "Practice 5 vector DB questions", "Rewrite your AI project resume bullet", "Prepare answer: Why LangChain?"].map((task) => (
                  <label key={task} className="flex items-center gap-3 text-sm text-slate-700">
                    <Checkbox />
                    {task}
                  </label>
                ))}
              </div>
              <Button className="mt-9 h-12 w-full rounded-md bg-blue-700 hover:bg-blue-800">Start Practice</Button>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold">Your Strength Breakdown</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              {[
                ["Resume Strength", 62, "bg-emerald-500"],
                ["Project Explanation", 48, "bg-amber-500"],
                ["Technical Depth", 55, "bg-emerald-500"],
                ["System Design", 35, "bg-amber-500"],
                ["Behavioral Answers", 70, "bg-emerald-500"],
              ].map(([label, value, color]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{label}</span>
                    <span className="font-bold">{value}%</span>
                  </div>
                  <Progress value={value as number} className="h-2 [&>div]:bg-transparent" />
                  <div className="-mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
