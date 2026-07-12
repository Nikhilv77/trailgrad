import { join } from "node:path";
import { pathToFileURL } from "node:url";

import mammoth from "mammoth";
import { InvalidPDFException, PasswordException, PDFParse } from "pdf-parse";

import { normalizeResumeText } from "@/lib/resume/normalize";
import { ResumeUploadError } from "@/lib/resume/upload-errors";

PDFParse.setWorker(
  pathToFileURL(
    join(
      process.cwd(),
      "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs",
    ),
  ).href,
);

export interface ParsedResume {
  text: string;
}

export interface ResumeParser {
  parse(input: {
    bytes: Buffer;
    contentType: string;
    fileName: string;
  }): Promise<ParsedResume>;
}

export class PdfResumeParser implements ResumeParser {
  async parse({ bytes }: { bytes: Buffer }) {
    const parser = new PDFParse({ data: bytes });

    try {
      const result = await parser.getText();
      const text = normalizeResumeText(result.text);

      if (!text || text.length < 20) {
        throw new ResumeUploadError("IMAGE_ONLY_PDF");
      }

      return { text };
    } catch (error) {
      if (error instanceof ResumeUploadError) {
        throw error;
      }

      if (error instanceof PasswordException) {
        throw new ResumeUploadError("PASSWORD_PROTECTED");
      }

      if (error instanceof InvalidPDFException) {
        throw new ResumeUploadError("UNREADABLE_RESUME");
      }

      logExtractionFailure("pdf", error);
      throw new ResumeUploadError("EXTRACTION_FAILURE");
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }
}

export class DocxResumeParser implements ResumeParser {
  async parse({ bytes }: { bytes: Buffer }) {
    try {
      const result = await mammoth.extractRawText({ buffer: bytes });
      const text = normalizeResumeText(result.value);

      if (!text || text.length < 20) {
        throw new ResumeUploadError("UNREADABLE_RESUME");
      }

      return { text };
    } catch (error) {
      if (error instanceof ResumeUploadError) {
        throw error;
      }

      logExtractionFailure("docx", error);
      throw new ResumeUploadError("EXTRACTION_FAILURE");
    }
  }
}

export function getResumeParser(contentType: string, fileName: string): ResumeParser {
  const lowerName = fileName.toLowerCase();

  if (contentType === "application/pdf" || lowerName.endsWith(".pdf")) {
    return new PdfResumeParser();
  }

  return new DocxResumeParser();
}

function logExtractionFailure(kind: "pdf" | "docx", error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const details =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);

  console.warn(`[resume-upload] ${kind} extraction failed: ${details}`);
}
