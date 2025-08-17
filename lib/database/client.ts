// lib/database/client.ts - For Client Components
import { createClient } from "@/lib/supabase/client";

export interface Investment {
  id: number;
  user_id: string;
  investment_type_id: number;
  name: string;
  symbol?: string;
  initial_amount: number;
  initial_quantity: number;
  initial_price_per_unit: number;
  currency: string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  investment_types?: {
    name: string;
    category: string;
    unit_type: string;
  };
}

export interface Transaction {
  id: number;
  investment_id: number;
  transaction_type: "buy" | "sell";
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
}

export interface InvestmentType {
  id: number;
  name: string;
  category: string;
  unit_type: string;
}

export interface JournalEntry {
  id: number;
  investment_id: number;
  entry_date: string;
  current_price: number;
  notes?: string;
  created_at: string;
  investments?: {
    name: string;
    symbol?: string;
    initial_price_per_unit: number;
    investment_types?: {
      name: string;
      unit_type: string;
    };
  };
}

// Client-side database functions (for use in Client Components)
const supabase = createClient();

export async function getInvestmentTypes(): Promise<InvestmentType[]> {
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

export async function getUserInvestments(
  userId: string
): Promise<Investment[]> {
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

export async function getInvestmentTransactions(
  investmentId: number
): Promise<Transaction[]> {
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

export async function getUserJournalEntries(
  userId: string
): Promise<JournalEntry[]> {
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

export async function getInvestmentJournalEntries(
  investmentId: number
): Promise<JournalEntry[]> {
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

// CRUD operations for Client Components
export async function createInvestment(
  investment: Omit<Investment, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("investments")
    .insert(investment)
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
    .single();

  if (error) {
    console.error("Error creating investment:", error);
    throw error;
  }

  return data;
}

export async function updateInvestment(
  id: number,
  updates: Partial<Investment>
) {
  const { data, error } = await supabase
    .from("investments")
    .update(updates)
    .eq("id", id)
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
    .single();

  if (error) {
    console.error("Error updating investment:", error);
    throw error;
  }

  return data;
}

export async function deleteInvestment(id: number) {
  const { error } = await supabase.from("investments").delete().eq("id", id);

  if (error) {
    console.error("Error deleting investment:", error);
    throw error;
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }

  return data;
}

export async function createJournalEntry(
  entry: Omit<JournalEntry, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entry)
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
    .single();

  if (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }

  return data;
}
