// lib/actions/investment-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteInvestmentAction(investmentId: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // First verify the investment belongs to the user
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("id, user_id")
      .eq("id", investmentId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !investment) {
      throw new Error("Investment not found or unauthorized");
    }

    // Delete related transactions first (if you have foreign key constraints)
    await supabase
      .from("transactions")
      .delete()
      .eq("investment_id", investmentId);

    // Delete related journal entries
    await supabase
      .from("journal_entries")
      .delete()
      .eq("investment_id", investmentId);

    // Finally delete the investment
    const { error: deleteError } = await supabase
      .from("investments")
      .delete()
      .eq("id", investmentId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Revalidate the portfolio page to show updated data
    revalidatePath("/dashboard/portfolio");

    return { success: true };
  } catch (error) {
    console.error("Error deleting investment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete investment",
    };
  }
}
