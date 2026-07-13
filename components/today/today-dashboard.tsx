"use client";

import { SignOutButton } from "@clerk/nextjs";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Gauge,
  LogOut,
  Menu,
  MessageSquareText,
  Sparkles,
  Target,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { SiteBrand } from "@/components/marketing/site-brand";
import { SIGN_OUT_REDIRECT_URL } from "@/lib/auth/routes";
import type { MVPAnalysis } from "@/lib/ai/schemas/mvp-analysis";

type SourceReference = MVPAnalysis["rejectionRisks"][number]["sourceReference"];
type ReadinessLevel = "LOW" | "MEDIUM" | "HIGH";
type Difficulty = MVPAnalysis["importantQuestions"][number]["difficulty"];
type Severity = MVPAnalysis["rejectionRisks"][number]["severity"];
type ViewId = "overview" | "risks" | "today" | "plan" | "questions" | "resume";

interface TodayDashboardProps {
  analysis: {
    model: string;
    promptVersion: string;
    provider: string;
    updatedAt: string;
  };
  result: MVPAnalysis;
}

const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const views: Array<{
  id: ViewId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Summary, readiness, and strongest proof.",
    icon: Gauge,
  },
  {
    id: "risks",
    label: "Risks",
    description: "Rejection risks and interview gaps.",
    icon: AlertTriangle,
  },
  {
    id: "today",
    label: "Today",
    description: "Highest-impact action for now.",
    icon: Target,
  },
  {
    id: "plan",
    label: "7-day plan",
    description: "A week of focused improvements.",
    icon: CalendarDays,
  },
  {
    id: "questions",
    label: "Questions",
    description: "Interview questions to prepare.",
    icon: MessageSquareText,
  },
  {
    id: "resume",
    label: "Resume",
    description: "Suggestions and model metadata.",
    icon: ClipboardList,
  },
];

const readinessLabels: Array<{
  key: keyof MVPAnalysis["readiness"];
  label: string;
}> = [
  { key: "applicationReadiness", label: "Application readiness" },
  { key: "evidenceStrength", label: "Evidence strength" },
  { key: "projectDepth", label: "Project depth" },
  { key: "interviewPerformanceStatus", label: "Interview performance" },
];

export function TodayDashboard({ analysis, result }: TodayDashboardProps) {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const readinessScore = getReadinessScore(result.readiness);
  const highRisks = result.rejectionRisks.filter((risk) => risk.severity === "HIGH").length;
  const totalPlanMinutes = result.sevenDayPlan.reduce(
    (total, task) => total + task.estimatedMinutes,
    0,
  );
  const active = views.find((view) => view.id === activeView) ?? views[0];

  function selectView(view: ViewId) {
    setActiveView(view);
    setMobileMenuOpen(false);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f4fbf9] text-[#111827]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(45,212,191,0.13),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(125,232,218,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(244,251,249,0.8))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(15,118,110,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.08)_1px,transparent_1px)] [background-size:64px_64px]"
      />
      <div className="relative grid min-h-screen lg:grid-cols-[336px_minmax(0,1fr)] 2xl:grid-cols-[352px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-[#d7ebe6] bg-white/82 px-5 py-5 shadow-[18px_0_80px_rgba(15,118,110,0.08)] backdrop-blur-2xl lg:block">
          <DashboardSidebar
            activeView={activeView}
            analysis={analysis}
            highRisks={highRisks}
            readinessScore={readinessScore}
            onSelect={selectView}
          />
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#d7ebe6] bg-[#f4fbf9]/88 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <SiteBrand compact iconFrame={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="grid size-10 place-items-center rounded-xl border border-[#d7ebe6] bg-white text-[#0f766e] shadow-[0_10px_28px_rgba(15,118,110,0.08)]"
                aria-label="Open dashboard menu"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
            {mobileMenuOpen ? (
              <div className="mt-3 rounded-2xl border border-[#d7ebe6] bg-white p-2 shadow-[0_18px_54px_rgba(15,118,110,0.12)]">
                <DashboardNavigation activeView={activeView} onSelect={selectView} compact />
                <div className="mt-2 border-t border-[#d7ebe6] p-2">
                  <div className="rounded-xl bg-[#f6fbfa] px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7d78]">
                      Last analyzed
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#111827]">
                      {formatDate(analysis.updatedAt)}
                    </p>
                  </div>
                  <DashboardSignOutButton className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d7ebe6] bg-white text-sm font-semibold text-[#4b5563] transition-colors hover:border-[#b9ddd5] hover:text-[#0f766e]">
                    <LogOut className="size-4" />
                    Sign out
                  </DashboardSignOutButton>
                </div>
              </div>
            ) : null}
          </header>

          <div className="flex min-h-screen w-full flex-col px-4 py-5 sm:px-6 lg:px-7 xl:px-8 2xl:px-10">
            <DashboardHeader
              activeDescription={active.description}
              activeLabel={active.label}
              analysisUpdatedAt={analysis.updatedAt}
            />

            <div className="mt-5 min-w-0 flex-1">
              {activeView === "overview" ? (
                <OverviewView
                  highRisks={highRisks}
                  readinessScore={readinessScore}
                  result={result}
                  totalPlanMinutes={totalPlanMinutes}
                />
              ) : null}
              {activeView === "risks" ? <RisksView result={result} /> : null}
              {activeView === "today" ? <TodayPriorityView result={result} /> : null}
              {activeView === "plan" ? <PlanView result={result} /> : null}
              {activeView === "questions" ? <QuestionsView result={result} /> : null}
              {activeView === "resume" ? (
                <ResumeView analysis={analysis} result={result} />
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardSidebar({
  activeView,
  analysis,
  highRisks,
  onSelect,
  readinessScore,
}: {
  activeView: ViewId;
  analysis: TodayDashboardProps["analysis"];
  highRisks: number;
  onSelect: (view: ViewId) => void;
  readinessScore: number;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-1">
        <SiteBrand compact iconFrame={false} />
      </div>

      <div className="relative mt-7 overflow-hidden rounded-[24px] bg-[#0f766e] p-5 text-white shadow-[0_24px_54px_rgba(15,118,110,0.24)]">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 size-32 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-14 left-8 size-36 rounded-full bg-[#7de8d8]/12"
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/62">
                Readiness
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-[-0.06em]">
                {readinessScore}%
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/54">
                Risks
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {highRisks} high
              </p>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/16">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium leading-5 text-white/68">
            Baseline from resume evidence and interview readiness signals.
          </p>
        </div>
      </div>

      <DashboardNavigation activeView={activeView} onSelect={onSelect} />

      <div className="mt-auto space-y-3 pt-5">
        <div className="rounded-[18px] border border-[#d7ebe6] bg-white/76 p-3 shadow-[0_12px_34px_rgba(15,118,110,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b7d78]">
            Last analyzed
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {formatDate(analysis.updatedAt)}
          </p>
        </div>
        <DashboardSignOutButton className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d7ebe6] bg-white/78 text-sm font-semibold text-[#4b5563] shadow-[0_12px_34px_rgba(15,118,110,0.05)] transition-colors hover:border-[#b9ddd5] hover:bg-white hover:text-[#0f766e]">
          <LogOut className="size-4" />
          Sign out
        </DashboardSignOutButton>
      </div>
    </div>
  );
}

function DashboardNavigation({
  activeView,
  compact,
  onSelect,
}: {
  activeView: ViewId;
  compact?: boolean;
  onSelect: (view: ViewId) => void;
}) {
  return (
    <nav className={compact ? "grid gap-1.5" : "mt-7 grid gap-1.5"}>
      {!compact ? (
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a928c]">
          Workspace
        </p>
      ) : null}
      {views.map((view) => {
        const Icon = view.icon;
        const active = view.id === activeView;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelect(view.id)}
            className={`group relative flex w-full items-center gap-3 rounded-[18px] border px-3 py-3 text-left transition-all duration-150 ${
              active
                ? "border-[#c4ebe3] bg-white text-[#0f766e] shadow-[0_14px_36px_rgba(15,118,110,0.10)]"
                : "border-transparent text-[#63756f] hover:border-[#d7ebe6] hover:bg-white/78 hover:text-[#0f766e]"
            }`}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#159b89]" />
            ) : null}
            <span className={`grid size-10 shrink-0 place-items-center rounded-[14px] transition-colors ${
              active ? "bg-[#effbf8]" : "bg-[#f6fbfa] group-hover:bg-[#effbf8]"
            }`}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{view.label}</span>
              {!compact ? (
                <span className="mt-0.5 block truncate text-xs font-medium opacity-70">
                  {view.description}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function DashboardHeader({
  activeDescription,
  activeLabel,
  analysisUpdatedAt,
}: {
  activeDescription: string;
  activeLabel: string;
  analysisUpdatedAt: string;
}) {
  return (
    <header className="rounded-[30px] border border-[#d7ebe6] bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f8f7e]">
            Today workspace
          </p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[48px]">
            {activeLabel}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#5f6f6b]">
            {activeDescription}
          </p>
        </div>
        <div className="w-full rounded-2xl border border-[#e0efeb] bg-[#f6fbfa] px-4 py-3 sm:w-auto sm:min-w-[188px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
            Updated
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {formatDate(analysisUpdatedAt)}
          </p>
        </div>
      </div>
    </header>
  );
}

function OverviewView({
  highRisks,
  readinessScore,
  result,
  totalPlanMinutes,
}: {
  highRisks: number;
  readinessScore: number;
  result: MVPAnalysis;
  totalPlanMinutes: number;
}) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_392px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-5">
        <Panel title="Profile summary" icon={Gauge}>
          <p className="max-w-4xl text-sm font-medium leading-7 text-[#4b5563]">
            {result.profileSummary}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Readiness" value={`${readinessScore}%`} tone="teal" />
            <MetricCard label="High risks" value={String(highRisks)} tone={highRisks > 0 ? "red" : "teal"} />
            <MetricCard label="Today task" value={`${result.todayPriority.estimatedMinutes}m`} tone="teal" />
            <MetricCard label="7-day effort" value={`${totalPlanMinutes}m`} tone="neutral" />
          </div>
        </Panel>
        <Panel title="Strongest signals" icon={Sparkles}>
          <div className="grid gap-3 lg:grid-cols-3">
            {result.strongestSignals.map((signal, index) => (
              <SignalCard key={signal} index={index + 1} text={signal} />
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Readiness" icon={Gauge} sticky>
        <ReadinessDonut score={readinessScore} />
        <div className="mt-6 space-y-4">
          {readinessLabels.map((item) => (
            <ReadinessBar
              key={item.key}
              label={item.label}
              value={result.readiness[item.key]}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RisksView({ result }: { result: MVPAnalysis }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
      <Panel title="Risk mix" icon={AlertTriangle} sticky>
        <RiskDistribution risks={result.rejectionRisks} />
      </Panel>
      <Panel title="Rejection risks" icon={AlertTriangle}>
        <div className="grid gap-3 xl:grid-cols-3">
          {result.rejectionRisks.map((risk) => (
            <RiskCard key={`${risk.title}-${risk.sourceReference.locator}`} risk={risk} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TodayPriorityView({ result }: { result: MVPAnalysis }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_392px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel title="Highest-impact task" icon={Target}>
        <div className="rounded-[24px] border border-[#e0efeb] bg-[#f6fbfa] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[#111827]">
                {result.todayPriority.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4b5563]">
                {result.todayPriority.reason}
              </p>
            </div>
            <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#0f8f7e] shadow-[0_8px_24px_rgba(15,118,110,0.08)]">
              <Timer className="size-4" />
              {result.todayPriority.estimatedMinutes}m
            </span>
          </div>
          <ol className="mt-5 grid gap-3 lg:grid-cols-2">
            {result.todayPriority.steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-[#374151]">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#effbf8] text-xs font-bold text-[#0f8f7e]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </Panel>
      <Panel title="Expected impact" icon={CheckCircle2}>
        <p className="text-sm leading-7 text-[#4b5563]">
          {result.todayPriority.expectedImpact}
        </p>
      </Panel>
    </div>
  );
}

function PlanView({ result }: { result: MVPAnalysis }) {
  return (
    <Panel title="Seven-day plan" icon={CalendarDays}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {result.sevenDayPlan.map((task) => (
          <PlanDayCard
            key={task.day}
            day={task.day}
            minutes={task.estimatedMinutes}
            maxMinutes={getMaxPlanMinutes(result)}
            task={task.task}
            title={task.title}
          />
        ))}
      </div>
    </Panel>
  );
}

function QuestionsView({ result }: { result: MVPAnalysis }) {
  return (
    <Panel title="Important questions" icon={MessageSquareText}>
      <div className="grid gap-3 xl:grid-cols-2">
        {result.importantQuestions.map((question) => (
          <QuestionCard key={question.question} question={question} />
        ))}
      </div>
    </Panel>
  );
}

function ResumeView({
  analysis,
  result,
}: {
  analysis: TodayDashboardProps["analysis"];
  result: MVPAnalysis;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
      <Panel title="Resume suggestions" icon={ClipboardList}>
        <SimpleList items={result.resumeSuggestions} />
      </Panel>
      <Panel title="Analysis details" icon={Gauge}>
        <dl className="grid gap-3">
          <MetadataItem label="Provider" value={analysis.provider} />
          <MetadataItem label="Model" value={analysis.model} />
          <MetadataItem label="Prompt" value={analysis.promptVersion} />
          <MetadataItem label="Updated" value={formatDate(analysis.updatedAt)} />
        </dl>
      </Panel>
    </div>
  );
}

function Panel({
  children,
  icon: Icon,
  sticky = false,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  sticky?: boolean;
  title: string;
}) {
  return (
    <section className={`min-w-0 rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-6 ${
      sticky ? "xl:sticky xl:top-5" : ""
    }`}>
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#effbf8] text-[#0f8f7e]">
          <Icon className="size-4" />
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
          {title}
        </h2>
      </div>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function ReadinessDonut({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const dash = (score / 100) * circumference;

  return (
    <div className="rounded-[24px] border border-[#e0efeb] bg-[#f6fbfa] p-4">
      <div className="relative mx-auto grid size-40 place-items-center">
        <svg viewBox="0 0 100 100" className="size-40 rotate-[-90deg]" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#dcefeb" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#159b89"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            strokeWidth="9"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-4xl font-semibold tracking-[-0.05em] text-[#111827]">
            {score}%
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
            baseline
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "teal" | "red" | "neutral";
  value: string;
}) {
  const toneClass =
    tone === "red"
      ? "text-[#b4533b] bg-[#fff7f3]"
      : tone === "teal"
        ? "text-[#0f8f7e] bg-[#effbf8]"
        : "text-[#374151] bg-[#f6fbfa]";

  return (
    <div className={`rounded-2xl border border-white/60 px-4 py-3 shadow-[0_10px_28px_rgba(15,118,110,0.05)] ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function ReadinessBar({
  label,
  value,
}: {
  label: string;
  value: ReadinessLevel | "NOT_ASSESSED";
}) {
  const percent = value === "NOT_ASSESSED" ? 8 : readinessPercent(value);
  const displayValue = value.replaceAll("_", " ");

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#111827]">{label}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7d78]">
          {displayValue}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7f2ef]">
        <div
          className={`h-full rounded-full ${value === "NOT_ASSESSED" ? "bg-[#cadbd7]" : "bg-[#159b89]"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SignalCard({ index, text }: { index: number; text: string }) {
  return (
    <article className="flex min-h-full gap-3 rounded-2xl border border-[#dcefeb] bg-white/72 p-4 shadow-[0_10px_28px_rgba(15,118,110,0.04)]">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#effbf8] text-sm font-bold text-[#0f8f7e]">
        {index}
      </span>
      <p className="text-sm leading-6 text-[#374151]">{text}</p>
    </article>
  );
}

function RiskDistribution({ risks }: { risks: MVPAnalysis["rejectionRisks"] }) {
  const buckets: Array<{ label: Severity; color: string }> = [
    { label: "HIGH", color: "bg-[#dc5f54]" },
    { label: "MEDIUM", color: "bg-[#d99a32]" },
    { label: "LOW", color: "bg-[#159b89]" },
  ];

  return (
    <div className="space-y-4">
      {buckets.map((bucket) => {
        const count = risks.filter((risk) => risk.severity === bucket.label).length;
        const percent = (count / risks.length) * 100;

        return (
          <div key={bucket.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#111827]">{bucket.label}</span>
              <span className="font-semibold text-[#6b7d78]">{count}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e7f2ef]">
              <div className={`h-full rounded-full ${bucket.color}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RiskCard({ risk }: { risk: MVPAnalysis["rejectionRisks"][number] }) {
  const severity = severityMeta(risk.severity);

  return (
    <article className="flex min-h-full flex-col rounded-2xl border border-[#dcefeb] bg-white/74 p-4 shadow-[0_10px_28px_rgba(15,118,110,0.04)]">
      <span className={`w-max rounded-full px-2.5 py-1 text-xs font-semibold ${severity.className}`}>
        {risk.severity}
      </span>
      <h3 className="mt-3 font-semibold leading-5 text-[#111827]">{risk.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#4b5563]">{risk.reason}</p>
      <div className="mt-4 space-y-3">
        <Detail label="Likely question" value={risk.likelyQuestion} />
        <Detail label="Fix" value={risk.recommendedFix} />
        <SourceReference source={risk.sourceReference} />
      </div>
    </article>
  );
}

function PlanDayCard({
  day,
  maxMinutes,
  minutes,
  task,
  title,
}: {
  day: number;
  maxMinutes: number;
  minutes: number;
  task: string;
  title: string;
}) {
  const percent = Math.max(12, (minutes / maxMinutes) * 100);

  return (
    <article className="rounded-2xl border border-[#dcefeb] bg-white/74 p-4 shadow-[0_10px_28px_rgba(15,118,110,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
        Day {day}
      </p>
      <h3 className="mt-2 min-h-10 text-sm font-semibold leading-5 text-[#111827]">{title}</h3>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7f2ef]">
        <div className="h-full rounded-full bg-[#159b89]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-[#6b7d78]">{minutes} minutes</p>
      <p className="mt-3 text-sm leading-6 text-[#4b5563]">{task}</p>
    </article>
  );
}

function QuestionCard({ question }: { question: MVPAnalysis["importantQuestions"][number] }) {
  const difficulty = difficultyMeta(question.difficulty);

  return (
    <article className="rounded-2xl border border-[#dcefeb] bg-white/74 p-4 shadow-[0_10px_28px_rgba(15,118,110,0.04)]">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficulty.className}`}>
        {question.difficulty}
      </span>
      <h3 className="mt-3 font-semibold leading-6 text-[#111827]">{question.question}</h3>
      <p className="mt-2 text-sm leading-6 text-[#4b5563]">{question.whyAsked}</p>
      <Detail label="Answer focus" value={question.answerFocus} />
      <SourceReference source={question.relatedSource} />
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-6 text-[#374151]">
      <span className="font-semibold text-[#111827]">{label}:</span> {value}
    </p>
  );
}

function SimpleList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#5f6f6b]">No items returned.</p>;
  }

  return (
    <ul className="grid gap-2 text-sm leading-6 text-[#374151]">
      {items.map((item) => (
        <li key={item} className="flex gap-3 rounded-xl bg-[#f6fbfa] px-3 py-2">
          <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#159b89]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SourceReference({ source }: { source: SourceReference }) {
  return (
    <div className="mt-3 rounded-xl border border-[#e0efeb] bg-[#f6fbfa] px-3 py-2 text-xs leading-5 text-[#4b5563]">
      <p className="font-semibold text-[#0f8f7e]">
        {source.sourceType.replaceAll("_", " ")} · {source.locator}
      </p>
      <p className="mt-1">{source.excerpt}</p>
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e0efeb] bg-[#f6fbfa] px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-[#111827]">{value}</dd>
    </div>
  );
}

function DashboardSignOutButton({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  if (!hasClerkPublishableKey) {
    return (
      <a href={SIGN_OUT_REDIRECT_URL} className={className} aria-label="Sign out">
        {children}
      </a>
    );
  }

  return (
    <SignOutButton redirectUrl={SIGN_OUT_REDIRECT_URL}>
      <button type="button" className={className} aria-label="Sign out">
        {children}
      </button>
    </SignOutButton>
  );
}

function readinessPercent(value: ReadinessLevel) {
  if (value === "HIGH") return 90;
  if (value === "MEDIUM") return 62;
  return 30;
}

function getReadinessScore(readiness: MVPAnalysis["readiness"]) {
  const levels = [
    readiness.applicationReadiness,
    readiness.evidenceStrength,
    readiness.projectDepth,
  ];

  return Math.round(
    levels.reduce((total, level) => total + readinessPercent(level), 0) / levels.length,
  );
}

function getMaxPlanMinutes(result: MVPAnalysis) {
  return Math.max(...result.sevenDayPlan.map((task) => task.estimatedMinutes), 1);
}

function severityMeta(severity: Severity) {
  if (severity === "HIGH") return { className: "bg-[#fff1ed] text-[#b4533b]" };
  if (severity === "MEDIUM") return { className: "bg-[#fff7e8] text-[#966329]" };
  return { className: "bg-[#effbf8] text-[#0f8f7e]" };
}

function difficultyMeta(difficulty: Difficulty) {
  if (difficulty === "HARD") return { className: "bg-[#fff1ed] text-[#b4533b]" };
  if (difficulty === "MEDIUM") return { className: "bg-[#fff7e8] text-[#966329]" };
  return { className: "bg-[#effbf8] text-[#0f8f7e]" };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
