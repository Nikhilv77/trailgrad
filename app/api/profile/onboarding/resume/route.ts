import { auth } from "@clerk/nextjs/server";

import { saveOnboardingResume } from "@/lib/services/profile-service";

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const DOCX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isAllowedResume(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    file.type === "application/pdf" ||
    file.type === DOCX_CONTENT_TYPE ||
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".docx")
  );
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Upload a PDF or DOCX resume." },
        { status: 400 },
      );
    }

    if (!isAllowedResume(file)) {
      return Response.json(
        { error: "Resume must be a PDF or DOCX file." },
        { status: 400 },
      );
    }

    if (file.size > MAX_RESUME_SIZE_BYTES) {
      return Response.json(
        { error: "Resume must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const contentBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const profile = await saveOnboardingResume(userId, {
      fileName: file.name,
      contentType: file.type || (file.name.toLowerCase().endsWith(".docx") ? DOCX_CONTENT_TYPE : "application/pdf"),
      fileSize: file.size,
      contentBase64,
    });

    return Response.json({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      state: {
        status: profile.onboardingStatus,
        currentStep: profile.currentOnboardingStep,
        startedAt: profile.onboardingStartedAt,
        completedAt: profile.onboardingCompletedAt,
        analysisError: profile.analysisError,
        onboarding: profile.onboarding,
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to upload resume." },
      { status: 500 },
    );
  }
}
