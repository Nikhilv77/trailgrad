import { ArrowRight, Clock3, Code2, Target, TriangleAlert, type LucideIcon } from "lucide-react";
import Image from "next/image";

import { mockDashboard } from "./dashboard-data";
import { StaggeredText } from "./staggered-text";

export function PriorityPanel() {
  return (
    <section className="relative min-h-[324px] overflow-hidden rounded-lg border border-[#b9e7df] bg-white p-6">
      <div className="relative z-10 flex min-h-[276px] max-w-[520px] flex-col">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e8f8f4] px-3 py-1.5 text-[11px] font-extrabold uppercase leading-none text-[#078f7c]">
          <Target className="size-4" strokeWidth={2.2} />
          Today&apos;s priority
        </p>
        <h2 className="mt-4 max-w-[520px] text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[#10213e] xl:text-[30px]">
          <StaggeredText text={mockDashboard.priority.title} />
        </h2>
        <p className="mt-4 max-w-[430px] text-[15px] font-medium leading-7 text-[#526482]">
          {mockDashboard.priority.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-y-3 text-xs text-[#51617c]">
          <PriorityMeta icon={Clock3} label={`${mockDashboard.priority.minutes} min`} note="Estimated time" />
          <PriorityMeta icon={Code2} label={mockDashboard.priority.skill} note="Related skill" />
          <PriorityMeta icon={TriangleAlert} label={mockDashboard.priority.blocker} note="Top blocker" warning />
        </div>

        <button
          type="button"
          className="mt-auto inline-flex h-11 w-fit cursor-pointer items-center gap-3 rounded-md bg-[#078f7c] px-5 text-sm font-bold text-white transition-colors hover:bg-[#067b6b]"
        >
          Start now
          <ArrowRight className="size-4" />
        </button>
      </div>

      <Image
        src="/images/dashboard/today-priority-mountain.png"
        alt=""
        width={1536}
        height={1024}
        className="pointer-events-none absolute bottom-0 right-0 hidden h-[98%] w-[48%] object-contain object-right-bottom opacity-95 sm:block"
        sizes="(min-width: 1536px) 26vw, 40vw"
        priority
      />
    </section>
  );
}

function PriorityMeta({
  icon: Icon,
  label,
  note,
  warning = false,
}: {
  icon: LucideIcon;
  label: string;
  note: string;
  warning?: boolean;
}) {
  return (
    <div className="flex min-w-[146px] items-center gap-2 border-r border-[#e3e8ec] px-3.5 first:pl-0 last:border-0">
      <Icon className={`size-[22px] shrink-0 ${warning ? "text-[#f26b45]" : "text-[#31527c]"}`} strokeWidth={1.7} />
      <span>
        <span className="block text-[12px] font-extrabold leading-4 text-[#182946]">{label}</span>
        <span className="mt-0.5 block text-[10px] font-medium text-[#73819a]">{note}</span>
      </span>
    </div>
  );
}
