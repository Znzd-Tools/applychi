"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { JobApplication } from "@/features/applications/types";

interface ApplicationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: JobApplication;
}

export function ApplicationFormSheet({
  open,
  onOpenChange,
  application,
}: ApplicationFormSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const title = application ? "Edit Application" : "New Application";

  function handleSuccess() {
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            key={application?.id ?? "new"}
            application={application}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <ApplicationForm
          key={application?.id ?? "new"}
          application={application}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DrawerContent>
    </Drawer>
  );
}
