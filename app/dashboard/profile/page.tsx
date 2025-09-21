// app/dashboard/profile/page.tsx
import DashboardHeader from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { User } from "lucide-react";
import ProfileForm from "./components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <>
      <DashboardHeader
        title="Profile"
        description="Manage your account information and preferences"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileForm
                initial={{
                  full_name: profile?.full_name ?? "",
                  first_name: profile?.first_name ?? "",
                  last_name: profile?.last_name ?? "",
                  bio: profile?.bio ?? "",
                  email: user.email ?? "",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and membership information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  {user.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
