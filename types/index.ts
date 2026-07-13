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
