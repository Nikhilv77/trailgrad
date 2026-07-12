do $$
begin
  if not exists (select 1 from pg_type where typname = 'AnalysisJobType') then
    create type "AnalysisJobType" as enum (
      'INITIAL_PROFILE',
      'RESUME_REANALYSIS',
      'JOB_ANALYSIS',
      'PROFILE_REASSESSMENT'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'AnalysisJobStatus') then
    create type "AnalysisJobStatus" as enum (
      'QUEUED',
      'RUNNING',
      'COMPLETED',
      'FAILED',
      'CANCELLED'
    );
  end if;
end $$;

create table if not exists analysis_jobs (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  source_document_id text references source_documents (id)
    on delete restrict,
  type "AnalysisJobType" not null,
  status "AnalysisJobStatus" not null default 'QUEUED',
  current_stage text not null default 'resume_analysis',
  progress_percent integer not null default 0,
  idempotency_key text not null,
  attempt_count integer not null default 0,
  safe_error_code text,
  safe_error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analysis_jobs_progress_percent_check
    check (progress_percent >= 0 and progress_percent <= 100),
  constraint analysis_jobs_attempt_count_check
    check (attempt_count >= 0),
  constraint analysis_jobs_current_stage_check
    check (
      current_stage in (
        'resume_analysis',
        'target_analysis',
        'profile_reconciliation',
        'risk_generation',
        'sprint_generation',
        'question_generation',
        'finalization'
      )
    )
);

create unique index if not exists analysis_jobs_idempotency_key_idx
  on analysis_jobs (idempotency_key);

create index if not exists analysis_jobs_profile_status_idx
  on analysis_jobs (profile_id, status);

create index if not exists analysis_jobs_source_document_id_idx
  on analysis_jobs (source_document_id);

create index if not exists analysis_jobs_type_status_idx
  on analysis_jobs (type, status);

create index if not exists analysis_jobs_created_at_idx
  on analysis_jobs (created_at);
