import { createHash, randomUUID } from "node:crypto";

import {
  activateResumeVersionRecord,
  findResumeSourceDocumentByHashRecord,
  getOrCreateProfileRecord,
  markResumeSourceDocumentStatusRecord,
  recordFailedResumeVersionRecord,
  reserveResumeSourceDocumentRecord,
  updateOnboardingResumeMetadataRecord,
} from "@/lib/db/profile-repository";
import type { OnboardingState } from "@/lib/onboarding/types";
import { sanitizeFilename } from "@/lib/resume/filename";
import { normalizeResumeText } from "@/lib/resume/normalize";
import { getResumeParser } from "@/lib/resume/parsers";
import { classifyResumeText } from "@/lib/resume/resume-classifier";
import {
  ResumeUploadError,
  type ResumeUploadErrorCode,
} from "@/lib/resume/upload-errors";
import { getPrivateObjectStorage } from "@/lib/storage/private-object-storage";

const PDF_CONTENT_TYPE = "application/pdf";
const DOCX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const defaultMaxResumeSizeBytes = 5 * 1024 * 1024;
const defaultMaxResumePageCount = 5;

export interface ResumeUploadResult {
  fileName: string;
  contentType: string;
  fileSize: number;
  duplicate: boolean;
  processingStatus: "UPLOADED" | "EXTRACTING" | "EXTRACTED" | "FAILED";
  resumeVersionId: string;
  state: OnboardingState;
}

export function getMaxResumeSizeBytes() {
  const parsed = Number(process.env.RESUME_MAX_UPLOAD_BYTES);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : defaultMaxResumeSizeBytes;
}

export function getMaxResumePageCount() {
  const parsed = Number(process.env.RESUME_MAX_PAGE_COUNT);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : defaultMaxResumePageCount;
}

export async function uploadAuthenticatedResume(input: {
  clerkUserId: string;
  fileName: string;
  contentType: string;
  bytes: Buffer;
}) {
  const profile = await getOrCreateProfileRecord(input.clerkUserId);
  const sanitizedFilename = sanitizeFilename(input.fileName);
  const contentType = normalizeContentType(input.contentType, sanitizedFilename);

  validateResumeFile({
    fileName: sanitizedFilename,
    contentType,
    size: input.bytes.length,
  });

  const sha256ContentHash = createHash("sha256").update(input.bytes).digest("hex");
  const existing = await findResumeSourceDocumentByHashRecord(
    profile.clerkUserId,
    sha256ContentHash,
  );

  if (existing?.processingStatus === "EXTRACTED") {
    try {
      await parseAndValidateResume({
        bytes: input.bytes,
        contentType,
        fileName: sanitizedFilename,
      });
    } catch (error) {
      const errorCode = getSafeErrorCode(error);

      await markResumeSourceDocumentStatusRecord(
        profile.clerkUserId,
        existing.id,
        "FAILED",
        errorCode,
      );
      await recordFailedResumeVersionRecord({
        clerkUserId: profile.clerkUserId,
        sourceDocumentId: existing.id,
        errorCode,
      }).catch(() => undefined);

      throw error;
    }

    const resumeVersion = await activateResumeVersionRecord({
      clerkUserId: profile.clerkUserId,
      sourceDocumentId: existing.id,
      extractedText: null,
      extractedTextStatus: "EXTRACTED",
    });
    const updatedProfile = await updateOnboardingResumeMetadataRecord(
      profile.clerkUserId,
      {
        fileName: existing.originalFilename,
        contentType: existing.mimeType,
        fileSize: existing.fileSize,
      },
    );

    return {
      fileName: existing.originalFilename,
      contentType: existing.mimeType,
      fileSize: existing.fileSize,
      duplicate: true,
      processingStatus: existing.processingStatus,
      resumeVersionId: resumeVersion.id,
      state: toOnboardingState(updatedProfile),
    } satisfies ResumeUploadResult;
  }

  const sourceDocumentId = existing?.id ?? randomUUID();
  const storagePath =
    existing?.storagePath ??
    `profiles/${encodeURIComponent(profile.clerkUserId)}/resumes/${sourceDocumentId}/${sanitizedFilename}`;
  const reservationResult = existing
    ? {
        sourceDocument: existing,
        isNew: false,
      }
    : await reserveResumeSourceDocumentRecord({
        clerkUserId: profile.clerkUserId,
        sourceDocumentId,
        originalFilename: sanitizedFilename,
        mimeType: contentType,
        storagePath,
        fileSize: input.bytes.length,
        sha256ContentHash,
      });
  const reservation = reservationResult.sourceDocument;
  let uploadedObject = false;

  if (reservationResult.isNew) {
    try {
      await getPrivateObjectStorage().putObject({
        key: reservation.storagePath,
        bytes: input.bytes,
        contentType,
        contentLength: input.bytes.length,
        contentHash: sha256ContentHash,
      });
      uploadedObject = true;
    } catch (error) {
      await markResumeSourceDocumentStatusRecord(
        profile.clerkUserId,
        reservation.id,
        "FAILED",
        getSafeErrorCode(error),
      );
      throw error;
    }
  }

  try {
    await markResumeSourceDocumentStatusRecord(
      profile.clerkUserId,
      reservation.id,
      "EXTRACTING",
    );
    const extractedText = await parseAndValidateResume({
      bytes: input.bytes,
      contentType,
      fileName: sanitizedFilename,
    });

    await markResumeSourceDocumentStatusRecord(
      profile.clerkUserId,
      reservation.id,
      "EXTRACTED",
    );
    const resumeVersion = await activateResumeVersionRecord({
      clerkUserId: profile.clerkUserId,
      sourceDocumentId: reservation.id,
      extractedText,
      extractedTextStatus: "EXTRACTED",
    });
    const updatedProfile = await updateOnboardingResumeMetadataRecord(
      profile.clerkUserId,
      {
        fileName: sanitizedFilename,
        contentType,
        fileSize: input.bytes.length,
      },
    );

    return {
      fileName: sanitizedFilename,
      contentType,
      fileSize: input.bytes.length,
      duplicate: Boolean(existing),
      processingStatus: "EXTRACTED",
      resumeVersionId: resumeVersion.id,
      state: toOnboardingState(updatedProfile),
    } satisfies ResumeUploadResult;
  } catch (error) {
    const errorCode = getSafeErrorCode(error);
    await markResumeSourceDocumentStatusRecord(
      profile.clerkUserId,
      reservation.id,
      "FAILED",
      errorCode,
    );
    await recordFailedResumeVersionRecord({
      clerkUserId: profile.clerkUserId,
      sourceDocumentId: reservation.id,
      errorCode,
    }).catch(() => undefined);

    if (uploadedObject) {
      await getPrivateObjectStorage().deleteObject(reservation.storagePath);
    }

    throw error;
  }
}

function validateResumeFile(input: {
  fileName: string;
  contentType: string;
  size: number;
}) {
  const lowerName = input.fileName.toLowerCase();

  if (input.size <= 0) {
    throw new ResumeUploadError("EMPTY_FILE");
  }

  if (input.size > getMaxResumeSizeBytes()) {
    throw new ResumeUploadError("OVERSIZED_FILE");
  }

  if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx")) {
    throw new ResumeUploadError("INVALID_EXTENSION");
  }

  if (lowerName.endsWith(".pdf") && input.contentType !== PDF_CONTENT_TYPE) {
    throw new ResumeUploadError("UNSUPPORTED_FILE_TYPE");
  }

  if (lowerName.endsWith(".docx") && input.contentType !== DOCX_CONTENT_TYPE) {
    throw new ResumeUploadError("UNSUPPORTED_FILE_TYPE");
  }
}

function normalizeContentType(contentType: string, fileName: string) {
  const lowerName = fileName.toLowerCase();
  const genericContentTypes = new Set([
    "",
    "application/octet-stream",
    "binary/octet-stream",
  ]);

  if (contentType === PDF_CONTENT_TYPE || contentType === DOCX_CONTENT_TYPE) {
    return contentType;
  }

  if (genericContentTypes.has(contentType) && lowerName.endsWith(".pdf")) {
    return PDF_CONTENT_TYPE;
  }

  if (genericContentTypes.has(contentType) && lowerName.endsWith(".docx")) {
    return DOCX_CONTENT_TYPE;
  }

  return contentType;
}

async function parseAndValidateResume(input: {
  bytes: Buffer;
  contentType: string;
  fileName: string;
}) {
  const parsed = await getResumeParser(input.contentType, input.fileName).parse(input);

  if (parsed.pageCount && parsed.pageCount > getMaxResumePageCount()) {
    throw new ResumeUploadError("RESUME_TOO_LONG");
  }

  const extractedText = normalizeResumeText(parsed.text);
  const resumeClassification = classifyResumeText({
    text: extractedText,
    pageCount: parsed.pageCount,
  });

  if (resumeClassification.verdict !== "resume") {
    throw new ResumeUploadError("RESUME_NOT_DETECTED");
  }

  return extractedText;
}

function getSafeErrorCode(error: unknown): ResumeUploadErrorCode {
  return error instanceof ResumeUploadError ? error.code : "EXTRACTION_FAILURE";
}

function toOnboardingState(profile: {
  onboardingStatus: OnboardingState["status"];
  currentOnboardingStep: OnboardingState["currentStep"];
  onboardingStartedAt: string | null;
  onboardingCompletedAt: string | null;
  analysisError: string | null;
  onboarding: OnboardingState["onboarding"];
}) {
  return {
    status: profile.onboardingStatus,
    currentStep: profile.currentOnboardingStep,
    startedAt: profile.onboardingStartedAt,
    completedAt: profile.onboardingCompletedAt,
    analysisError: profile.analysisError,
    onboarding: profile.onboarding,
  };
}
