"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  type JobApplication,
  type JobApplicationInsert,
  type JobApplicationUpdate,
  toDbPayload,
} from "@/features/applications/types";

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
  input: JobApplicationInsert
): Promise<ActionResult<JobApplication>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  if (!input.company_name.trim() || !input.job_title.trim()) {
    return { success: false, error: "Company and job title are required" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .insert({ ...toDbPayload(input), user_id: userId })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true, data: data as JobApplication };
}

export async function updateApplication(
  input: JobApplicationUpdate
): Promise<ActionResult<JobApplication>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const { id, ...fields } = input;
  if (Object.keys(fields).length === 0) {
    return { success: false, error: "No fields to update" };
  }

  const supabase = await createClient();
  const payload =
    fields.company_name !== undefined
      ? toDbPayload(fields as JobApplicationInsert)
      : fields;

  const { data, error } = await supabase
    .from("job_applications")
    .update(payload)
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
  return updateApplication({ id, status });
}
