// lib/database/server.ts - For Server Components and API Routes
import { createClient } from "@/lib/supabase/server";
import type {
  Investment,
  Transaction,
  InvestmentType,
  JournalEntry,
} from "./client";

type InvestmentWithTotals = Investment & {
  totals: {
    totalQuantity: number;
    netInvested: number;
    avgCostPerUnit: number | null;
    lastTxDate: string | null;
  };
};

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
): Promise<InvestmentWithTotals[]> {
  const supabase = await createClient();

  // 1) Ambil investments + type
  const { data: investments, error: invErr } = await supabase
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

  if (invErr || !investments?.length)
    return (investments ?? []).map((i: any) => ({
      ...i,
      totals: {
        totalQuantity: 0,
        netInvested: 0,
        avgCostPerUnit: null,
        lastTxDate: null,
      },
    }));

  const ids = investments.map((i: any) => i.id);

  // 2) Ambil semua transaksi utk investment tsb
  const { data: txs, error: txErr } = await supabase
    .from("transactions")
    .select("*")
    .in("investment_id", ids);

  if (txErr) {
    console.error("Error fetching transactions:", txErr);
    // fallback: kembalikan tanpa totals
    return investments.map((i: any) => ({
      ...i,
      totals: {
        totalQuantity: 0,
        netInvested: 0,
        avgCostPerUnit: null,
        lastTxDate: null,
      },
    }));
  }

  // 3) Reduce transaksi → total per investment
  const byId = new Map<
    number,
    { qty: number; amt: number; last: string | null }
  >();
  for (const tx of txs ?? []) {
    const rec = byId.get(tx.investment_id) ?? { qty: 0, amt: 0, last: null };
    if (tx.transaction_type === "buy") {
      rec.qty += Number(tx.quantity || 0);
      rec.amt += Number(tx.total_amount || 0);
    } else if (tx.transaction_type === "sell") {
      rec.qty -= Number(tx.quantity || 0);
      rec.amt -= Number(tx.total_amount || 0);
    }
    // simpan last date
    const d = tx.transaction_date?.toString?.() ?? tx.created_at ?? null;
    if (!rec.last || (d && d > rec.last)) rec.last = d as string | null;
    byId.set(tx.investment_id, rec);
  }

  // 4) Gabungkan ke investments
  return investments.map((i: any) => {
    const rec = byId.get(i.id) ?? { qty: 0, amt: 0, last: null };
    const avg = rec.qty !== 0 ? rec.amt / rec.qty : null;

    return {
      ...i,
      totals: {
        totalQuantity: rec.qty,
        netInvested: rec.amt,
        avgCostPerUnit: avg,
        lastTxDate: rec.last,
      },
    };
  });
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
