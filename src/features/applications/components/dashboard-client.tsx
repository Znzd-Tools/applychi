"use client";

import { useState, useTransition } from "react";
import { Plus, LogOut, Briefcase } from "lucide-react";
import type { JobApplication } from "@/features/applications/types";
import { ApplicationList } from "@/features/applications/components/application-list";
import { ApplicationFormSheet } from "@/features/applications/components/application-form-sheet";
import { deleteApplication } from "@/features/applications/actions";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus } from "@/features/applications/types";

interface DashboardClientProps {
  applications: JobApplication[];
  userEmail: string;
}

export function DashboardClient({
  applications,
  userEmail,
}: DashboardClientProps) {
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | "ALL">(
    "ALL"
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | undefined>();
  const [, startTransition] = useTransition();

  function handleAdd() {
    setEditingApp(undefined);
    setFormOpen(true);
  }

  function handleEdit(app: JobApplication) {
    setEditingApp(app);
    setFormOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this application?")) return;
    startTransition(async () => {
      await deleteApplication(id);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-semibold">ApplyChi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userEmail}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground">
              {applications.length} total
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <ApplicationList
          applications={applications}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <ApplicationFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        application={editingApp}
      />

      {/* Mobile FAB */}
      <Button
        onClick={handleAdd}
        size="icon"
        className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full shadow-lg sm:hidden"
        aria-label="Add application"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
