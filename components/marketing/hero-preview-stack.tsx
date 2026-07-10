import { ArrowUpRight, Check, Sparkles } from "lucide-react";

const readinessBars = [
  { label: "Resume proof", value: 84, color: "bg-[#22b8a5]" },
  { label: "Technical depth", value: 68, color: "bg-[#f0b86e]" },
  { label: "Interview stories", value: 76, color: "bg-[#74a99f]" },
];

export function HeroPreviewStack() {
  return (
    <div className="relative mx-auto w-full max-w-[590px] lg:mx-0">
      <div className="absolute -inset-5 rounded-[44px] bg-[radial-gradient(circle_at_50%_50%,rgba(104,219,197,0.22),transparent_66%)]" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/88 p-2.5 shadow-[0_34px_90px_rgba(27,92,82,0.18)] backdrop-blur-xl sm:p-3">
        <div className="flex h-9 items-center justify-between px-2 sm:px-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-[#ff9f91]" />
            <span className="size-2 rounded-full bg-[#f4c96d]" />
            <span className="size-2 rounded-full bg-[#62c9a7]" />
          </div>
          <span className="rounded-full bg-[#eef8f5] px-3 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#54736e]">
            Readiness workspace
          </span>
          <span className="size-5" />
        </div>

        <div className="grid min-h-[390px] grid-cols-[64px_1fr] overflow-hidden rounded-[21px] bg-[#f3f8f6] sm:min-h-[430px] sm:grid-cols-[118px_1fr]">
          <aside className="bg-[#123f3a] px-3 py-5 text-white sm:px-4">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-[#73dbc7] text-[#123f3a]">
                <Sparkles className="size-3.5" />
              </span>
              <span className="hidden text-[11px] font-semibold sm:inline">TrailGrad</span>
            </div>
            <div className="mt-8 space-y-2.5">
              {["Overview", "Readiness", "Practice", "Reports"].map((item, index) => (
                <div
                  key={item}
                  className={`flex h-8 items-center gap-2 rounded-lg px-2 text-[9px] ${
                    index === 0 ? "bg-white/12 text-white" : "text-white/45"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${index === 0 ? "bg-[#73dbc7]" : "bg-white/25"}`} />
                  <span className="hidden sm:inline">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#79908c]">Friday · Week 3</p>
                <h2 className="mt-1 text-base font-semibold tracking-[-0.03em] text-[#153d39] sm:text-lg">Good morning, Arjun</h2>
              </div>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d9f5ef] text-[10px] font-semibold text-[#0f766e]">AR</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[0.86fr_1.14fr]">
              <div className="rounded-2xl bg-[#123f3a] p-4 text-white shadow-[0_16px_32px_rgba(18,63,58,0.14)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/50">Readiness</p>
                    <p className="mt-1 text-[10px] text-white/70">AI Engineer</p>
                  </div>
                  <ArrowUpRight className="size-3.5 text-[#78dbc8]" />
                </div>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-[-0.06em]">72</span>
                  <span className="mb-1 text-xs text-[#7edbc9]">+8%</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-[#73dbc7]" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#dceae6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-[#1a443f]">Readiness map</p>
                  <span className="text-[9px] text-[#7a908c]">This week</span>
                </div>
                <div className="mt-4 space-y-3">
                  {readinessBars.map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-1.5 flex justify-between text-[8px] text-[#718783]">
                        <span>{bar.label}</span>
                        <span className="font-mono">{bar.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#edf3f1]">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[#dceae6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#1a443f]">Next best action</p>
                  <p className="mt-0.5 text-[8px] text-[#849692]">Chosen from your biggest interview gap</p>
                </div>
                <span className="rounded-full bg-[#fff5e4] px-2 py-1 text-[8px] font-medium text-[#9b6726]">12 min</span>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f5faf8] p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#d8f3ec] text-[#128173]">
                  <Check className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-semibold text-[#234943]">Explain your RAG project in 90 seconds</p>
                  <p className="mt-0.5 text-[8px] text-[#8a9a97]">Project narrative · Guided practice</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tg-float absolute -right-2 top-[22%] hidden rounded-2xl border border-white/90 bg-white/92 px-4 py-3 shadow-[0_18px_50px_rgba(20,80,71,0.14)] backdrop-blur-md sm:block lg:-right-7">
        <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#849692]">Risk removed</p>
        <p className="mt-1 text-xs font-semibold text-[#17423d]">Added proof metrics</p>
      </div>

      <div className="tg-float-delayed absolute -bottom-4 left-[8%] rounded-2xl border border-white/90 bg-[#effbf8]/95 px-4 py-3 shadow-[0_18px_50px_rgba(20,80,71,0.14)] backdrop-blur-md sm:left-[20%]">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-[#27b19d] text-white">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <p className="text-[9px] text-[#718783]">Weekly momentum</p>
            <p className="text-xs font-semibold text-[#17423d]">You’re interview-ready ↑</p>
          </div>
        </div>
      </div>
    </div>
  );
}
