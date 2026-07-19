import { ArrowRight, Code2, Target, TrendingUp } from "lucide-react";
import Image from "next/image";

import { StaggeredText } from "./staggered-text";

const projectProofItems = [
  {
    icon: Target,
    title: "Focus on impact",
    detail: "Work on projects that solve real problems.",
  },
  {
    icon: TrendingUp,
    title: "Show your skills",
    detail: "Turn your ideas into measurable results.",
  },
  {
    icon: Code2,
    title: "Own the story",
    detail: "Be ready to explain every decision you made.",
  },
] as const;

export function EvidencePanel() {
  return (
    <section className="overflow-hidden rounded-lg border border-[#b9e7df] bg-white">
      <div className="grid min-h-[258px] items-center gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="relative flex h-full min-h-[238px] items-center justify-center overflow-hidden bg-[#fbfefd] px-8">
          <Image
            src="/images/dashboard/evidence-2d-generated.png"
            alt=""
            width={720}
            height={420}
            className="pointer-events-none w-full max-w-[330px] object-contain opacity-95"
            sizes="330px"
          />
        </div>

        <div className="border-t border-[#e3eeeb] px-7 py-6 lg:border-l lg:border-t-0">
          <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-[#10213e]">
            <StaggeredText text="Build your next project." highlightWords={["project."]} />
          </h2>
          <p className="mt-2 max-w-[640px] text-[14px] font-medium leading-6 text-[#60708d]">
            Projects create proof. Build something that strengthens your profile and gives you
            real interview stories to own.
          </p>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            {projectProofItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`flex items-start gap-3 ${index > 0 ? "xl:border-l xl:border-[#e4ecea] xl:pl-5" : ""}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#eef8f5] text-[#078f7c]">
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-extrabold leading-5 text-[#172943]">
                      {item.title}
                    </h3>
                    <p className="mt-1 max-w-[180px] text-[11px] font-medium leading-4 text-[#66758f]">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#078f7c] px-5 text-sm font-bold text-white transition-colors hover:bg-[#067b6b]"
          >
            Create a project
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
