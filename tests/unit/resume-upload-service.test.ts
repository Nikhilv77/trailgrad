import { beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeResumeText } from "@/lib/resume/normalize";
import { classifyResumeText } from "@/lib/resume/resume-classifier";
import { validateResumeLikeText } from "@/lib/resume/resume-likeness";
import { ResumeUploadError } from "@/lib/resume/upload-errors";

const profile = {
  clerkUserId: "user_resume",
  onboardingStatus: "in_progress" as const,
  currentOnboardingStep: "resume" as const,
  onboardingStartedAt: "2026-01-01T00:00:00.000Z",
  onboardingCompletedAt: null,
  analysisError: null,
  onboarding: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
const sourceDocument = {
  id: "source_1",
  profileId: profile.clerkUserId,
  sourceType: "resume" as const,
  originalFilename: "resume.pdf",
  mimeType: "application/pdf",
  storagePath: "profiles/user_resume/resumes/source_1/resume.pdf",
  fileSize: 128,
  sha256ContentHash: "hash",
  processingStatus: "UPLOADED" as const,
  errorCode: null,
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
};
const resumeVersion = {
  id: "resume_version_1",
  profileId: profile.clerkUserId,
  sourceDocumentId: sourceDocument.id,
  version: 1,
  extractedTextStatus: "EXTRACTED" as const,
  extractedText: "Experience\nBuilt systems.",
  errorCode: null,
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};
const resumeLikeText = [
  "Nikhil Verma",
  "nikhil@example.com",
  "Experience",
  "- Software Engineer at Trailgrad from 2023 to 2026 building React and Node.js products.",
  "- Improved onboarding reliability and shipped PostgreSQL backed dashboards.",
  "Projects",
  "- Resume analysis workflow using Next.js, Prisma, and Inngest.",
  "Skills",
  "TypeScript, React, PostgreSQL, Prisma, Node.js",
  "Education",
  "Bachelor of Technology in Computer Science",
].join("\n");
const michaelMartinezResumeText = [
  "MICHAEL MARTINEZ",
  "Tech Lead | Cloud Solutions | Software Development",
  "+1-(234)-555-1234 • Email • linkedin.com • GitHub • New York City, New York",
  "Summary",
  "Over 7 years of experience in software development and leadership, with a strong command of JavaScript and cloud platforms like AWS.",
  "Skills",
  "JavaScript • AWS • React.js • Docker • Node.js • Cloud Architecture",
  "Experience",
  "Quantum Tech Labs New York, NY Tech Lead 01/2025 - Present",
  "• Led a team of 10 developers in the implementation of a cloud-based application, increasing client efficiency by 40%.",
  "• Designed and architected scalable solutions using AWS, supporting a 50% growth in user traffic year over year.",
  "Tech Innovators Inc. New York, NY Senior Software Developer 07/2022 - 12/2024",
  "• Developed key features for a large-scale web application, leading to an increase in customer satisfaction by 30%.",
  "Education",
  "Columbia University Bachelor of Science in Computer Science 01/2017 - 01/2020",
  "Projects",
  "Open Source React.js Framework developed and maintained a niche React.js framework.",
].join("\n");

const repo = vi.hoisted(() => ({
  activateResumeVersionRecord: vi.fn(),
  findResumeSourceDocumentByHashRecord: vi.fn(),
  getOrCreateProfileRecord: vi.fn(),
  markResumeSourceDocumentStatusRecord: vi.fn(),
  recordFailedResumeVersionRecord: vi.fn(),
  reserveResumeSourceDocumentRecord: vi.fn(),
  updateOnboardingResumeMetadataRecord: vi.fn(),
}));
const storage = vi.hoisted(() => ({
  deleteObject: vi.fn(),
  putObject: vi.fn(),
}));
const parser = vi.hoisted(() => ({
  parse: vi.fn(),
}));

vi.mock("@/lib/db/profile-repository", () => repo);
vi.mock("@/lib/storage/private-object-storage", () => ({
  getPrivateObjectStorage: () => storage,
}));
vi.mock("@/lib/resume/parsers", () => ({
  getResumeParser: () => parser,
}));

async function upload(overrides: {
  clerkUserId?: string;
  fileName?: string;
  contentType?: string;
  bytes?: Buffer;
} = {}) {
  const { uploadAuthenticatedResume } = await import("@/lib/resume/upload-service");

  return uploadAuthenticatedResume({
    clerkUserId: overrides.clerkUserId ?? profile.clerkUserId,
    fileName: overrides.fileName ?? "resume.pdf",
    contentType: overrides.contentType ?? "application/pdf",
    bytes: overrides.bytes ?? Buffer.from("%PDF resume text"),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RESUME_MAX_UPLOAD_BYTES", "1024");
  repo.getOrCreateProfileRecord.mockImplementation(async (clerkUserId: string) => ({
    ...profile,
    clerkUserId,
  }));
  repo.findResumeSourceDocumentByHashRecord.mockResolvedValue(null);
  repo.reserveResumeSourceDocumentRecord.mockResolvedValue({
    sourceDocument,
    isNew: true,
  });
  repo.markResumeSourceDocumentStatusRecord.mockResolvedValue(sourceDocument);
  repo.recordFailedResumeVersionRecord.mockResolvedValue({
    ...resumeVersion,
    extractedTextStatus: "FAILED",
    extractedText: null,
    errorCode: "EXTRACTION_FAILURE",
    active: false,
  });
  repo.activateResumeVersionRecord.mockResolvedValue(resumeVersion);
  repo.updateOnboardingResumeMetadataRecord.mockResolvedValue({
    ...profile,
    onboarding: {
      resumeName: "resume.pdf",
      resumeContentType: "application/pdf",
      resumeSize: 128,
    },
  });
  storage.putObject.mockResolvedValue(undefined);
  storage.deleteObject.mockResolvedValue(undefined);
  parser.parse.mockResolvedValue({
    text: resumeLikeText,
    pageCount: 2,
  });
});

describe("authenticated resume upload service", () => {
  it("uploads and extracts a valid PDF", async () => {
    await expect(upload()).resolves.toMatchObject({
      fileName: "resume.pdf",
      contentType: "application/pdf",
      duplicate: false,
      processingStatus: "EXTRACTED",
    });
    expect(storage.putObject).toHaveBeenCalledOnce();
    expect(repo.activateResumeVersionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkUserId: profile.clerkUserId,
        extractedTextStatus: "EXTRACTED",
      }),
    );
  });

  it("strips PDF NUL characters before storing extracted text", async () => {
    parser.parse.mockResolvedValue({
      text: michaelMartinezResumeText.replace("+1-(234)", "\u00001-\u0000234\u0000"),
    });

    await upload();

    expect(repo.activateResumeVersionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        extractedText: expect.not.stringContaining("\u0000"),
      }),
    );
  });

  it("uploads and extracts a valid DOCX", async () => {
    await expect(
      upload({
        fileName: "resume.docx",
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ).resolves.toMatchObject({
      fileName: "resume.docx",
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  });

  it("rejects unsupported extensions", async () => {
    await expect(
      upload({ fileName: "resume.txt", contentType: "text/plain" }),
    ).rejects.toMatchObject({ code: "INVALID_EXTENSION" });
  });

  it("rejects invalid MIME types", async () => {
    await expect(
      upload({ fileName: "resume.pdf", contentType: "text/plain" }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_FILE_TYPE" });
  });

  it("accepts generic browser MIME types when the extension is supported", async () => {
    await expect(
      upload({ fileName: "resume.pdf", contentType: "application/octet-stream" }),
    ).resolves.toMatchObject({
      contentType: "application/pdf",
      processingStatus: "EXTRACTED",
    });
  });

  it("rejects oversized files", async () => {
    await expect(upload({ bytes: Buffer.alloc(2048) })).rejects.toMatchObject({
      code: "OVERSIZED_FILE",
    });
  });

  it("rejects empty files", async () => {
    await expect(upload({ bytes: Buffer.alloc(0) })).rejects.toMatchObject({
      code: "EMPTY_FILE",
    });
  });

  it("reuses duplicate uploads without storing the object again", async () => {
    repo.findResumeSourceDocumentByHashRecord.mockResolvedValue({
      ...sourceDocument,
      processingStatus: "EXTRACTED",
    });

    await expect(upload()).resolves.toMatchObject({
      duplicate: true,
      processingStatus: "EXTRACTED",
    });
    expect(storage.putObject).not.toHaveBeenCalled();
  });

  it("revalidates duplicate uploads before reusing old extracted records", async () => {
    repo.findResumeSourceDocumentByHashRecord.mockResolvedValue({
      ...sourceDocument,
      processingStatus: "EXTRACTED",
    });
    parser.parse.mockResolvedValue({
      text: resumeLikeText,
      pageCount: 36,
    });

    await expect(upload()).rejects.toMatchObject({ code: "RESUME_TOO_LONG" });
    expect(storage.putObject).not.toHaveBeenCalled();
    expect(repo.markResumeSourceDocumentStatusRecord).toHaveBeenCalledWith(
      profile.clerkUserId,
      sourceDocument.id,
      "FAILED",
      "RESUME_TOO_LONG",
    );
    expect(repo.activateResumeVersionRecord).not.toHaveBeenCalled();
  });

  it("handles simultaneous identical uploads by reusing the reserved source", async () => {
    repo.reserveResumeSourceDocumentRecord.mockResolvedValue({
      sourceDocument,
      isNew: false,
    });

    await upload();
    expect(storage.putObject).not.toHaveBeenCalled();
  });

  it("preserves failed records for storage failures", async () => {
    storage.putObject.mockRejectedValue(new ResumeUploadError("STORAGE_FAILURE"));

    await expect(upload()).rejects.toMatchObject({ code: "STORAGE_FAILURE" });
    expect(repo.markResumeSourceDocumentStatusRecord).toHaveBeenCalledWith(
      profile.clerkUserId,
      sourceDocument.id,
      "FAILED",
      "STORAGE_FAILURE",
    );
  });

  it("preserves failed records for extraction failures", async () => {
    parser.parse.mockRejectedValue(new ResumeUploadError("EXTRACTION_FAILURE"));

    await expect(upload()).rejects.toMatchObject({ code: "EXTRACTION_FAILURE" });
    expect(repo.recordFailedResumeVersionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "EXTRACTION_FAILURE",
      }),
    );
    expect(repo.activateResumeVersionRecord).not.toHaveBeenCalled();
  });

  it("returns a clear image-only PDF error", async () => {
    parser.parse.mockRejectedValue(new ResumeUploadError("IMAGE_ONLY_PDF"));

    await expect(upload()).rejects.toMatchObject({ code: "IMAGE_ONLY_PDF" });
  });

  it("rejects readable documents that do not look like resumes", async () => {
    parser.parse.mockResolvedValue({
      text: [
        "Quarterly Planning Memo",
        "This document summarizes meeting notes, budget discussion, vendor timelines, and team decisions.",
        "The launch plan includes milestones, approvals, and communication owners for the next quarter.",
        "Please review the action items before the operating review.",
      ].join("\n"),
    });

    await expect(upload()).rejects.toMatchObject({ code: "RESUME_NOT_DETECTED" });
    expect(repo.markResumeSourceDocumentStatusRecord).toHaveBeenCalledWith(
      profile.clerkUserId,
      sourceDocument.id,
      "FAILED",
      "RESUME_NOT_DETECTED",
    );
    expect(repo.recordFailedResumeVersionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "RESUME_NOT_DETECTED",
      }),
    );
    expect(repo.activateResumeVersionRecord).not.toHaveBeenCalled();
  });

  it("rejects long PDFs that look like product documents", async () => {
    parser.parse.mockResolvedValue({
      text: resumeLikeText,
      pageCount: 36,
    });

    await expect(upload()).rejects.toMatchObject({ code: "RESUME_TOO_LONG" });
    expect(repo.markResumeSourceDocumentStatusRecord).toHaveBeenCalledWith(
      profile.clerkUserId,
      sourceDocument.id,
      "FAILED",
      "RESUME_TOO_LONG",
    );
    expect(repo.recordFailedResumeVersionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "RESUME_TOO_LONG",
      }),
    );
    expect(repo.activateResumeVersionRecord).not.toHaveBeenCalled();
  });

  it("scopes every operation to the authenticated Clerk profile", async () => {
    await upload({ clerkUserId: "user_a" });

    expect(repo.getOrCreateProfileRecord).toHaveBeenCalledWith("user_a");
    expect(repo.reserveResumeSourceDocumentRecord).toHaveBeenCalledWith(
      expect.objectContaining({ clerkUserId: "user_a" }),
    );
  });
});

describe("resume text validation", () => {
  it("normalizes embedded NUL characters from PDF extraction", () => {
    expect(normalizeResumeText("Phone: \u00001-\u0000234\u0000-555-1234")).toBe(
      "Phone: 1-234-555-1234",
    );
  });

  it("accepts resume-like extracted text", () => {
    expect(classifyResumeText({ text: resumeLikeText, pageCount: 2 })).toMatchObject({
      verdict: "resume",
      detectedDocumentType: "resume",
    });
    expect(validateResumeLikeText(resumeLikeText)).toMatchObject({
      resumeLike: true,
    });
  });

  it("accepts a senior resume with PDF-style flattened text", () => {
    expect(
      classifyResumeText({
        text: michaelMartinezResumeText.replaceAll("\n", " "),
        pageCount: 1,
      }),
    ).toMatchObject({
      verdict: "resume",
    });
    expect(
      validateResumeLikeText(michaelMartinezResumeText.replaceAll("\n", " ")),
    ).toMatchObject({
      resumeLike: true,
    });
  });

  it("rejects generic document text", () => {
    expect(
      classifyResumeText({
        text: [
          "Product Requirements Document",
          "This document explains roadmap priorities, stakeholder notes, and release decisions.",
          "The appendix includes meeting summaries and open questions for leadership review.",
        ].join("\n"),
      }),
    ).toMatchObject({
      verdict: "not_resume",
    });
    expect(
      validateResumeLikeText(
        [
          "Product Requirements Document",
          "This document explains roadmap priorities, stakeholder notes, and release decisions.",
          "The appendix includes meeting summaries and open questions for leadership review.",
        ].join("\n"),
      ),
    ).toMatchObject({
      resumeLike: false,
    });
  });

  it("rejects product specification text with software and project signals", () => {
    const productSpecText = [
      "CourseLeap Product Requirements Document",
      "Premium Product Bible • UI Specification Edition",
      "-- 1 of 36 --",
      "1. Home",
      "Purpose",
      "The Home page is designed to provide a premium, clean and intuitive user experience while maintaining the CourseLeap design language.",
      "This section explains the objective of the page, expected user interactions, key components, and future enhancements.",
      "Key Components",
      "• Modern responsive layout",
      "• Clear visual hierarchy",
      "• Course discovery focused UI",
      "• Affiliate conversion optimization",
      "• Community engagement",
      "• Accessibility and mobile-first design",
      "-- 2 of 36 --",
      "Figure 1: Home UI Mockup",
      "The mockup shows Python for Everybody, rankings, instructors, platforms, reviews, and a generated course summary.",
    ].join("\n");

    expect(classifyResumeText({ text: productSpecText, pageCount: 36 })).toMatchObject({
      verdict: "not_resume",
      detectedDocumentType: "product_doc",
    });
    expect(
      validateResumeLikeText(productSpecText),
    ).toMatchObject({
      resumeLike: false,
    });
  });

  it("does not let uncertain extracted text pass as a resume", () => {
    expect(
      classifyResumeText({
        text: [
          "Alex Morgan",
          "alex@example.com",
          "Skills",
          "Built useful tools and collaborated with teams.",
          "Worked on dashboards, APIs, analysis, and reporting.",
          "Used React, SQL, Python, and cloud services.",
          "- Created internal automations.",
          "- Helped with data cleanup.",
          "Available for new opportunities.",
        ].join("\n"),
      }),
    ).toMatchObject({
      verdict: "uncertain",
    });
  });
});
