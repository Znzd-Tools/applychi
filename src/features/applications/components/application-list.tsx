"use client";

import {
  APPLICATION_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationStatus,
  type JobApplication,
} from "@/features/applications/types";
import { ApplicationCard } from "@/features/applications/components/application-card";
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
}

export function ApplicationList({
  applications,
  activeStatus,
  onStatusChange,
  onEdit,
  onDelete,
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
      {/* Mobile / tablet filter chips */}
      <div className="lg:hidden">
        <StatusFilter
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          counts={counts}
        />
      </div>

      {/* Desktop Kanban */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:gap-3">
        {APPLICATION_STATUSES.map((status) => {
          const columnApps = applications.filter((a) => a.status === status);
          return (
            <div key={status} className="flex min-w-0 flex-col">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span
                  className={cn("h-2 w-2 rounded-full", STATUS_COLORS[status].dot)}
                />
                <h3 className="truncate text-xs font-medium text-muted-foreground">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-muted-foreground/60">
                  {columnApps.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {columnApps.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/50 p-4 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                ) : (
                  columnApps.map((app) => (
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
        })}
      </div>

      {/* Mobile / filtered list */}
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
