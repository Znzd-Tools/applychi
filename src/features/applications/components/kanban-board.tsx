"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  APPLICATION_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type ApplicationStatus,
  type JobApplication,
} from "@/features/applications/types";
import { DraggableApplicationCard } from "@/features/applications/components/draggable-application-card";
import { ApplicationCard } from "@/features/applications/components/application-card";
import { updateApplicationStatus } from "@/features/applications/actions";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
}

function KanbanColumn({
  status,
  applications,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span
          className={cn("h-2 w-2 rounded-full", STATUS_COLORS[status].dot)}
        />
        <h3 className="truncate text-xs font-medium text-muted-foreground">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-xs text-muted-foreground/60">
          {applications.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-col gap-2 rounded-xl p-1 transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/20"
        )}
      >
        {applications.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 p-4 text-center text-xs text-muted-foreground">
            Drop here
          </div>
        ) : (
          applications.map((app) => (
            <DraggableApplicationCard
              key={app.id}
              application={app}
              onEdit={onEdit}
              onDelete={onDelete}
              hideStatus
            />
          ))
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function KanbanBoard({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const app = event.active.data.current?.application as
      | JobApplication
      | undefined;
    if (app) setActiveApp(app);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveApp(null);

    const { active, over } = event;
    if (!over) return;

    const app = active.data.current?.application as JobApplication | undefined;
    const newStatus = over.id as ApplicationStatus;

    if (!app || !APPLICATION_STATUSES.includes(newStatus)) return;
    if (app.status === newStatus) return;

    onStatusChange(app.id, newStatus);

    startTransition(async () => {
      const result = await updateApplicationStatus(app.id, newStatus);
      if (!result.success) {
        onStatusChange(app.id, app.status);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-5 gap-3">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeApp ? (
          <div className="rotate-2 cursor-grabbing opacity-90 shadow-xl">
            <ApplicationCard
              application={activeApp}
              onEdit={() => {}}
              onDelete={() => {}}
              hideStatus
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
