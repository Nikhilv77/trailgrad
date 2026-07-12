alter table user_profiles
  alter column current_onboarding_step set default 'target-role';

update user_profiles
set current_onboarding_step = case
  when current_onboarding_step in ('role', 'experience') then 'target-role'
  when current_onboarding_step = 'job-description' then 'target-job'
  when current_onboarding_step in ('github', 'linkedin') then 'projects'
  else current_onboarding_step
end;

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

create table if not exists user_profile_resumes (
  clerk_user_id text primary key references user_profiles (clerk_user_id)
    on delete cascade,
  file_name text not null,
  content_type text not null,
  file_size integer not null,
  content_base64 text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists user_profile_resumes_uploaded_at_idx
  on user_profile_resumes (uploaded_at);
