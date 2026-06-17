import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getApplications } from "@/features/applications/actions";
import { DashboardClient } from "@/features/applications/components/dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const result = await getApplications();
  const applications = result.success ? result.data : [];

  return (
    <DashboardClient
      applications={applications}
      userEmail={user.email ?? ""}
    />
  );
}
