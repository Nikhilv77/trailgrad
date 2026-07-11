create table if not exists user_profiles (
  clerk_user_id text primary key,
  onboarding_status text not null default 'not_started',
  current_onboarding_step text not null default 'role',
  onboarding_started_at timestamptz,
  onboarding_completed_at timestamptz,
  analysis_error text,
  onboarding jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_profiles
  add column if not exists onboarding_status text not null default 'not_started',
  add column if not exists current_onboarding_step text not null default 'role',
  add column if not exists onboarding_started_at timestamptz,
  add column if not exists analysis_error text;

update user_profiles
set
  onboarding_status = 'completed',
  onboarding_started_at = coalesce(onboarding_started_at, created_at)
where onboarding_completed_at is not null;

update user_profiles
set
  onboarding_status = 'in_progress',
  onboarding_started_at = coalesce(onboarding_started_at, created_at)
where onboarding_completed_at is null
  and onboarding is not null
  and onboarding_status = 'not_started';

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

  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_current_onboarding_step_check'
  ) then
    alter table user_profiles
      add constraint user_profiles_current_onboarding_step_check
      check (
        current_onboarding_step in (
          'role',
          'experience',
          'timeline',
          'resume',
          'job-description',
          'github',
          'linkedin',
          'review'
        )
      );
  end if;

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
end $$;

create index if not exists user_profiles_onboarding_status_idx
  on user_profiles (onboarding_status);

create index if not exists user_profiles_current_onboarding_step_idx
  on user_profiles (current_onboarding_step);
