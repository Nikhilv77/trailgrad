import { normalizeResumeText } from "@/lib/resume/normalize";

export type ResumeClassificationVerdict = "resume" | "not_resume" | "uncertain";

export type DetectedDocumentType =
  | "resume"
  | "cv"
  | "product_doc"
  | "proposal"
  | "invoice"
  | "academic"
  | "presentation"
  | "other";

export interface ResumeClassification {
  verdict: ResumeClassificationVerdict;
  confidence: number;
  detectedDocumentType: DetectedDocumentType;
  reasons: string[];
  signals: {
    bulletCount: number;
    contactSignalCount: number;
    datedRoleCount: number;
    degreeSignalCount: number;
    documentSignalCount: number;
    hasNameLikeHeader: boolean;
    pageCount?: number;
    resumeSectionCount: number;
    roleSignalCount: number;
    skillSignalCount: number;
    wordCount: number;
  };
}

const resumeSectionPatterns = [
  /\b(work|professional)?\s*experience\b/i,
  /\bemployment\b/i,
  /\bsummary\b/i,
  /\beducation\b/i,
  /\bskills?\b/i,
  /\bprojects?\b/i,
  /\bcertifications?\b/i,
  /\bachievements?\b/i,
  /\bpublications?\b/i,
  /\bvolunteer(ing)?\b/i,
];

const rolePattern =
  /\b(engineer|developer|analyst|scientist|designer|manager|consultant|intern|lead|architect|specialist|coordinator|administrator|researcher|director|associate|founder|owner|teacher|professor|accountant|marketer|writer|editor|nurse|assistant)\b/gi;
const datePattern =
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}\b|\b\d{1,2}\/(?:19|20)\d{2}\b|\b(?:19|20)\d{2}\b/gi;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /\+?\d[\d\s().-]{7,}\d/g;
const profilePattern = /\b(linkedin\.com|github\.com|gitlab\.com|portfolio)\b/gi;
const degreePattern =
  /\b(bachelor|master|ph\.?d|doctorate|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|mba|degree|university|college|institute)\b/gi;
const skillPattern =
  /\b(javascript|typescript|react|node\.?js|python|java|aws|azure|gcp|docker|kubernetes|postgres|postgresql|sql|cloud|architecture|api|apis|machine learning|data analysis|figma|excel|salesforce|marketing|analytics|leadership|communication|project management)\b/gi;
const bulletPattern = /^\s*(?:[-*•‣]|[0-9]+[.)])\s+\S+/gm;
const inlineBulletPattern = /[•‣▪◦]\s+\S+/g;

const productDocPatterns = [
  /\bproduct requirements document\b/i,
  /\bprd\b/i,
  /\bui specification\b/i,
  /\bdesign language\b/i,
  /\bkey components\b/i,
  /\bpurpose\b/i,
  /\bexpected user interactions\b/i,
  /\bfuture enhancements\b/i,
  /\bacceptance criteria\b/i,
  /\buser flow\b/i,
  /\bwireframe\b/i,
  /\bmockup\b/i,
  /\bfigure\s+\d+\b/i,
  /\btable of contents\b/i,
];
const proposalPatterns = [
  /\bproposal\b/i,
  /\bscope of work\b/i,
  /\bstakeholders?\b/i,
  /\btimeline\b/i,
  /\bdeliverables?\b/i,
  /\bmilestones?\b/i,
];
const invoicePatterns = [
  /\binvoice\b/i,
  /\bamount due\b/i,
  /\bbill to\b/i,
  /\bpayment terms\b/i,
  /\btax\b/i,
];
const academicPatterns = [
  /\bsyllabus\b/i,
  /\bresearch paper\b/i,
  /\babstract\b/i,
  /\breferences\b/i,
  /\bbibliography\b/i,
];
const presentationPatterns = [
  /\bslide\b/i,
  /\bdeck\b/i,
  /\bagenda\b/i,
  /\bpresentation\b/i,
];

export function classifyResumeText(input: {
  text: string;
  pageCount?: number;
}): ResumeClassification {
  const normalized = normalizeResumeText(input.text);
  const words = normalized.match(/\b[\p{L}\p{N}][\p{L}\p{N}'+.-]*\b/gu) ?? [];
  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const resumeSectionCount = resumeSectionPatterns.filter((pattern) =>
    pattern.test(normalized),
  ).length;
  const bulletCount = Math.max(
    normalized.match(bulletPattern)?.length ?? 0,
    normalized.match(inlineBulletPattern)?.length ?? 0,
  );
  const contactSignalCount = countSignals(normalized, [
    emailPattern,
    phonePattern,
    profilePattern,
  ]);
  const roleSignalCount = uniqueMatches(normalized, rolePattern).length;
  const skillSignalCount = uniqueMatches(normalized, skillPattern).length;
  const degreeSignalCount = uniqueMatches(normalized, degreePattern).length;
  const datedRoleCount = countDatedRoleLines(lines);
  const hasNameLikeHeader = hasLikelyNameHeader(lines);
  const productSignalCount = countPatterns(normalized, productDocPatterns);
  const proposalSignalCount = countPatterns(normalized, proposalPatterns);
  const invoiceSignalCount = countPatterns(normalized, invoicePatterns);
  const academicSignalCount = countPatterns(normalized, academicPatterns);
  const presentationSignalCount = countPatterns(normalized, presentationPatterns);
  const documentSignalCount =
    productSignalCount +
    proposalSignalCount +
    invoiceSignalCount +
    academicSignalCount +
    presentationSignalCount;
  const detectedDocumentType = detectDocumentType({
    productSignalCount,
    proposalSignalCount,
    invoiceSignalCount,
    academicSignalCount,
    presentationSignalCount,
    resumeSectionCount,
  });
  const positiveScore =
    Math.min(resumeSectionCount, 5) * 16 +
    Math.min(contactSignalCount, 3) * 12 +
    Math.min(datedRoleCount, 3) * 14 +
    Math.min(roleSignalCount, 5) * 5 +
    Math.min(skillSignalCount, 8) * 3 +
    Math.min(degreeSignalCount, 3) * 5 +
    Math.min(bulletCount, 8) * 2 +
    (hasNameLikeHeader ? 8 : 0);
  const negativeScore =
    documentSignalCount * 12 +
    (input.pageCount && input.pageCount > 5 ? 35 : 0) +
    (words.length > 2500 ? 12 : 0) +
    (resumeSectionCount < 2 ? 12 : 0);
  const rawScore = positiveScore - negativeScore;
  const reasons: string[] = [];

  if (words.length < 30) {
    reasons.push("not enough extracted text");
  }

  if (input.pageCount && input.pageCount > 5) {
    reasons.push("too many pages for a resume");
  }

  if (documentSignalCount >= 2) {
    reasons.push(`looks like a ${humanizeDocumentType(detectedDocumentType)}`);
  }

  if (resumeSectionCount < 2) {
    reasons.push("missing common resume sections");
  }

  if (contactSignalCount === 0 && !hasNameLikeHeader) {
    reasons.push("missing contact or candidate header signals");
  }

  if (datedRoleCount === 0 && roleSignalCount < 2 && bulletCount < 2) {
    reasons.push("missing role, date, or work-history evidence");
  }

  const verdict = getVerdict({
    documentSignalCount,
    detectedDocumentType,
    inputWordCount: words.length,
    pageCount: input.pageCount,
    positiveScore,
    rawScore,
    resumeSectionCount,
  });
  const confidence = getConfidence({
    documentSignalCount,
    positiveScore,
    rawScore,
    verdict,
  });

  return {
    verdict,
    confidence,
    detectedDocumentType: verdict === "resume" ? "resume" : detectedDocumentType,
    reasons,
    signals: {
      bulletCount,
      contactSignalCount,
      datedRoleCount,
      degreeSignalCount,
      documentSignalCount,
      hasNameLikeHeader,
      pageCount: input.pageCount,
      resumeSectionCount,
      roleSignalCount,
      skillSignalCount,
      wordCount: words.length,
    },
  };
}

function countSignals(text: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => {
    pattern.lastIndex = 0;
    return count + (pattern.test(text) ? 1 : 0);
  }, 0);
}

function countPatterns(text: string, patterns: RegExp[]) {
  return patterns.filter((pattern) => pattern.test(text)).length;
}

function uniqueMatches(text: string, pattern: RegExp) {
  pattern.lastIndex = 0;

  return Array.from(new Set(Array.from(text.matchAll(pattern), ([match]) => match.toLowerCase())));
}

function countDatedRoleLines(lines: string[]) {
  return lines.filter((line) => {
    rolePattern.lastIndex = 0;
    datePattern.lastIndex = 0;

    return rolePattern.test(line) && datePattern.test(line);
  }).length;
}

function hasLikelyNameHeader(lines: string[]) {
  const firstLines = lines.slice(0, 4);

  return firstLines.some((line) => {
    const withoutSeparators = line.replace(/[|•,().+-]/g, " ");
    const words = withoutSeparators.split(/\s+/).filter(Boolean);

    return (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every((word) => /^[A-Z][a-zA-Z'-]{1,}$/.test(word)) &&
      !resumeSectionPatterns.some((pattern) => pattern.test(line))
    );
  });
}

function detectDocumentType(input: {
  productSignalCount: number;
  proposalSignalCount: number;
  invoiceSignalCount: number;
  academicSignalCount: number;
  presentationSignalCount: number;
  resumeSectionCount: number;
}): DetectedDocumentType {
  const scores: Array<[DetectedDocumentType, number]> = [
    ["product_doc", input.productSignalCount],
    ["proposal", input.proposalSignalCount],
    ["invoice", input.invoiceSignalCount],
    ["academic", input.academicSignalCount],
    ["presentation", input.presentationSignalCount],
  ];
  const [type, score] = scores.sort((a, b) => b[1] - a[1])[0] ?? ["other", 0];

  if (score >= 2) {
    return type;
  }

  if (input.resumeSectionCount >= 4) {
    return "cv";
  }

  return "other";
}

function getVerdict(input: {
  documentSignalCount: number;
  detectedDocumentType: DetectedDocumentType;
  inputWordCount: number;
  pageCount?: number;
  positiveScore: number;
  rawScore: number;
  resumeSectionCount: number;
}): ResumeClassificationVerdict {
  if (input.inputWordCount < 30) {
    return "not_resume";
  }

  if (input.pageCount && input.pageCount > 5) {
    return "not_resume";
  }

  if (
    input.detectedDocumentType !== "other" &&
    input.documentSignalCount >= 3 &&
    input.positiveScore < 90
  ) {
    return "not_resume";
  }

  if (input.rawScore >= 55 && input.resumeSectionCount >= 2) {
    return "resume";
  }

  if (input.rawScore <= 25 || input.documentSignalCount >= 3) {
    return "not_resume";
  }

  return "uncertain";
}

function getConfidence(input: {
  documentSignalCount: number;
  positiveScore: number;
  rawScore: number;
  verdict: ResumeClassificationVerdict;
}) {
  if (input.verdict === "resume") {
    return clamp(Math.round(72 + Math.min(input.rawScore, 70) * 0.4), 72, 98);
  }

  if (input.verdict === "not_resume") {
    return clamp(
      Math.round(70 + input.documentSignalCount * 7 + Math.max(0, 35 - input.rawScore) * 0.35),
      70,
      98,
    );
  }

  return clamp(Math.round(45 + Math.abs(input.rawScore - 40) * 0.25), 40, 68);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function humanizeDocumentType(type: DetectedDocumentType) {
  return type.replace("_", " ");
}
