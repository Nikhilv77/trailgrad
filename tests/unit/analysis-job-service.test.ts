import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnalysisJobRecord } from "@/lib/analysis/types";
import { AnalysisJobError, analysisJobStages } from "@/lib/analysis/types";

const repo = vi.hoisted(() => ({
  claimAnalysisJobRecord: vi.fn(),
  completeAnalysisJobRecord: vi.fn(),
  createAnalysisJobRecord: vi.fn(),
  failAnalysisJobRecord: vi.fn(),
  findAnalysisJobByIdRecord: vi.fn(),
  updateAnalysisJobProgressRecord: vi.fn(),
}));

vi.mock("@/lib/db/analysis-job-repository", () => repo);

const baseJob: AnalysisJobRecord = {
  id: "job_1",
  profileId: "user_1",
  sourceDocumentId: "source_1",
  type: "INITIAL_PROFILE",
  status: "QUEUED",
  currentStage: "resume_analysis",
  progressPercent: 0,
  idempotencyKey: "INITIAL_PROFILE:user_1:source_1",
  attemptCount: 0,
  safeErrorCode: null,
  safeErrorMessage: null,
  startedAt: null,
  completedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function job(overrides: Partial<AnalysisJobRecord> = {}): AnalysisJobRecord {
  return {
    ...baseJob,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  repo.createAnalysisJobRecord.mockResolvedValue({
    job: baseJob,
    duplicate: false,
  });
  repo.claimAnalysisJobRecord.mockResolvedValue(
    job({
      status: "RUNNING",
      startedAt: "2026-01-01T00:00:01.000Z",
      attemptCount: 1,
    }),
  );
  repo.updateAnalysisJobProgressRecord.mockImplementation(
    async (_jobId: string, stage: AnalysisJobRecord["currentStage"]) =>
      job({
        status: "RUNNING",
        currentStage: stage,
      }),
  );
  repo.completeAnalysisJobRecord.mockResolvedValue(
    job({
      status: "COMPLETED",
      currentStage: "finalization",
      progressPercent: 100,
      completedAt: "2026-01-01T00:00:02.000Z",
    }),
  );
  repo.failAnalysisJobRecord.mockResolvedValue(
    job({
      status: "FAILED",
      safeErrorCode: "ANALYSIS_JOB_FAILED",
      safeErrorMessage:
        "Trailgrad could not complete this analysis job. Please try again.",
      completedAt: "2026-01-01T00:00:02.000Z",
    }),
  );
  repo.findAnalysisJobByIdRecord.mockResolvedValue(baseJob);
});

describe("analysis job service", () => {
  it("creates analysis jobs with a deterministic idempotency key", async () => {
    const { requestAnalysisJob } = await import("@/lib/services/analysis-job-service");

    await expect(
      requestAnalysisJob({
        profileId: "user_1",
        sourceDocumentId: "source_1",
        type: "INITIAL_PROFILE",
      }),
    ).resolves.toEqual({
      job: baseJob,
      duplicate: false,
    });

    expect(repo.createAnalysisJobRecord).toHaveBeenCalledWith({
      profileId: "user_1",
      sourceDocumentId: "source_1",
      type: "INITIAL_PROFILE",
      idempotencyKey: "INITIAL_PROFILE:user_1:source_1",
    });
  });

  it("keeps duplicate events on the same analysis job", async () => {
    const { requestAnalysisJob } = await import("@/lib/services/analysis-job-service");
    repo.createAnalysisJobRecord
      .mockResolvedValueOnce({
        job: baseJob,
        duplicate: false,
      })
      .mockResolvedValueOnce({
        job: baseJob,
        duplicate: true,
      });

    const first = await requestAnalysisJob({
      profileId: "user_1",
      sourceDocumentId: "source_1",
      type: "INITIAL_PROFILE",
    });
    const second = await requestAnalysisJob({
      profileId: "user_1",
      sourceDocumentId: "source_1",
      type: "INITIAL_PROFILE",
    });

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.job.id).toBe(first.job.id);
  });

  it("surfaces ownership validation failures from the repository", async () => {
    const { requestAnalysisJob } = await import("@/lib/services/analysis-job-service");
    repo.createAnalysisJobRecord.mockRejectedValue(
      new AnalysisJobError(
        "ANALYSIS_JOB_SOURCE_NOT_OWNED",
        "The source document does not belong to this Trailgrad profile.",
      ),
    );

    await expect(
      requestAnalysisJob({
        profileId: "user_2",
        sourceDocumentId: "source_1",
        type: "RESUME_REANALYSIS",
      }),
    ).rejects.toMatchObject({
      code: "ANALYSIS_JOB_SOURCE_NOT_OWNED",
    });
  });

  it("reruns failed jobs as retries and increments through the claimed job", async () => {
    const { runPersistedAnalysisJob } = await import(
      "@/lib/services/analysis-job-service"
    );
    repo.claimAnalysisJobRecord.mockResolvedValue(
      job({
        status: "RUNNING",
        attemptCount: 2,
        safeErrorCode: null,
        safeErrorMessage: null,
      }),
    );

    await expect(runPersistedAnalysisJob("job_1")).resolves.toMatchObject({
      executed: true,
      job: {
        status: "COMPLETED",
      },
    });
    expect(repo.claimAnalysisJobRecord).toHaveBeenCalledWith("job_1");
  });

  it("persists stage progress before completing a job", async () => {
    const { runPersistedAnalysisJob } = await import(
      "@/lib/services/analysis-job-service"
    );

    await expect(runPersistedAnalysisJob("job_1")).resolves.toMatchObject({
      executed: true,
      reason: "completed",
      job: {
        status: "COMPLETED",
        progressPercent: 100,
      },
    });

    expect(repo.updateAnalysisJobProgressRecord).toHaveBeenCalledTimes(
      analysisJobStages.length,
    );
    expect(repo.updateAnalysisJobProgressRecord.mock.calls.map((call) => call[1])).toEqual(
      analysisJobStages,
    );
    expect(repo.completeAnalysisJobRecord).toHaveBeenCalledWith("job_1");
  });

  it("marks jobs failed with a safe error before rethrowing", async () => {
    const { runPersistedAnalysisJob } = await import(
      "@/lib/services/analysis-job-service"
    );
    repo.updateAnalysisJobProgressRecord.mockImplementation(
      async (_jobId: string, stage: AnalysisJobRecord["currentStage"]) => {
        if (stage === "risk_generation") {
          throw new Error("provider secret leaked detail");
        }

        return job({
          status: "RUNNING",
          currentStage: stage,
        });
      },
    );

    await expect(runPersistedAnalysisJob("job_1")).rejects.toThrow(
      "provider secret leaked detail",
    );
    expect(repo.failAnalysisJobRecord).toHaveBeenCalledWith({
      jobId: "job_1",
      safeErrorCode: "ANALYSIS_JOB_FAILED",
      safeErrorMessage:
        "Trailgrad could not complete this analysis job. Please try again.",
    });
  });

  it("skips concurrent duplicate execution when another runner claimed the job", async () => {
    const { runPersistedAnalysisJob } = await import(
      "@/lib/services/analysis-job-service"
    );
    let status: AnalysisJobRecord["status"] = "QUEUED";
    repo.claimAnalysisJobRecord.mockImplementation(async () => {
      if (status !== "QUEUED") {
        return null;
      }

      status = "RUNNING";
      await new Promise((resolve) => setTimeout(resolve, 10));

      return job({
        status: "RUNNING",
      });
    });
    repo.findAnalysisJobByIdRecord.mockResolvedValue(
      job({
        status: "RUNNING",
      }),
    );

    const results = await Promise.all([
      runPersistedAnalysisJob("job_1"),
      runPersistedAnalysisJob("job_1"),
    ]);

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          executed: true,
          reason: "completed",
        }),
        expect.objectContaining({
          executed: false,
          reason: "already_active_or_terminal",
        }),
      ]),
    );
    expect(repo.completeAnalysisJobRecord).toHaveBeenCalledTimes(1);
  });
});
