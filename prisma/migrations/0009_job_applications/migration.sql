alter table analysis_jobs
  add column if not exists target_context_id text references target_contexts (id)
    on delete set null;

create index if not exists analysis_jobs_target_context_id_idx
  on analysis_jobs (target_context_id);

create table if not exists job_applications (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  target_context_id text references target_contexts (id)
    on delete set null,
  target_role text not null,
  experience_level text not null,
  target_company text,
  target_job_title text,
  application_date date,
  no_date_yet boolean not null default false,
  preparation_time_per_day text not null,
  preparation_intensity text not null,
  target_job_mode text not null default 'skip',
  job_description text,
  analysis_job_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_applications_target_role_check
    check (
      target_role in (
        'ai-engineer',
        'ml-engineer',
        'software-engineer',
        'frontend-engineer',
        'backend-engineer',
        'full-stack-engineer',
        'data-scientist',
        'data-analyst',
        'data-engineer',
        'product'
      )
    ),
  constraint job_applications_preparation_time_check
    check (preparation_time_per_day in ('15', '30', '60', 'flexible')),
  constraint job_applications_preparation_intensity_check
    check (preparation_intensity in ('light', 'standard', 'intensive')),
  constraint job_applications_target_job_mode_check
    check (target_job_mode in ('paste', 'skip'))
);

create unique index if not exists job_applications_target_context_id_idx
  on job_applications (target_context_id)
  where target_context_id is not null;

create index if not exists job_applications_profile_created_at_idx
  on job_applications (profile_id, created_at desc);
