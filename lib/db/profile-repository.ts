import { neon } from "@neondatabase/serverless";

import type {
  OnboardingState,
  OnboardingStatus,
  OnboardingStepId,
  OnboardingSubmission,
} from "@/lib/onboarding/types";
import type { TrailgradProfileRecord } from "@/lib/services/profile-service";

interface ProfileRow {
  clerk_user_id: string;
  onboarding_status: OnboardingStatus;
  current_onboarding_step: OnboardingStepId;
  onboarding_started_at: string | Date | null;
  onboarding_completed_at: string | Date | null;
  analysis_error: string | null;
  onboarding: OnboardingSubmission | string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

interface ResumeRecordInput {
  fileName: string;
  contentType: string;
  fileSize: number;
  contentBase64: string;
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
    onboardingStatus: row.onboarding_status,
    currentOnboardingStep: row.current_onboarding_step,
    onboardingStartedAt: toIsoString(row.onboarding_started_at),
    onboardingCompletedAt: toIsoString(row.onboarding_completed_at),
    analysisError: row.analysis_error,
    onboarding: parseOnboarding(row.onboarding),
    createdAt,
    updatedAt,
  };
}

function selectProfileColumns() {
  return `
    clerk_user_id,
    onboarding_status,
    current_onboarding_step,
    onboarding_started_at,
    onboarding_completed_at,
    analysis_error,
    onboarding,
    created_at,
    updated_at
  `;
}

function toOnboardingState(profile: TrailgradProfileRecord): OnboardingState {
  return {
    status: profile.onboardingStatus,
    currentStep: profile.currentOnboardingStep,
    startedAt: profile.onboardingStartedAt,
    completedAt: profile.onboardingCompletedAt,
    analysisError: profile.analysisError,
    onboarding: profile.onboarding,
  };
}

export async function ensureProfilesTable() {
  if (!ensureProfilesTablePromise) {
    const sql = getSql();

    ensureProfilesTablePromise = applyProfilesSchema(sql);
  }

  return ensureProfilesTablePromise;
}

async function applyProfilesSchema(sql: ReturnType<typeof getSql>) {
  await sql.query(`
    create table if not exists user_profiles (
      clerk_user_id text primary key,
      onboarding_status text not null default 'not_started',
      current_onboarding_step text not null default 'target-role',
      onboarding_started_at timestamptz,
      onboarding_completed_at timestamptz,
      analysis_error text,
      onboarding jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await sql.query(`
    alter table user_profiles
      add column if not exists onboarding_status text not null default 'not_started',
      add column if not exists current_onboarding_step text not null default 'target-role',
      add column if not exists onboarding_started_at timestamptz,
      add column if not exists analysis_error text
  `);

  await sql.query(`
    alter table user_profiles
      alter column current_onboarding_step set default 'target-role'
  `);

  await sql.query(`
    update user_profiles
    set current_onboarding_step = case
      when current_onboarding_step in ('role', 'experience') then 'target-role'
      when current_onboarding_step = 'job-description' then 'target-job'
      when current_onboarding_step in ('github', 'linkedin') then 'projects'
      else current_onboarding_step
    end
  `);

  await sql.query(`
    update user_profiles
    set
      onboarding_status = 'completed',
      onboarding_started_at = coalesce(onboarding_started_at, created_at)
    where onboarding_completed_at is not null
  `);

  await sql.query(`
    update user_profiles
    set
      onboarding_status = 'in_progress',
      onboarding_started_at = coalesce(onboarding_started_at, created_at)
    where onboarding_completed_at is null
      and onboarding is not null
      and onboarding_status = 'not_started'
  `);

  await sql.query(`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'user_profiles_clerk_user_id_not_empty'
      ) then
        alter table user_profiles
          add constraint user_profiles_clerk_user_id_not_empty
          check (length(trim(clerk_user_id)) > 0);
      end if;

      if not exists (
        select 1
        from pg_constraint
        where conname = 'user_profiles_onboarding_status_check'
      ) then
        alter table user_profiles
          add constraint user_profiles_onboarding_status_check
          check (
            onboarding_status in (
              'not_started',
              'in_progress',
              'analyzing',
              'completed',
              'failed'
            )
          );
      end if;

      alter table user_profiles
        drop constraint if exists user_profiles_current_onboarding_step_check;

      alter table user_profiles
        add constraint user_profiles_current_onboarding_step_check
        check (
          current_onboarding_step in (
            'target-role',
            'timeline',
            'resume',
            'target-job',
            'projects',
            'review'
          )
        );

      if not exists (
        select 1
        from pg_constraint
        where conname = 'user_profiles_completed_requires_started_check'
      ) then
        alter table user_profiles
          add constraint user_profiles_completed_requires_started_check
          check (
            onboarding_completed_at is null
            or onboarding_started_at is not null
          );
      end if;
    end $$
  `);

  await sql.query(`
    create index if not exists user_profiles_onboarding_status_idx
      on user_profiles (onboarding_status)
  `);

  await sql.query(`
    create index if not exists user_profiles_current_onboarding_step_idx
      on user_profiles (current_onboarding_step)
  `);

  await sql.query(`
    create table if not exists user_profile_resumes (
      clerk_user_id text primary key references user_profiles (clerk_user_id)
        on delete cascade,
      file_name text not null,
      content_type text not null,
      file_size integer not null,
      content_base64 text not null,
      uploaded_at timestamptz not null default now()
    )
  `);

  await sql.query(`
    create index if not exists user_profile_resumes_uploaded_at_idx
      on user_profile_resumes (uploaded_at)
  `);
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
        returning ${selectProfileColumns()}
      )
      select ${selectProfileColumns()} from inserted
      union all
      select ${selectProfileColumns()} from user_profiles
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

export async function getOnboardingStateRecord(clerkUserId: string) {
  return toOnboardingState(await getOrCreateProfileRecord(clerkUserId));
}

export async function updateOnboardingStepRecord(
  clerkUserId: string,
  currentStep: OnboardingStepId,
  onboarding: Partial<OnboardingSubmission>,
) {
  await ensureProfilesTable();

  const sql = getSql();
  const rows = (await sql.query(
    `
      insert into user_profiles (
        clerk_user_id,
        onboarding_status,
        current_onboarding_step,
        onboarding_started_at,
        onboarding,
        analysis_error,
        updated_at
      )
      values ($1, 'in_progress', $2, now(), $3::jsonb, null, now())
      on conflict (clerk_user_id) do update set
        onboarding_status = case
          when user_profiles.onboarding_status = 'completed'
            then user_profiles.onboarding_status
          else 'in_progress'
        end,
        current_onboarding_step = excluded.current_onboarding_step,
        onboarding_started_at = coalesce(
          user_profiles.onboarding_started_at,
          excluded.onboarding_started_at
        ),
        onboarding = coalesce(user_profiles.onboarding, '{}'::jsonb)
          || excluded.onboarding,
        analysis_error = null,
        updated_at = now()
      returning ${selectProfileColumns()}
    `,
    [clerkUserId, currentStep, JSON.stringify(onboarding)],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to update Trailgrad onboarding step.");
  }

  return toProfileRecord(row);
}

export async function markOnboardingAnalyzingRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  const sql = getSql();
  const rows = (await sql.query(
    `
      insert into user_profiles (
        clerk_user_id,
        onboarding_status,
        current_onboarding_step,
        onboarding_started_at,
        onboarding,
        analysis_error,
        updated_at
      )
      values ($1, 'analyzing', 'review', now(), $2::jsonb, null, now())
      on conflict (clerk_user_id) do update set
        onboarding_status = 'analyzing',
        current_onboarding_step = 'review',
        onboarding_started_at = coalesce(
          user_profiles.onboarding_started_at,
          excluded.onboarding_started_at
        ),
        onboarding = excluded.onboarding,
        analysis_error = null,
        updated_at = now()
      returning ${selectProfileColumns()}
    `,
    [clerkUserId, JSON.stringify(onboarding)],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to mark Trailgrad onboarding as analyzing.");
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
        onboarding_status,
        current_onboarding_step,
        onboarding_started_at,
        onboarding_completed_at,
        analysis_error,
        onboarding,
        updated_at
      )
      values ($1, 'completed', 'review', now(), now(), null, $2::jsonb, now())
      on conflict (clerk_user_id) do update set
        onboarding_status = 'completed',
        current_onboarding_step = 'review',
        onboarding_started_at = coalesce(
          user_profiles.onboarding_started_at,
          excluded.onboarding_started_at
        ),
        onboarding = excluded.onboarding,
        onboarding_completed_at = coalesce(
          user_profiles.onboarding_completed_at,
          excluded.onboarding_completed_at
        ),
        analysis_error = null,
        updated_at = now()
      returning ${selectProfileColumns()}
    `,
    [clerkUserId, JSON.stringify(onboarding)],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to complete Trailgrad onboarding.");
  }

  return toProfileRecord(row);
}

export async function markOnboardingFailedRecord(
  clerkUserId: string,
  analysisError: string,
) {
  await ensureProfilesTable();

  const sql = getSql();
  const rows = (await sql.query(
    `
      insert into user_profiles (
        clerk_user_id,
        onboarding_status,
        current_onboarding_step,
        onboarding_started_at,
        analysis_error,
        updated_at
      )
      values ($1, 'failed', 'review', now(), $2, now())
      on conflict (clerk_user_id) do update set
        onboarding_status = 'failed',
        current_onboarding_step = 'review',
        onboarding_started_at = coalesce(
          user_profiles.onboarding_started_at,
          excluded.onboarding_started_at
        ),
        analysis_error = excluded.analysis_error,
        updated_at = now()
      returning ${selectProfileColumns()}
    `,
    [clerkUserId, analysisError],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to mark Trailgrad onboarding as failed.");
  }

  return toProfileRecord(row);
}

export async function saveOnboardingResumeRecord(
  clerkUserId: string,
  resume: ResumeRecordInput,
) {
  await ensureProfilesTable();

  const sql = getSql();
  const rows = (await sql.query(
    `
      with profile as (
        insert into user_profiles (
          clerk_user_id,
          onboarding_status,
          current_onboarding_step,
          onboarding_started_at,
          updated_at
        )
        values ($1, 'in_progress', 'resume', now(), now())
        on conflict (clerk_user_id) do update set
          onboarding_status = case
            when user_profiles.onboarding_status = 'completed'
              then user_profiles.onboarding_status
            else 'in_progress'
          end,
          current_onboarding_step = 'resume',
          onboarding_started_at = coalesce(user_profiles.onboarding_started_at, now()),
          updated_at = now()
        returning ${selectProfileColumns()}
      ),
      saved_resume as (
        insert into user_profile_resumes (
          clerk_user_id,
          file_name,
          content_type,
          file_size,
          content_base64,
          uploaded_at
        )
        select clerk_user_id, $2, $3, $4, $5, now()
        from profile
        on conflict (clerk_user_id) do update set
          file_name = excluded.file_name,
          content_type = excluded.content_type,
          file_size = excluded.file_size,
          content_base64 = excluded.content_base64,
          uploaded_at = excluded.uploaded_at
        returning file_name, content_type, file_size, uploaded_at
      )
      update user_profiles
      set
        onboarding = coalesce(user_profiles.onboarding, '{}'::jsonb)
          || jsonb_build_object(
            'resumeName', saved_resume.file_name,
            'resumeContentType', saved_resume.content_type,
            'resumeSize', saved_resume.file_size,
            'resumeUploadedAt', saved_resume.uploaded_at
          ),
        updated_at = now()
      from saved_resume
      where user_profiles.clerk_user_id = $1
      returning ${selectProfileColumns()}
    `,
    [
      clerkUserId,
      resume.fileName,
      resume.contentType,
      resume.fileSize,
      resume.contentBase64,
    ],
  )) as ProfileRow[];

  const row = rows[0];

  if (!row) {
    throw new Error("Unable to save Trailgrad resume.");
  }

  return toProfileRecord(row);
}
