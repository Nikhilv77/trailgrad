import { neon } from "@neondatabase/serverless";

import type {
  OnboardingSubmission,
  TrailgradProfileRecord,
} from "@/lib/services/profile-service";

interface ProfileRow {
  clerk_user_id: string;
  onboarding_completed_at: string | Date | null;
  onboarding: OnboardingSubmission | string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

let ensureProfilesTablePromise: Promise<void> | null = null;

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Trailgrad profile storage.");
  }

  return neon(databaseUrl);
}

function toIsoString(value: string | Date | null) {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function parseOnboarding(value: ProfileRow["onboarding"]) {
  if (!value) {
    return null;
  }

  return typeof value === "string"
    ? (JSON.parse(value) as OnboardingSubmission)
    : value;
}

function toProfileRecord(row: ProfileRow): TrailgradProfileRecord {
  const createdAt = toIsoString(row.created_at);
  const updatedAt = toIsoString(row.updated_at);

  if (!createdAt || !updatedAt) {
    throw new Error("Trailgrad profile row is missing timestamps.");
  }

  return {
    clerkUserId: row.clerk_user_id,
    onboardingCompletedAt: toIsoString(row.onboarding_completed_at),
    onboarding: parseOnboarding(row.onboarding),
    createdAt,
    updatedAt,
  };
}

export async function ensureProfilesTable() {
  if (!ensureProfilesTablePromise) {
    const sql = getSql();

    ensureProfilesTablePromise = sql`
      create table if not exists user_profiles (
        clerk_user_id text primary key,
        onboarding_completed_at timestamptz,
        onboarding jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `.then(() => undefined);
  }

  return ensureProfilesTablePromise;
}

export async function getOrCreateProfileRecord(clerkUserId: string) {
  await ensureProfilesTable();

  const sql = getSql();
  const rows = (await sql.query(
    `
      with inserted as (
        insert into user_profiles (clerk_user_id)
        values ($1)
        on conflict (clerk_user_id) do nothing
        returning
          clerk_user_id,
          onboarding_completed_at,
          onboarding,
          created_at,
          updated_at
      )
      select
        clerk_user_id,
        onboarding_completed_at,
        onboarding,
        created_at,
        updated_at
      from inserted
      union all
      select
        clerk_user_id,
        onboarding_completed_at,
        onboarding,
        created_at,
        updated_at
      from user_profiles
      where clerk_user_id = $1
      limit 1
    `,
    [clerkUserId],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to create Trailgrad profile.");
  }

  return toProfileRecord(row);
}

export async function completeProfileOnboardingRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  const sql = getSql();
  const rows = (await sql.query(
    `
      insert into user_profiles (
        clerk_user_id,
        onboarding_completed_at,
        onboarding,
        updated_at
      )
      values ($1, now(), $2::jsonb, now())
      on conflict (clerk_user_id) do update set
        onboarding = excluded.onboarding,
        onboarding_completed_at = coalesce(
          user_profiles.onboarding_completed_at,
          excluded.onboarding_completed_at
        ),
        updated_at = now()
      returning
        clerk_user_id,
        onboarding_completed_at,
        onboarding,
        created_at,
        updated_at
    `,
    [clerkUserId, JSON.stringify(onboarding)],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to complete Trailgrad onboarding.");
  }

  return toProfileRecord(row);
}
