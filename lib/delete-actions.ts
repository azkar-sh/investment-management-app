"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteInvestment(investmentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // First delete related journal entries
  const { error: journalError } = await supabase
    .from("journal_entries")
    .delete()
    .eq("investment_id", investmentId)
    .eq("user_id", user.id);

  if (journalError) {
    console.error("Error deleting journal entries:", journalError);
    throw new Error("Failed to delete related journal entries");
  }

  // Then delete related transactions
  const { error: transactionError } = await supabase
    .from("transactions")
    .delete()
    .eq("investment_id", investmentId)
    .eq("user_id", user.id);

  if (transactionError) {
    console.error("Error deleting transactions:", transactionError);
    throw new Error("Failed to delete related transactions");
  }

  // Finally delete the investment
  const { error: investmentError } = await supabase
    .from("investments")
    .delete()
    .eq("id", investmentId)
    .eq("user_id", user.id);

  if (investmentError) {
    console.error("Error deleting investment:", investmentError);
    throw new Error("Failed to delete investment");
  }

  // Revalidate all related pages
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/portfolio");
  revalidatePath("/dashboard/analytics");
}

export async function deleteJournalEntry(entryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting journal entry:", error);
    throw new Error("Failed to delete journal entry");
  }

  // Revalidate all related pages
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/journal");
  revalidatePath("/dashboard/analytics");
}
