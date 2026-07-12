create table if not exists ai_runs (
  id text primary key,
  profile_id text references user_profiles (clerk_user_id)
    on delete set null,
  analysis_job_id text references analysis_jobs (id)
    on delete set null,
  provider text not null,
  operation text not null,
  model text not null,
  prompt_version text not null,
  input_tokens integer,
  output_tokens integer,
  cached_tokens integer,
  estimated_cost_usd numeric(12, 6) not null default 0,
  duration_ms integer not null,
  status text not null,
  used_fallback boolean not null default false,
  safe_error_code text,
  created_at timestamptz not null default now(),
  constraint ai_runs_duration_ms_check
    check (duration_ms >= 0),
  constraint ai_runs_input_tokens_check
    check (input_tokens is null or input_tokens >= 0),
  constraint ai_runs_output_tokens_check
    check (output_tokens is null or output_tokens >= 0),
  constraint ai_runs_cached_tokens_check
    check (cached_tokens is null or cached_tokens >= 0),
  constraint ai_runs_estimated_cost_usd_check
    check (estimated_cost_usd >= 0),
  constraint ai_runs_status_check
    check (status in ('COMPLETED', 'FAILED'))
);

create index if not exists ai_runs_profile_created_at_idx
  on ai_runs (profile_id, created_at);

create index if not exists ai_runs_analysis_job_id_idx
  on ai_runs (analysis_job_id);

create index if not exists ai_runs_provider_model_idx
  on ai_runs (provider, model);

create index if not exists ai_runs_operation_idx
  on ai_runs (operation);

create index if not exists ai_runs_created_at_idx
  on ai_runs (created_at);
