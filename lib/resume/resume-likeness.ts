import { classifyResumeText } from "@/lib/resume/resume-classifier";

export interface ResumeLikenessResult {
  resumeLike: boolean;
  reasons: string[];
  signals: {
    bulletCount: number;
    hasCompanySignal: boolean;
    hasContactSignal: boolean;
    hasDateSignal: boolean;
    hasRoleSignal: boolean;
    hasSkillSignal: boolean;
    sectionCount: number;
    wordCount: number;
  };
}

export function validateResumeLikeText(text: string): ResumeLikenessResult {
  const classification = classifyResumeText({ text });

  return {
    resumeLike: classification.verdict === "resume",
    reasons: classification.reasons,
    signals: {
      bulletCount: classification.signals.bulletCount,
      hasCompanySignal: classification.signals.datedRoleCount > 0,
      hasContactSignal: classification.signals.contactSignalCount > 0,
      hasDateSignal: classification.signals.datedRoleCount > 0,
      hasRoleSignal: classification.signals.roleSignalCount > 0,
      hasSkillSignal: classification.signals.skillSignalCount > 0,
      sectionCount: classification.signals.resumeSectionCount,
      wordCount: classification.signals.wordCount,
    },
  };
}
