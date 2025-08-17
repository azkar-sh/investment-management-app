// lib/database/server.ts - For Server Components and API Routes
import { createClient } from "@/lib/supabase/server";
import type {
  Investment,
  Transaction,
  InvestmentType,
  JournalEntry,
} from "./client";

// Server-side database functions (for use in Server Components and API routes)
export async function getInvestmentTypesServer(): Promise<InvestmentType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_types")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching investment types:", error);
    return [];
  }

  return data || [];
}

export async function getUserInvestmentsServer(
  userId: string
): Promise<Investment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investments")
    .select(
      `
      *,
      investment_types (
        name,
        category,
        unit_type
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching investments:", error);
    return [];
  }

  return data || [];
}

export async function getInvestmentTransactionsServer(
  investmentId: number
): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("investment_id", investmentId)
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

export async function getUserJournalEntriesServer(
  userId: string
): Promise<JournalEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select(
      `
      *,
      investments!inner (
        name,
        symbol,
        initial_price_per_unit,
        user_id,
        investment_types (
          name,
          unit_type
        )
      )
    `
    )
    .eq("investments.user_id", userId)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }

  return data || [];
}

export async function getInvestmentJournalEntriesServer(
  investmentId: number
): Promise<JournalEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select(
      `
      *,
      investments (
        name,
        symbol,
        initial_price_per_unit,
        investment_types (
          name,
          unit_type
        )
      )
    `
    )
    .eq("investment_id", investmentId)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching investment journal entries:", error);
    return [];
  }

  return data || [];
}
