import { getAIConfiguration } from "@/lib/ai/configuration";
import {
  buildAnalysisJobIdempotencyKey,
  failAnalysisJob,
} from "@/lib/services/analysis-job-service";
import { findAnalysisJobByIdempotencyKeyRecord } from "@/lib/db/analysis-job-repository";
import {
  getOnboardingState,
  listResumeVersions,
  markOnboardingFailed,
  type OnboardingState,
} from "@/lib/services/profile-service";

export async function getReconciledOnboardingState(
  profileId: string,
): Promise<OnboardingState> {
  const state = await getOnboardingState(profileId);

  if (state.status !== "analyzing") {
    return state;
  }

  const job = await findLatestInitialProfileJob(profileId);

  if (!job) {
    return state;
  }

  if (job.status === "FAILED") {
    return {
      ...state,
      status: "failed",
      analysisError:
        job.safeErrorMessage ??
        "Trailgrad could not complete your profile analysis.",
    };
  }

  if (job.status === "RUNNING" && isStaleRunningJob(job.updatedAt)) {
    const message = "The AI request timed out.";

    await failAnalysisJob(job.id, {
      code: "TIMEOUT",
      message,
    }).catch(() => undefined);
    await markOnboardingFailed(profileId, message).catch(() => undefined);

    return {
      ...state,
      status: "failed",
      analysisError: message,
    };
  }

  return state;
}

async function findLatestInitialProfileJob(profileId: string) {
  const resumeVersion = (await listResumeVersions(profileId)).find(
    (version) => version.active && version.extractedTextStatus === "EXTRACTED",
  );

  if (!resumeVersion) {
    return null;
  }

  const idempotencyKey = buildAnalysisJobIdempotencyKey({
    profileId,
    sourceDocumentId: resumeVersion.sourceDocumentId,
    type: "INITIAL_PROFILE",
  });

  return findAnalysisJobByIdempotencyKeyRecord(idempotencyKey);
}

function isStaleRunningJob(updatedAt: string) {
  const configuration = getAIConfiguration();
  const maxProviderAttempts = Math.max(1, configuration.maxRetries + 2);
  const timeoutBudgetMs =
    configuration.defaultTimeoutMs * maxProviderAttempts + 30_000;

  return Date.now() - new Date(updatedAt).getTime() > timeoutBudgetMs;
}

export const onboardingAnalysisStatusTestInternals = {
  isStaleRunningJob,
};
