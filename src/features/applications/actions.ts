"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  type JobApplication,
  type JobApplicationInsert,
  type ApplyType,
  type JobType,
  toDbPayload,
} from "@/features/applications/types";
import {
  buildDocumentPath,
  DOCUMENTS_BUCKET,
  type DocumentType,
  validateDocumentFile,
} from "@/features/applications/storage";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function getFileFromFormData(
  formData: FormData,
  key: DocumentType
): File | null {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

function parseOptionalEnum<T extends string>(
  value: FormDataEntryValue | null
): T | null {
  const str = String(value ?? "").trim();
  return str ? (str as T) : null;
}

function parseApplicationFields(formData: FormData): JobApplicationInsert {
  return {
    company_name: String(formData.get("company_name") ?? ""),
    job_title: String(formData.get("job_title") ?? ""),
    applied_date: String(formData.get("applied_date") ?? ""),
    job_url: String(formData.get("job_url") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    job_type: parseOptionalEnum<JobType>(formData.get("job_type")),
    apply_type: parseOptionalEnum<ApplyType>(formData.get("apply_type")),
    visa_sponsorship: formData.get("visa_sponsorship") === "true",
    relocation_support: formData.get("relocation_support") === "true",
    is_referred: formData.get("is_referred") === "true",
    salary_range: String(formData.get("salary_range") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "NOT_SENT") as JobApplicationInsert["status"],
  };
}

async function uploadDocument(
  userId: string,
  applicationId: string,
  file: File,
  type: DocumentType
): Promise<string> {
  const validationError = validateDocumentFile(file);
  if (validationError) throw new Error(validationError);

  const supabase = await createClient();
  const path = buildDocumentPath(userId, applicationId, type, file.name);

  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);
  return path;
}

async function deleteDocuments(paths: Array<string | null | undefined>): Promise<void> {
  const validPaths = paths.filter((p): p is string => Boolean(p));
  if (validPaths.length === 0) return;

  const supabase = await createClient();
  await supabase.storage.from(DOCUMENTS_BUCKET).remove(validPaths);
}

export async function getSignedDocumentUrl(
  path: string
): Promise<ActionResult<string>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };
  if (!path.startsWith(`${userId}/`)) {
    return { success: false, error: "Forbidden" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, 3600);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data.signedUrl };
}

export async function getApplications(): Promise<ActionResult<JobApplication[]>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("applied_date", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as JobApplication[] };
}

export async function createApplication(
  formData: FormData
): Promise<ActionResult<JobApplication>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const input = parseApplicationFields(formData);
  if (!input.company_name.trim() || !input.job_title.trim()) {
    return { success: false, error: "Company and job title are required" };
  }

  const resumeFile = getFileFromFormData(formData, "resume");
  const coverLetterFile = getFileFromFormData(formData, "cover_letter");

  for (const file of [resumeFile, coverLetterFile]) {
    if (file) {
      const err = validateDocumentFile(file);
      if (err) return { success: false, error: err };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .insert({ ...toDbPayload(input), user_id: userId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  const application = data as JobApplication;
  const updates: Partial<JobApplication> = {};

  try {
    if (resumeFile) {
      updates.resume_url = await uploadDocument(
        userId,
        application.id,
        resumeFile,
        "resume"
      );
    }
    if (coverLetterFile) {
      updates.cover_letter_url = await uploadDocument(
        userId,
        application.id,
        coverLetterFile,
        "cover_letter"
      );
    }
  } catch (uploadError) {
    await supabase.from("job_applications").delete().eq("id", application.id);
    return {
      success: false,
      error: uploadError instanceof Error ? uploadError.message : "Upload failed",
    };
  }

  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from("job_applications")
      .update(updates)
      .eq("id", application.id)
      .select()
      .single();

    if (updateError) return { success: false, error: updateError.message };
    revalidatePath("/dashboard");
    return { success: true, data: updated as JobApplication };
  }

  revalidatePath("/dashboard");
  return { success: true, data: application };
}

export async function updateApplication(
  formData: FormData
): Promise<ActionResult<JobApplication>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, error: "Application ID is required" };

  const input = parseApplicationFields(formData);
  const resumeFile = getFileFromFormData(formData, "resume");
  const coverLetterFile = getFileFromFormData(formData, "cover_letter");
  const clearResume = formData.get("clear_resume") === "true";
  const clearCoverLetter = formData.get("clear_cover_letter") === "true";

  for (const file of [resumeFile, coverLetterFile]) {
    if (file) {
      const err = validateDocumentFile(file);
      if (err) return { success: false, error: err };
    }
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("job_applications")
    .select("resume_url, cover_letter_url")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: "Application not found" };
  }

  const payload = toDbPayload(input);
  const docUpdates: { resume_url?: string | null; cover_letter_url?: string | null } = {};

  try {
    if (resumeFile) {
      if (existing.resume_url) {
        await deleteDocuments([existing.resume_url]);
      }
      docUpdates.resume_url = await uploadDocument(userId, id, resumeFile, "resume");
    } else if (clearResume && existing.resume_url) {
      await deleteDocuments([existing.resume_url]);
      docUpdates.resume_url = null;
    }

    if (coverLetterFile) {
      if (existing.cover_letter_url) {
        await deleteDocuments([existing.cover_letter_url]);
      }
      docUpdates.cover_letter_url = await uploadDocument(
        userId,
        id,
        coverLetterFile,
        "cover_letter"
      );
    } else if (clearCoverLetter && existing.cover_letter_url) {
      await deleteDocuments([existing.cover_letter_url]);
      docUpdates.cover_letter_url = null;
    }
  } catch (uploadError) {
    return {
      success: false,
      error: uploadError instanceof Error ? uploadError.message : "Upload failed",
    };
  }

  const { data, error } = await supabase
    .from("job_applications")
    .update({ ...payload, ...docUpdates })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true, data: data as JobApplication };
}

export async function deleteApplication(
  id: string
): Promise<ActionResult<null>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("job_applications")
    .select("resume_url, cover_letter_url")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    await deleteDocuments([existing.resume_url, existing.cover_letter_url]);
  }

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true, data: null };
}

export async function updateApplicationStatus(
  id: string,
  status: JobApplication["status"]
): Promise<ActionResult<JobApplication>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true, data: data as JobApplication };
}
