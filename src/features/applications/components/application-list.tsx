"use client";

import {
  APPLICATION_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationStatus,
  type JobApplication,
} from "@/features/applications/types";
import { ApplicationCard } from "@/features/applications/components/application-card";
import { KanbanBoard } from "@/features/applications/components/kanban-board";
import { cn } from "@/lib/utils";

interface StatusFilterProps {
  activeStatus: ApplicationStatus | "ALL";
  onStatusChange: (status: ApplicationStatus | "ALL") => void;
  counts: Record<ApplicationStatus | "ALL", number>;
}

export function StatusFilter({
  activeStatus,
  onStatusChange,
  counts,
}: StatusFilterProps) {
  const filters: Array<{ key: ApplicationStatus | "ALL"; label: string }> = [
    { key: "ALL", label: "All" },
    ...APPLICATION_STATUSES.map((status) => ({
      key: status,
      label: STATUS_LABELS[status],
    })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filters.map(({ key, label }) => {
        const isActive = activeStatus === key;
        const color =
          key === "ALL"
            ? "bg-foreground/10 text-foreground border-foreground/20"
            : STATUS_COLORS[key].badge;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusChange(key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? color : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            <span className="rounded-full bg-background/50 px-1.5 py-0.5 text-[10px]">
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface ApplicationListProps {
  applications: JobApplication[];
  activeStatus: ApplicationStatus | "ALL";
  onStatusChange: (status: ApplicationStatus | "ALL") => void;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  onApplicationStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationList({
  applications,
  activeStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onApplicationStatusChange,
}: ApplicationListProps) {
  const counts = APPLICATION_STATUSES.reduce(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status).length;
      return acc;
    },
    { ALL: applications.length } as Record<ApplicationStatus | "ALL", number>
  );

  const filtered =
    activeStatus === "ALL"
      ? applications
      : applications.filter((a) => a.status === activeStatus);

  return (
    <div className="space-y-4">
      <div className="lg:hidden">
        <StatusFilter
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          counts={counts}
        />
      </div>

      <div className="hidden lg:block">
        <KanbanBoard
          applications={applications}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onApplicationStatusChange}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No applications yet.</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Tap + to log your first application.
            </p>
          </div>
        ) : (
          filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
