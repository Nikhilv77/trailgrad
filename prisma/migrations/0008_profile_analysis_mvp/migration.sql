do $$
begin
  if not exists (select 1 from pg_type where typname = 'ProfileAnalysisStatus') then
    create type "ProfileAnalysisStatus" as enum (
      'PENDING',
      'COMPLETED',
      'FAILED'
    );
  end if;
end $$;

create table if not exists profile_analyses (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  resume_version_id text not null references resume_versions (id)
    on delete restrict,
  target_context_id text references target_contexts (id)
    on delete set null,
  status "ProfileAnalysisStatus" not null default 'PENDING',
  result jsonb,
  prompt_version text not null,
  provider text not null,
  model text not null,
  safe_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profile_analyses_unique_resume_target_idx
  on profile_analyses (profile_id, resume_version_id, target_context_id)
  where target_context_id is not null;

create unique index if not exists profile_analyses_unique_resume_without_target_idx
  on profile_analyses (profile_id, resume_version_id)
  where target_context_id is null;

create index if not exists profile_analyses_profile_status_idx
  on profile_analyses (profile_id, status);

create index if not exists profile_analyses_resume_version_id_idx
  on profile_analyses (resume_version_id);

create index if not exists profile_analyses_target_context_id_idx
  on profile_analyses (target_context_id);

create index if not exists profile_analyses_created_at_idx
  on profile_analyses (created_at);
