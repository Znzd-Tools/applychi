"use client";

import { MapPin, Calendar, Pencil, Trash2 } from "lucide-react";
import {
  type JobApplication,
} from "@/features/applications/types";
import { StatusBadge } from "@/features/applications/components/status-badge";
import { DocumentLink } from "@/features/applications/components/document-link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  hideStatus?: boolean;
  className?: string;
}

export function ApplicationCard({
  application,
  onEdit,
  onDelete,
  hideStatus = false,
  className,
}: ApplicationCardProps) {
  return (
    <Card className={cn("group border-border/60 bg-card/50 transition-colors hover:border-border hover:bg-card", className)}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">
              {application.company_name}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {application.job_title}
            </p>
          </div>
          {!hideStatus && (
            <StatusBadge status={application.status} className="shrink-0" />
          )}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {(application.city || application.country) && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[application.city, application.country].filter(Boolean).join(", ")}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(application.applied_date)}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {application.visa_sponsorship && (
            <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
              ✈️ Visa
            </span>
          )}
          {application.relocation_support && (
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
              📦 Relocation
            </span>
          )}
          {application.is_referred && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
              🤝 Referred
            </span>
          )}
        </div>

        {(application.resume_url || application.cover_letter_url) && (
          <div className="mb-3 flex flex-wrap gap-3">
            {application.resume_url && (
              <DocumentLink
                path={application.resume_url}
                className="text-xs"
              />
            )}
            {application.cover_letter_url && (
              <DocumentLink
                path={application.cover_letter_url}
                className="text-xs"
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(application)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Edit application"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(application.id)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Delete application"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
