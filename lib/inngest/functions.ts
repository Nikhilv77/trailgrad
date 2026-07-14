import { inngest, profileAnalysisRequested } from "@/lib/inngest/client";
import {
  failAnalysisJob,
  requestAnalysisJob,
} from "@/lib/services/analysis-job-service";
import { runMVPProfileAnalysisJob } from "@/lib/services/mvp-profile-analysis-service";

export const profileAnalysisRequestedFunction = inngest.createFunction(
  {
    id: "profile-analysis-requested",
    name: "Profile analysis requested",
    triggers: {
      event: profileAnalysisRequested,
    },
    retries: 0,
    concurrency: {
      limit: 1,
      key: "event.data.idempotencyKey",
    },
  },
  async ({ event, step }) => {
    const reservation = await step.run("create-or-load-analysis-job", () =>
      requestAnalysisJob({
        profileId: event.data.profileId,
        sourceDocumentId: event.data.sourceDocumentId ?? null,
        targetContextId: event.data.targetContextId ?? null,
        type: event.data.type,
        idempotencyKey: event.data.idempotencyKey,
      }),
    );

    try {
      return await step.run("run-mvp-profile-analysis-job", () =>
        runMVPProfileAnalysisJob(reservation.job.id),
      );
    } catch (error) {
      await step.run("mark-analysis-job-failed", () =>
        failAnalysisJob(reservation.job.id, error),
      );

      return {
        profileAnalysis: null,
        executed: true,
        reason: "failed",
        analysisJobId: reservation.job.id,
        safeError:
          error && typeof error === "object" && "code" in error
            ? String(error.code)
            : "PROFILE_ANALYSIS_FAILED",
      };
    }
  },
);

export const inngestFunctions = [profileAnalysisRequestedFunction];
