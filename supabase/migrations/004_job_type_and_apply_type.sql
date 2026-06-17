-- Job type & apply type enums

CREATE TYPE job_type AS ENUM (
  'REMOTE',
  'HYBRID',
  'ON_SITE'
);

CREATE TYPE apply_type AS ENUM (
  'COMPANY_WEBSITE',
  'EASY_APPLY',
  'JOB_PLATFORMS'
);

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS job_type job_type,
  ADD COLUMN IF NOT EXISTS apply_type apply_type;

CREATE INDEX IF NOT EXISTS job_applications_job_type_idx
  ON public.job_applications (job_type);

CREATE INDEX IF NOT EXISTS job_applications_apply_type_idx
  ON public.job_applications (apply_type);
