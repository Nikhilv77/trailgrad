export type ResumeUploadErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "UNSUPPORTED_FILE_TYPE"
  | "INVALID_EXTENSION"
  | "OVERSIZED_FILE"
  | "RESUME_TOO_LONG"
  | "EMPTY_FILE"
  | "UNREADABLE_RESUME"
  | "RESUME_NOT_DETECTED"
  | "IMAGE_ONLY_PDF"
  | "PASSWORD_PROTECTED"
  | "EXTRACTION_FAILURE"
  | "STORAGE_FAILURE";

const messages: Record<ResumeUploadErrorCode, string> = {
  AUTHENTICATION_REQUIRED: "Authentication required.",
  UNSUPPORTED_FILE_TYPE: "Resume must be a PDF or DOCX file.",
  INVALID_EXTENSION: "Resume filename must end in .pdf or .docx.",
  OVERSIZED_FILE: "Resume file is too large.",
  RESUME_TOO_LONG: "This file is too long to be a resume.",
  EMPTY_FILE: "Resume file is empty.",
  UNREADABLE_RESUME: "We could not read that resume file.",
  RESUME_NOT_DETECTED: "This file does not look like a resume.",
  IMAGE_ONLY_PDF: "Upload a text-based PDF or DOCX. Scanned resumes are not supported yet.",
  PASSWORD_PROTECTED: "Remove the password from this resume and upload it again.",
  EXTRACTION_FAILURE: "We could not extract text from that resume.",
  STORAGE_FAILURE: "We could not store that resume. Try again.",
};

export class ResumeUploadError extends Error {
  constructor(
    readonly code: ResumeUploadErrorCode,
    message = messages[code],
  ) {
    super(message);
    this.name = "ResumeUploadError";
  }
}

export function getResumeUploadErrorMessage(code: ResumeUploadErrorCode) {
  return messages[code];
}

export function toSafeResumeUploadError(error: unknown) {
  if (error instanceof ResumeUploadError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "EXTRACTION_FAILURE" as const,
    message: messages.EXTRACTION_FAILURE,
  };
}
