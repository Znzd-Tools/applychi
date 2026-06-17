-- Job Application Tracker: schema, enum, RLS
-- Run this in the Supabase SQL Editor or via supabase db push

-- Status enum
CREATE TYPE application_status AS ENUM (
  'NOT_SENT',
  'SENT',
  'INTERVIEW',
  'REJECTED',
  'OFFER_ACCEPTED'
);

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

-- Main table
CREATE TABLE public.job_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  company_name        TEXT NOT NULL,
  job_title           TEXT NOT NULL,
  applied_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  job_url             TEXT,
  country             TEXT,
  city                TEXT,
  job_type            job_type,
  apply_type          apply_type,
  visa_sponsorship    BOOLEAN NOT NULL DEFAULT FALSE,
  relocation_support  BOOLEAN NOT NULL DEFAULT FALSE,
  is_referred         BOOLEAN NOT NULL DEFAULT FALSE,
  resume_url          TEXT,
  cover_letter_url    TEXT,
  salary_range        TEXT,
  notes               TEXT,
  status              application_status NOT NULL DEFAULT 'NOT_SENT',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX job_applications_user_id_idx ON public.job_applications (user_id);
CREATE INDEX job_applications_status_idx ON public.job_applications (status);
CREATE INDEX job_applications_applied_date_idx ON public.job_applications (applied_date DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.job_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.job_applications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.job_applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket for resumes & cover letters (see 002 if applying incrementally)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  false,
  5242880,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own application documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own application documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own application documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own application documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'application-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
