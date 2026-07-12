import { auth } from "@clerk/nextjs/server";

import { uploadAuthenticatedResume } from "@/lib/resume/upload-service";
import {
  ResumeUploadError,
  getResumeUploadErrorMessage,
  toSafeResumeUploadError,
} from "@/lib/resume/upload-errors";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          code: "AUTHENTICATION_REQUIRED",
          error: getResumeUploadErrorMessage("AUTHENTICATION_REQUIRED"),
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      throw new ResumeUploadError("UNSUPPORTED_FILE_TYPE");
    }

    const result = await uploadAuthenticatedResume({
      clerkUserId: userId,
      fileName: file.name,
      contentType: file.type,
      bytes: Buffer.from(await file.arrayBuffer()),
    });

    return Response.json({
      fileName: result.fileName,
      contentType: result.contentType,
      fileSize: result.fileSize,
      duplicate: result.duplicate,
      processingStatus: result.processingStatus,
      state: result.state,
    });
  } catch (error) {
    const safeError = toSafeResumeUploadError(error);
    const status = safeError.code === "AUTHENTICATION_REQUIRED" ? 401 : 400;

    return Response.json(
      {
        code: safeError.code,
        error: safeError.message,
      },
      { status },
    );
  }
}
