alter table target_contexts
  add column if not exists trail_focus text not null default 'job';

alter table job_applications
  add column if not exists trail_focus text not null default 'job';

alter table target_contexts
  drop constraint if exists target_contexts_trail_focus_check;

alter table target_contexts
  add constraint target_contexts_trail_focus_check
    check (trail_focus in ('job', 'learning'));

alter table job_applications
  drop constraint if exists job_applications_trail_focus_check;

alter table job_applications
  add constraint job_applications_trail_focus_check
    check (trail_focus in ('job', 'learning'));
