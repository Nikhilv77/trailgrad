export type RiskLevel = "low" | "medium" | "high";
export type CareerStage = "Student" | "Fresher" | "Working Professional";
export type TargetRole = "AI Engineer" | "Frontend Engineer" | "Backend Engineer" | "Data Analyst" | "Product Manager";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  careerStage: CareerStage;
  targetRole: TargetRole;
  experienceLevel: string;
  interviewTimeline: string;
  location: string;
  preferredFeedbackStyle: "Friendly Coach" | "Strict Interviewer" | "Senior Engineer" | "HR Style";
};

export type WeakArea = {
  label: string;
  severity: RiskLevel;
  evidence: string;
  fix: string;
};

export type ResumeAnalysis = {
  score: number;
  riskLevel: RiskLevel;
  atsScore: number;
  summary: string;
  criticalIssues: string[];
  weakBullets: { before: string; after: string }[];
  skillsWithoutProof: string[];
  missingMetrics: string[];
  suggestedBullets: string[];
};

export type JDAnalysis = {
  role: string;
  seniority: string;
  requiredSkills: string[];
  responsibilities: string[];
  hiddenSignals: string[];
  interviewThemes: string[];
};

export type JDMatch = {
  matchScore: number;
  strongMatches: string[];
  weakMatches: string[];
  missingProof: string[];
  rejectionRisks: string[];
  recommendedNextSteps: string[];
};

export type Project = {
  id: string;
  name: string;
  summary: string;
  techStack: string[];
  proofScore: number;
  interviewRisk: RiskLevel;
  missingProof: string[];
  githubUrl?: string;
};

export type ProjectAnalysis = {
  projectId: string;
  depthScore: number;
  riskLevel: RiskLevel;
  strengths: string[];
  gaps: string[];
  suggestedProof: string[];
};

export type InterviewRound = "resume_screen" | "project_deep_dive" | "system_design" | "behavioral" | "hr";

export type InterviewQuestion = {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  expectedPoints: string[];
  followUps: string[];
};

export type InterviewAnswer = {
  question: string;
  answer: string;
  context?: string;
};

export type AnswerFeedback = {
  overallScore: number;
  clarityScore: number;
  technicalDepthScore: number;
  specificityScore: number;
  confidenceScore: number;
  hireSignal: "weak" | "mixed" | "strong";
  whatWasGood: string[];
  missingPoints: string[];
  improvedAnswer: string;
  followUpQuestion: string;
  nextPracticeTopics: string[];
};

export type RejectionReport = {
  overallRisk: number;
  riskLevel: RiskLevel;
  breakdown: { label: string; score: number; level: RiskLevel }[];
  topReasons: { reason: string; whyItMatters: string; howToFix: string; relatedTasks: string[] }[];
};

export type PracticeTask = {
  id: string;
  title: string;
  detail: string;
  area: string;
  completed: boolean;
};

export type PracticePlan = {
  days: {
    day: number;
    theme: string;
    tasks: PracticeTask[];
  }[];
};

export type ProgressSnapshot = {
  readinessTrend: number[];
  weakAreas: WeakArea[];
  completedTasks: number;
  totalTasks: number;
  streakDays: number;
};

export type DashboardSnapshot = {
  readiness: number;
  rejectionRisk: number;
  jdMatch: number;
  projectDepth: "Low" | "Medium" | "High";
  practiceStreak: number;
  topRisks: string[];
  todayPlan: PracticeTask[];
  progress: ProgressSnapshot;
};
