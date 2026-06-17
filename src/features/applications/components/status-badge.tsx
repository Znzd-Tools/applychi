import {
  type ApplicationStatus,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/features/applications/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border", STATUS_COLORS[status].badge, className)}
    >
      <span
        className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", STATUS_COLORS[status].dot)}
      />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
