"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { JobApplication } from "@/features/applications/types";
import { ApplicationCard } from "@/features/applications/components/application-card";
import { cn } from "@/lib/utils";

interface DraggableApplicationCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  hideStatus?: boolean;
}

export function DraggableApplicationCard({
  application,
  onEdit,
  onDelete,
  hideStatus = false,
}: DraggableApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: application.id, data: { application } });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
      {...listeners}
      {...attributes}
    >
      <ApplicationCard
        application={application}
        onEdit={onEdit}
        onDelete={onDelete}
        hideStatus={hideStatus}
      />
    </div>
  );
}
