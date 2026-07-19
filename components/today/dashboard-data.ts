import {
  BarChart3,
  BookOpen,
  Bookmark,
  Code2,
  FileText,
  Home,
  Layers3,
  MessageSquareText,
  Mic2,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
};

export const navigationGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { icon: Home, label: "Overview" },
      { icon: BookOpen, label: "Lessons" },
      { icon: Target, label: "Practice" },
      { icon: Code2, label: "Projects" },
    ],
  },
  {
    label: "Career tools",
    items: [
      { icon: FileText, label: "Resume" },
      { icon: Mic2, label: "Mock interviews" },
      { icon: BarChart3, label: "Progress" },
      { icon: Bookmark, label: "Resources" },
    ],
  },
];

export const mockDashboard = {
  targetRole: "Full Stack Engineer",
  readiness: 64,
  priority: {
    title: "Defend your project architecture",
    description:
      "Prepare to discuss design decisions, tradeoffs, and how your architecture handles scale, reliability, and change.",
    minutes: 45,
    skill: "System design",
    blocker: "Project depth",
  },
  topGaps: [
    { label: "System design", note: "Study scalable patterns", score: 28 },
    { label: "Backend architecture", note: "Review service design", score: 46 },
    { label: "DSA", note: "Arrays and hashing set", score: 52 },
    { label: "React performance", note: "Memoization and keys", score: 58 },
    { label: "SQL & databases", note: "Advanced joins quiz", score: 72 },
  ],
  trail: [
    { title: "Resume fixes", note: "Optimize and tailor your resume", status: "complete" },
    { title: "Core concepts", note: "Strengthen fundamentals", status: "complete" },
    { title: "Practice questions", note: "Solve targeted questions", status: "complete" },
    {
      title: "Defend your project architecture",
      note: "Prepare to discuss design decisions and tradeoffs",
      status: "active",
    },
    { title: "Mock interview", note: "Simulate a real interview", status: "upcoming" },
    { title: "Final review", note: "Polish and refine", status: "upcoming" },
    { title: "Interview ready", note: "You are all set", status: "upcoming" },
  ],
  domains: [
    { icon: Sparkles, label: "Technical knowledge", score: 68, status: "Strong" },
    { icon: Code2, label: "Problem solving", score: 62, status: "Developing" },
    { icon: Layers3, label: "System design", score: 54, status: "Developing" },
    { icon: MessageSquareText, label: "Communication", score: 58, status: "Developing" },
  ],
} as const;
