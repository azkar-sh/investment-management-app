// app/dashboard/settings/page.tsx
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./components/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view settings.</div>;
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Customize your app preferences and account settings"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <SettingsForm initial={settings ?? {}} />
        </div>
      </div>
    </>
  );
}
