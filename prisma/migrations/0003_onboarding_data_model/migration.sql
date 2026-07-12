create table if not exists career_contexts (
  profile_id text primary key references user_profiles (clerk_user_id)
    on delete cascade,
  primary_target_role text not null,
  experience_level text not null,
  target_company text,
  target_job_title text,
  interview_or_application_date date,
  no_date_yet boolean not null default false,
  daily_preparation_minutes integer,
  flexible_preparation_time boolean not null default false,
  preparation_intensity text not null,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_contexts_preparation_intensity_check
    check (preparation_intensity in ('light', 'standard', 'intensive')),
  constraint career_contexts_daily_preparation_minutes_check
    check (
      daily_preparation_minutes is null
      or daily_preparation_minutes in (15, 30, 60)
    )
);

create index if not exists career_contexts_primary_target_role_idx
  on career_contexts (primary_target_role);

create table if not exists target_contexts (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  role text not null,
  company text,
  job_title text,
  job_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists target_contexts_profile_id_idx
  on target_contexts (profile_id);

create unique index if not exists target_contexts_one_active_per_profile_idx
  on target_contexts (profile_id)
  where is_active;

create table if not exists manual_projects (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  name text not null,
  description text not null default '',
  project_url text,
  repository_url text,
  technologies text[] not null default array[]::text[],
  current_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists manual_projects_profile_id_idx
  on manual_projects (profile_id);

create index if not exists manual_projects_current_status_idx
  on manual_projects (current_status);

create unique index if not exists manual_projects_profile_name_idx
  on manual_projects (profile_id, name);

create table if not exists source_documents (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  source_type text not null,
  original_filename text not null,
  mime_type text not null,
  storage_path text not null,
  file_size integer not null,
  sha256_content_hash text not null,
  processing_status text not null default 'UPLOADED',
  error_code text,
  version integer not null,
  created_at timestamptz not null default now(),
  constraint source_documents_source_type_check
    check (source_type in ('resume')),
  constraint source_documents_processing_status_check
    check (processing_status in ('UPLOADED', 'EXTRACTING', 'EXTRACTED', 'FAILED')),
  constraint source_documents_version_check
    check (version > 0),
  constraint source_documents_file_size_check
    check (file_size > 0),
  constraint source_documents_sha256_content_hash_check
    check (sha256_content_hash ~ '^[a-f0-9]{64}$')
);

create index if not exists source_documents_profile_type_idx
  on source_documents (profile_id, source_type);

create unique index if not exists source_documents_profile_type_version_idx
  on source_documents (profile_id, source_type, version);

create unique index if not exists source_documents_profile_type_hash_idx
  on source_documents (profile_id, source_type, sha256_content_hash);

create unique index if not exists source_documents_storage_path_idx
  on source_documents (storage_path);

create table if not exists resume_versions (
  id text primary key,
  profile_id text not null references user_profiles (clerk_user_id)
    on delete cascade,
  source_document_id text not null references source_documents (id)
    on delete restrict,
  version integer not null,
  extracted_text_status text not null default 'UPLOADED',
  extracted_text text,
  error_code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint resume_versions_extracted_text_status_check
    check (extracted_text_status in ('UPLOADED', 'EXTRACTING', 'EXTRACTED', 'FAILED')),
  constraint resume_versions_version_check
    check (version > 0)
);

create index if not exists resume_versions_profile_id_idx
  on resume_versions (profile_id);

create unique index if not exists resume_versions_profile_version_idx
  on resume_versions (profile_id, version);

create unique index if not exists resume_versions_one_active_per_profile_idx
  on resume_versions (profile_id)
  where active;
