"use client";

import { useState, useTransition } from "react";
import {
  APPLICATION_STATUSES,
  EMPTY_APPLICATION_FORM,
  STATUS_LABELS,
  toFormValues,
  type ApplicationStatus,
  type JobApplication,
  type JobApplicationInsert,
} from "@/features/applications/types";
import {
  createApplication,
  updateApplication,
} from "@/features/applications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ApplicationFormProps {
  application?: JobApplication;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ApplicationForm({
  application,
  onSuccess,
  onCancel,
}: ApplicationFormProps) {
  const isEditing = Boolean(application);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JobApplicationInsert & { id?: string }>(
    application ? toFormValues(application) : EMPTY_APPLICATION_FORM
  );

  function updateField<K extends keyof JobApplicationInsert>(
    key: K,
    value: JobApplicationInsert[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = isEditing && form.id
        ? await updateApplication({ id: form.id, ...form })
        : await createApplication(form);

      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-6">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company *</Label>
          <Input
            id="company_name"
            value={form.company_name}
            onChange={(e) => updateField("company_name", e.target.value)}
            placeholder="Acme Inc."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title *</Label>
          <Input
            id="job_title"
            value={form.job_title}
            onChange={(e) => updateField("job_title", e.target.value)}
            placeholder="Senior Engineer"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="applied_date">Applied Date *</Label>
          <Input
            id="applied_date"
            type="date"
            value={form.applied_date}
            onChange={(e) => updateField("applied_date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => updateField("status", v as ApplicationStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={form.country ?? ""}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="United States"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_range">Salary Range</Label>
          <Input
            id="salary_range"
            value={form.salary_range ?? ""}
            onChange={(e) => updateField("salary_range", e.target.value)}
            placeholder="$120k – $150k"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="job_url">Job URL</Label>
        <Input
          id="job_url"
          type="url"
          value={form.job_url ?? ""}
          onChange={(e) => updateField("job_url", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <Label htmlFor="visa_sponsorship" className="cursor-pointer">
            ✈️ Visa
          </Label>
          <Switch
            id="visa_sponsorship"
            checked={form.visa_sponsorship}
            onCheckedChange={(v) => updateField("visa_sponsorship", v)}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <Label htmlFor="relocation_support" className="cursor-pointer">
            📦 Relocation
          </Label>
          <Switch
            id="relocation_support"
            checked={form.relocation_support}
            onCheckedChange={(v) => updateField("relocation_support", v)}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <Label htmlFor="is_referred" className="cursor-pointer">
            🤝 Referred
          </Label>
          <Switch
            id="is_referred"
            checked={form.is_referred}
            onCheckedChange={(v) => updateField("is_referred", v)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="resume_url">Resume Link</Label>
          <Input
            id="resume_url"
            value={form.resume_url ?? ""}
            onChange={(e) => updateField("resume_url", e.target.value)}
            placeholder="URL or note"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover_letter_url">Cover Letter Link</Label>
          <Input
            id="cover_letter_url"
            value={form.cover_letter_url ?? ""}
            onChange={(e) => updateField("cover_letter_url", e.target.value)}
            placeholder="URL or note"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Interview notes, contacts, follow-ups..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update" : "Add Application"}
        </Button>
      </div>
    </form>
  );
}
