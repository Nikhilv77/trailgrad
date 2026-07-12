import { beforeEach, describe, expect, it, vi } from "vitest";

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

const repo = vi.hoisted(() => ({
  activateResumeVersionRecord: vi.fn(),
  findResumeSourceDocumentByHashRecord: vi.fn(),
  getOrCreateProfileRecord: vi.fn(),
  markResumeSourceDocumentStatusRecord: vi.fn(),
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
    text: "Experience\nBuilt systems.",
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
    expect(repo.activateResumeVersionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        extractedTextStatus: "FAILED",
        errorCode: "EXTRACTION_FAILURE",
      }),
    );
  });

  it("returns a clear image-only PDF error", async () => {
    parser.parse.mockRejectedValue(new ResumeUploadError("IMAGE_ONLY_PDF"));

    await expect(upload()).rejects.toMatchObject({ code: "IMAGE_ONLY_PDF" });
  });

  it("scopes every operation to the authenticated Clerk profile", async () => {
    await upload({ clerkUserId: "user_a" });

    expect(repo.getOrCreateProfileRecord).toHaveBeenCalledWith("user_a");
    expect(repo.reserveResumeSourceDocumentRecord).toHaveBeenCalledWith(
      expect.objectContaining({ clerkUserId: "user_a" }),
    );
  });
});
