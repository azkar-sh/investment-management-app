"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type SettingsState = { success?: boolean; error?: string };

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const bio = formData.get("bio") as string;

  const { error } = await supabase.from("user_profiles").upsert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    bio: bio,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Profile update error:", error);
    throw new Error("Failed to update profile");
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  try {
    const theme = (formData.get("theme") as string) ?? "system";
    const compactMode = formData.get("compactMode") === "on";
    const emailNotifications = formData.get("emailNotifications") === "on";
    const priceAlerts = formData.get("priceAlerts") === "on";
    const weeklySummary = formData.get("weeklySummary") === "on";
    const defaultCurrency =
      (formData.get("defaultCurrency") as string) ?? "USD";
    const dateFormat = (formData.get("dateFormat") as string) ?? "MM/DD/YYYY";
    const sessionTimeout = Number.parseInt(
      (formData.get("sessionTimeout") as string) ?? "30",
      10
    );

    const { error } = await supabase.from("user_settings").upsert({
      id: user.id,
      theme,
      compact_mode: compactMode,
      email_notifications: emailNotifications,
      price_alerts: priceAlerts,
      weekly_summary: weeklySummary,
      default_currency: defaultCurrency,
      date_format: dateFormat,
      session_timeout: sessionTimeout,
      updated_at: new Date().toISOString(),
    });

    if (error) return { error: "Failed to update settings" };

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Unexpected error" };
  }
}
