update user_profiles
set current_onboarding_step = case
  when current_onboarding_step in ('role', 'experience', 'timeline') then 'target-role'
  when current_onboarding_step in (
    'job-description',
    'target-job',
    'projects',
    'github',
    'linkedin'
  ) then 'resume'
  else current_onboarding_step
end
where current_onboarding_step not in (
  'target-role',
  'resume',
  'trail',
  'review'
);

alter table user_profiles
  drop constraint if exists user_profiles_current_onboarding_step_check;

alter table user_profiles
  add constraint user_profiles_current_onboarding_step_check
  check (
    current_onboarding_step in (
      'target-role',
      'resume',
      'trail',
      'review'
    )
  );
