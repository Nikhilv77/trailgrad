"use client";

import type { ReactNode } from "react";
import {
  BadgeCheck,
  BarChart3,
  BrainCog,
  BriefcaseBusiness,
  ChartColumn,
  ChartNoAxesCombined,
  Cpu,
  Database,
  GraduationCap,
  PanelsTopLeft,
  Server,
  SquareCode,
  Target,
  type LucideIcon,
  Workflow,
} from "lucide-react";

import type { TrailFocus } from "@/lib/applications/types";
import {
  experienceLevelCatalog,
  preparationIntensityCatalog,
  preparationTimeCatalog,
  targetRoleCatalog,
} from "@/lib/trails/catalog";

export type TimelineOptionId = "1-month" | "3-months" | "6-months" | "flexible";
export type PrimaryGoalId =
  | "product-companies"
  | "software-interviews"
  | "frontend-interviews"
  | "ai-roles"
  | "data-roles"
  | "portfolio-proof"
  | "career-switch";

export const roleOptions: Array<{
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
}> = targetRoleCatalog.map((role) => ({
  ...role,
  icon:
    {
      "ai-engineer": Cpu,
      "ml-engineer": BrainCog,
      "software-engineer": SquareCode,
      "frontend-engineer": PanelsTopLeft,
      "backend-engineer": Server,
      "full-stack-engineer": Workflow,
      "data-scientist": ChartNoAxesCombined,
      "data-analyst": ChartColumn,
      "data-engineer": Database,
      product: Target,
    }[role.id] ?? BriefcaseBusiness,
}));

export const experienceOptions: Array<{
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
}> = experienceLevelCatalog.map((level) => ({
  ...level,
  icon:
    {
      "student-new-graduate": GraduationCap,
      junior: BadgeCheck,
      "mid-level": BriefcaseBusiness,
      senior: BrainCog,
    }[level.id] ?? BadgeCheck,
}));

export const primaryGoalOptions: Array<{
  description: string;
  icon: LucideIcon;
  id: PrimaryGoalId;
  trailFocus: TrailFocus;
  title: string;
}> = [
  {
    description: "e.g. Google, Microsoft, Amazon",
    icon: Target,
    id: "product-companies",
    title: "Crack top product roles",
    trailFocus: "job",
  },
  {
    description: "System design, coding, behavioral",
    icon: SquareCode,
    id: "software-interviews",
    title: "Land software interviews",
    trailFocus: "job",
  },
  {
    description: "React, UI systems, product craft",
    icon: PanelsTopLeft,
    id: "frontend-interviews",
    title: "Win frontend roles",
    trailFocus: "job",
  },
  {
    description: "LLMs, agents, model products",
    icon: Cpu,
    id: "ai-roles",
    title: "Break into AI roles",
    trailFocus: "job",
  },
  {
    description: "SQL, analytics, ML, dashboards",
    icon: BarChart3,
    id: "data-roles",
    title: "Prepare for data roles",
    trailFocus: "job",
  },
  {
    description: "Build proof for your portfolio",
    icon: GraduationCap,
    id: "portfolio-proof",
    title: "Build portfolio proof",
    trailFocus: "learning",
  },
  {
    description: "Plan a credible transition",
    icon: Workflow,
    id: "career-switch",
    title: "Switch into tech",
    trailFocus: "learning",
  },
];

export const timelineOptions: Array<{
  description: string;
  id: TimelineOptionId;
  months?: number;
  title: string;
}> = [
  { description: "Near-term", id: "1-month", months: 1, title: "1 month" },
  { description: "Focused prep", id: "3-months", months: 3, title: "3 months" },
  { description: "More runway", id: "6-months", months: 6, title: "6 months" },
  { description: "No date", id: "flexible", title: "Flexible" },
];

export const preparationTimeOptions = preparationTimeCatalog;

export const intensityOptions = preparationIntensityCatalog;

export const companyOptions: Array<{
  id: string;
  name: string;
  shortName: string;
  logo: ReactNode;
}> = [
  {
    id: "google",
    name: "Google",
    shortName: "Google",
    logo: <span className="text-[24px] font-bold text-[#4285f4]">G</span>,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    shortName: "Microsoft",
    logo: (
      <span className="grid size-6 grid-cols-2 gap-0.5">
        <span className="bg-[#f25022]" />
        <span className="bg-[#7fba00]" />
        <span className="bg-[#00a4ef]" />
        <span className="bg-[#ffb900]" />
      </span>
    ),
  },
  {
    id: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    logo: <span className="text-[28px] font-bold leading-none text-[#111827]">a</span>,
  },
  {
    id: "meta",
    name: "Meta",
    shortName: "Meta",
    logo: <span className="text-[22px] font-bold tracking-[-0.08em] text-[#0866ff]">Meta</span>,
  },
  {
    id: "apple",
    name: "Apple",
    shortName: "Apple",
    logo: <span className="text-[22px] font-black text-[#111827]">A</span>,
  },
  {
    id: "netflix",
    name: "Netflix",
    shortName: "Netflix",
    logo: <span className="text-[25px] font-black text-[#e50914]">N</span>,
  },
];

export const trailIncludes = [
  "Personalized roadmap",
  "Practice plan",
  "Question engine",
  "Progress tracking",
  "AI feedback & coaching",
  "Mock interviews",
  "Daily priorities",
  "Resource recommendations",
] as const;
