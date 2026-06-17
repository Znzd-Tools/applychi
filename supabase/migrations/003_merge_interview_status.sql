-- Merge INTERVIEW_APPROVED + IN_INTERVIEW into INTERVIEW
--
-- Do NOT use ALTER TYPE ... ADD VALUE + UPDATE in one script — Postgres
-- requires new enum values to be committed before use (error 55P04).
-- Instead: create a new enum and cast via CASE in a single transaction.

CREATE TYPE application_status_new AS ENUM (
  'NOT_SENT',
  'SENT',
  'INTERVIEW',
  'REJECTED',
  'OFFER_ACCEPTED'
);

ALTER TABLE public.job_applications
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.job_applications
  ALTER COLUMN status TYPE application_status_new
  USING (
    CASE status::text
      WHEN 'INTERVIEW_APPROVED' THEN 'INTERVIEW'::application_status_new
      WHEN 'IN_INTERVIEW'       THEN 'INTERVIEW'::application_status_new
      ELSE status::text::application_status_new
    END
  );

DROP TYPE application_status;

ALTER TYPE application_status_new RENAME TO application_status;

ALTER TABLE public.job_applications
  ALTER COLUMN status SET DEFAULT 'NOT_SENT'::application_status;
