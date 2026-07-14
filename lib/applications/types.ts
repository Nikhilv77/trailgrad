export type PreparationIntensity = "light" | "standard" | "intensive";

export type PreparationTimePerDay = "15" | "30" | "60" | "flexible";

export type TargetJobMode = "paste" | "skip";

export type TrailFocus = "job" | "learning";

export interface ApplicationSubmission {
  trailFocus: TrailFocus;
  targetRole: string;
  experienceLevel: string;
  targetCompany?: string;
  targetJobTitle?: string;
  applicationDate?: string;
  noDateYet?: boolean;
  preparationTimePerDay: PreparationTimePerDay;
  preparationIntensity: PreparationIntensity;
  targetJobMode: TargetJobMode;
  jobDescription?: string;
}
