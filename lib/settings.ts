import { createClient } from "@/lib/supabase/server";

export async function getDefaultCurrency() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return "USD";
  }
  const { data } = await supabase
    .from("user_settings")
    .select("default_currency")
    .eq("id", user.id)
    .single();
  return data?.default_currency || "USD";
}

