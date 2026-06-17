-- Run if you already applied 001 without city / storage

ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Private bucket for resumes & cover letters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  false,
  5242880,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: path = {user_id}/{application_id}/{filename}
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
