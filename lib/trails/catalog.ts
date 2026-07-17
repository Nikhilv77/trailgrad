export const targetRoleIds = [
  "ai-engineer",
  "ml-engineer",
  "software-engineer",
  "frontend-engineer",
  "backend-engineer",
  "full-stack-engineer",
  "data-scientist",
  "data-analyst",
  "data-engineer",
  "product",
] as const;

export type TargetRoleId = (typeof targetRoleIds)[number];

export const targetRoleCatalog: Array<{
  description: string;
  id: TargetRoleId;
  title: string;
}> = [
  { id: "ai-engineer", title: "AI Engineer", description: "LLMs and agents" },
  { id: "ml-engineer", title: "ML Engineer", description: "Models and pipelines" },
  {
    id: "software-engineer",
    title: "Software Engineer",
    description: "Product engineering",
  },
  { id: "frontend-engineer", title: "Frontend Engineer", description: "React and UI" },
  { id: "backend-engineer", title: "Backend Engineer", description: "APIs and systems" },
  {
    id: "full-stack-engineer",
    title: "Full Stack Engineer",
    description: "Frontend and backend",
  },
  { id: "data-scientist", title: "Data Scientist", description: "Analysis and models" },
  { id: "data-analyst", title: "Data Analyst", description: "SQL and dashboards" },
  { id: "data-engineer", title: "Data Engineer", description: "Data pipelines" },
  { id: "product", title: "Product Manager", description: "PM and strategy" },
];

export const experienceLevelIds = [
  "student-new-graduate",
  "junior",
  "mid-level",
  "senior",
] as const;

export type ExperienceLevelId = (typeof experienceLevelIds)[number];

export const experienceLevelCatalog: Array<{
  description: string;
  id: ExperienceLevelId;
  title: string;
}> = [
  {
    id: "student-new-graduate",
    title: "Student / new grad",
    description: "Coursework projects",
  },
  { id: "junior", title: "Junior", description: "0-2 years" },
  { id: "mid-level", title: "Mid-level", description: "Feature ownership" },
  { id: "senior", title: "Senior", description: "Architecture, teams" },
];

export const preparationTimeCatalog = [
  { description: "Light", id: "15", title: "2-5 hours per week" },
  { description: "Balanced", id: "30", title: "5-10 hours per week" },
  { description: "Deep", id: "60", title: "10+ hours per week" },
  { description: "Flexible", id: "flexible", title: "Flexible schedule" },
] as const;

export const preparationIntensityCatalog = [
  { description: "Easy pace", id: "light", title: "Light" },
  { description: "Balanced", id: "standard", title: "Standard" },
  { description: "Push harder", id: "intensive", title: "Intensive" },
] as const;

export function getTargetRoleLabel(id: string | null | undefined) {
  return targetRoleCatalog.find((role) => role.id === id)?.title ?? id ?? null;
}

export function getExperienceLevelLabel(id: string | null | undefined) {
  return (
    experienceLevelCatalog.find((level) => level.id === id)?.title ?? id ?? null
  );
}

export function getPreparationTimeLabel(id: string | null | undefined) {
  return (
    preparationTimeCatalog.find((time) => time.id === id)?.title ?? id ?? null
  );
}

export function getPreparationIntensityLabel(id: string | null | undefined) {
  return (
    preparationIntensityCatalog.find((intensity) => intensity.id === id)?.title ??
    id ??
    null
  );
}
