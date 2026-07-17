alter table user_profiles
  alter column current_onboarding_step set default 'trail';

update user_profiles
set current_onboarding_step = 'trail'
where current_onboarding_step = 'target-role';
