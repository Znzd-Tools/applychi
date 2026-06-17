export const APPLICATION_STATUSES = [
  "NOT_SENT",
  "SENT",
  "INTERVIEW_APPROVED",
  "IN_INTERVIEW",
  "REJECTED",
  "OFFER_ACCEPTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  applied_date: string;
  job_url: string | null;
  country: string | null;
  visa_sponsorship: boolean;
  relocation_support: boolean;
  is_referred: boolean;
  resume_url: string | null;
  cover_letter_url: string | null;
  salary_range: string | null;
  notes: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationInsert {
  company_name: string;
  job_title: string;
  applied_date: string;
  job_url?: string | null;
  country?: string | null;
  visa_sponsorship?: boolean;
  relocation_support?: boolean;
  is_referred?: boolean;
  resume_url?: string | null;
  cover_letter_url?: string | null;
  salary_range?: string | null;
  notes?: string | null;
  status?: ApplicationStatus;
}

export interface JobApplicationUpdate extends Partial<JobApplicationInsert> {
  id: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  NOT_SENT: "Not Sent",
  SENT: "Sent",
  INTERVIEW_APPROVED: "Interview Approved",
  IN_INTERVIEW: "In Interview",
  REJECTED: "Rejected",
  OFFER_ACCEPTED: "Offer Accepted",
};

export const STATUS_COLORS: Record<
  ApplicationStatus,
  { badge: string; dot: string }
> = {
  NOT_SENT: {
    badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    dot: "bg-zinc-400",
  },
  SENT: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    dot: "bg-blue-400",
  },
  INTERVIEW_APPROVED: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400",
  },
  IN_INTERVIEW: {
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    dot: "bg-purple-400",
  },
  REJECTED: {
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
    dot: "bg-red-400",
  },
  OFFER_ACCEPTED: {
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-400",
  },
};

export const EMPTY_APPLICATION_FORM: JobApplicationInsert = {
  company_name: "",
  job_title: "",
  applied_date: new Date().toISOString().split("T")[0],
  job_url: "",
  country: "",
  visa_sponsorship: false,
  relocation_support: false,
  is_referred: false,
  resume_url: "",
  cover_letter_url: "",
  salary_range: "",
  notes: "",
  status: "NOT_SENT",
};

export function toFormValues(
  app: JobApplication
): JobApplicationInsert & { id: string } {
  return {
    id: app.id,
    company_name: app.company_name,
    job_title: app.job_title,
    applied_date: app.applied_date,
    job_url: app.job_url ?? "",
    country: app.country ?? "",
    visa_sponsorship: app.visa_sponsorship,
    relocation_support: app.relocation_support,
    is_referred: app.is_referred,
    resume_url: app.resume_url ?? "",
    cover_letter_url: app.cover_letter_url ?? "",
    salary_range: app.salary_range ?? "",
    notes: app.notes ?? "",
    status: app.status,
  };
}

export function toDbPayload(
  data: JobApplicationInsert
): Record<string, string | boolean | null> {
  return {
    company_name: data.company_name.trim(),
    job_title: data.job_title.trim(),
    applied_date: data.applied_date,
    job_url: data.job_url?.trim() || null,
    country: data.country?.trim() || null,
    visa_sponsorship: data.visa_sponsorship ?? false,
    relocation_support: data.relocation_support ?? false,
    is_referred: data.is_referred ?? false,
    resume_url: data.resume_url?.trim() || null,
    cover_letter_url: data.cover_letter_url?.trim() || null,
    salary_range: data.salary_range?.trim() || null,
    notes: data.notes?.trim() || null,
    status: data.status ?? "NOT_SENT",
  };
}
