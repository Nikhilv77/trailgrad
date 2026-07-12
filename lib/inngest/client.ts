import { Inngest, eventType, staticSchema } from "inngest";

import type { AnalysisJobType } from "@/lib/analysis/types";

export type ProfileAnalysisRequestedEventData = {
  profileId: string;
  sourceDocumentId?: string | null;
  type: AnalysisJobType;
  idempotencyKey: string;
} & Record<string, unknown>;

export const profileAnalysisRequested = eventType(
  "trailgrad/profile.analysis.requested",
  {
    schema: staticSchema<ProfileAnalysisRequestedEventData>(),
  },
);

export const inngest = new Inngest({
  id: "trailgrad",
});

export function createProfileAnalysisRequestedEvent(
  data: ProfileAnalysisRequestedEventData,
) {
  return profileAnalysisRequested.create(data, {
    id: String(data.eventId ?? data.idempotencyKey),
  });
}
