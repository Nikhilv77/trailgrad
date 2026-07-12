export type PreparationIntensity = "light" | "standard" | "intensive";

export type SourceDocumentType = "resume";

export type SourceDocumentProcessingStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "EXTRACTED"
  | "FAILED";

export type ResumeExtractedTextStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "EXTRACTED"
  | "FAILED";

export interface CareerContextRecord {
  profileId: string;
  primaryTargetRole: string;
  experienceLevel: string;
  targetCompany: string | null;
  targetJobTitle: string | null;
  interviewOrApplicationDate: string | null;
  noDateYet: boolean;
  dailyPreparationMinutes: number | null;
  flexiblePreparationTime: boolean;
  preparationIntensity: PreparationIntensity;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TargetContextRecord {
  id: string;
  profileId: string;
  role: string;
  company: string | null;
  jobTitle: string | null;
  jobDescription: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManualProjectRecord {
  id: string;
  profileId: string;
  name: string;
  description: string;
  projectUrl: string | null;
  repositoryUrl: string | null;
  technologies: string[] | null;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceDocumentRecord {
  id: string;
  profileId: string;
  sourceType: SourceDocumentType;
  originalFilename: string;
  mimeType: string;
  storagePath: string;
  fileSize: number;
  sha256ContentHash: string;
  processingStatus: SourceDocumentProcessingStatus;
  errorCode: string | null;
  version: number;
  createdAt: string;
}

export interface ResumeVersionRecord {
  id: string;
  profileId: string;
  sourceDocumentId: string;
  version: number;
  extractedTextStatus: ResumeExtractedTextStatus;
  extractedText: string | null;
  errorCode: string | null;
  active: boolean;
  createdAt: string;
}
