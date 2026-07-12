alter table source_documents
  add column if not exists error_code text;

alter table resume_versions
  add column if not exists extracted_text text,
  add column if not exists error_code text;

update source_documents
set processing_status = upper(processing_status)
where processing_status in ('uploaded', 'processing', 'processed', 'failed');

update source_documents
set processing_status = 'EXTRACTED'
where processing_status = 'PROCESSED';

update resume_versions
set extracted_text_status = upper(extracted_text_status)
where extracted_text_status in ('not_started', 'extracting', 'completed', 'failed');

update resume_versions
set extracted_text_status = 'UPLOADED'
where extracted_text_status = 'NOT_STARTED';

update resume_versions
set extracted_text_status = 'EXTRACTED'
where extracted_text_status = 'COMPLETED';

alter table source_documents
  drop constraint if exists source_documents_processing_status_check;

alter table source_documents
  add constraint source_documents_processing_status_check
  check (processing_status in ('UPLOADED', 'EXTRACTING', 'EXTRACTED', 'FAILED'));

alter table resume_versions
  drop constraint if exists resume_versions_extracted_text_status_check;

alter table resume_versions
  add constraint resume_versions_extracted_text_status_check
  check (extracted_text_status in ('UPLOADED', 'EXTRACTING', 'EXTRACTED', 'FAILED'));

create unique index if not exists source_documents_profile_type_hash_idx
  on source_documents (profile_id, source_type, sha256_content_hash);
