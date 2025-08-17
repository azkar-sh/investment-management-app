"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createJournalEntry(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const investmentId = formData.get("investmentId");
  const entryDate = formData.get("entryDate");
  const currentPrice = formData.get("currentPrice");
  const notes = formData.get("notes");

  if (!investmentId || !entryDate || !currentPrice) {
    return { error: "Investment, date, and current price are required" };
  }

  try {
    // Verify the investment belongs to the user
    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .select("id")
      .eq("id", Number.parseInt(investmentId.toString()))
      .eq("user_id", user.id)
      .single();

    if (investmentError || !investment) {
      return { error: "Investment not found or access denied" };
    }

    const { error } = await supabase.from("journal_entries").insert({
      investment_id: Number.parseInt(investmentId.toString()),
      entry_date: entryDate.toString(),
      current_price: Number.parseFloat(currentPrice.toString()),
      notes: notes?.toString() || null,
    });

    if (error) {
      console.error("Database error:", error);
      return { error: "Failed to create journal entry" };
    }

    revalidatePath("/dashboard/journal");
    return { success: "Journal entry created successfully" };
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteJournalEntry(entryId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Verify the journal entry belongs to the user's investment
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId)
      .eq(
        "investment_id",
        supabase.from("investments").select("id").eq("user_id", user.id)
      );

    if (error) {
      throw new Error("Failed to delete journal entry");
    }

    revalidatePath("/dashboard/journal");
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
}
