// lib/analytics.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type { Investment, InvestmentType } from "@/lib/database/client";

export interface PortfolioAnalytics {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  assetAllocation: Array<{
    category: string;
    value: number;
    percentage: number;
    count: number;
  }>;
  performanceData: Array<{
    date: string;
    value: number;
  }>;
  topPerformers: Array<{
    name: string;
    symbol?: string;
    gainPercent: number;
    currentValue: number;
  }>;
  investmentsByCategory: Record<string, Investment[]>;
}

export async function calculatePortfolioAnalytics(
  userId: string
): Promise<PortfolioAnalytics> {
  const supabase = await createClient();

  // 1) Investments (meta)
  const { data: investments, error: invErr } = await supabase
    .from("investments")
    .select(
      `
      id,
      name,
      symbol,
      currency,
      initial_price_per_unit,
      initial_quantity,
      purchase_date,
      investment_types:investment_types!investment_type_id ( name, category, unit_type )
    `
    )
    .eq("user_id", userId);

  if (invErr || !investments?.length) {
    if (invErr) console.error(invErr);
    return getEmptyAnalytics();
  }

  const ids = investments.map((i) => i.id);

  // 2) Transactions for those investments
  const { data: txs, error: txErr } = await supabase
    .from("transactions")
    .select(
      "investment_id, transaction_type, quantity, total_amount, transaction_date"
    )
    .in("investment_id", ids);

  if (txErr) console.error("tx fetch error", txErr);

  // Aggregate for current snapshot (qty, cost basis, last tx date)
  type Agg = { qty: number; amt: number; last: string | null };
  const aggByInv = new Map<number, Agg>();

  for (const tx of txs ?? []) {
    const key = tx.investment_id as number;
    const rec = aggByInv.get(key) ?? { qty: 0, amt: 0, last: null };
    const q = Number(tx.quantity ?? 0);
    const a = Number(tx.total_amount ?? 0);

    if ((tx.transaction_type as string) === "buy") {
      rec.qty += q;
      rec.amt += a;
    } else if ((tx.transaction_type as string) === "sell") {
      rec.qty -= q;
      rec.amt -= a;
    }
    const d = (tx.transaction_date as string) ?? null;
    if (!rec.last || (d && d > rec.last)) rec.last = d;
    aggByInv.set(key, rec);
  }

  // 3) ALL journals (ASC) for historical pricing
  const { data: journals, error: jErr } = await supabase
    .from("journal_entries")
    .select("investment_id, entry_date, current_price")
    .in("investment_id", ids)
    .order("entry_date", { ascending: true });

  if (jErr) console.error("journal fetch error", jErr);

  // Map journals per investment
  const journalByInv = new Map<number, Array<{ date: Date; price: number }>>();
  for (const j of journals ?? []) {
    const id = j.investment_id as number;
    const arr = journalByInv.get(id) ?? [];
    arr.push({
      date: new Date(j.entry_date as string),
      price: Number(j.current_price ?? 0),
    });
    journalByInv.set(id, arr);
  }

  // 4) Enrich investments with current snapshot (price/value/gain)
  const investmentsWithCurrentValue = investments.map((inv) => {
    const agg = aggByInv.get(inv.id) ?? { qty: 0, amt: 0, last: null };
    const qtyNow = agg.qty; // totalQuantity
    const costBasis = agg.amt; // netInvested (buy−sell)
    const avgCost =
      qtyNow !== 0 ? costBasis / qtyNow : Number(inv.initial_price_per_unit);

    // current price priority: latest journal -> avgCost -> initial
    let latestPrice: number | undefined = undefined;
    const jArr = journalByInv.get(inv.id) ?? [];
    if (jArr.length) {
      const last = jArr[jArr.length - 1];
      latestPrice = last.price > 0 ? last.price : undefined;
    }

    const currentPrice =
      latestPrice ??
      (avgCost && avgCost > 0 ? avgCost : undefined) ??
      Number(inv.initial_price_per_unit ?? 0);

    const currentValue = Math.max(0, qtyNow) * Number(currentPrice || 0);
    const gain = currentValue - Math.max(0, costBasis);
    const gainPercent =
      Math.max(0, costBasis) > 0 ? (gain / Math.max(0, costBasis)) * 100 : 0;

    return {
      ...inv,
      totals: {
        totalQuantity: qtyNow,
        netInvested: costBasis,
        avgCostPerUnit: avgCost,
        lastTxDate: agg.last,
      },
      currentPrice,
      currentValue,
      gain,
      gainPercent,
    };
  });

  // 5) Portfolio summary
  const totalValue = sum(
    investmentsWithCurrentValue.map((i) => i.currentValue)
  );
  const totalInvested = sum(
    investmentsWithCurrentValue.map((i) => i.totals.netInvested)
  );
  const totalGain = totalValue - Math.max(0, totalInvested);
  const totalGainPercent =
    Math.max(0, totalInvested) > 0
      ? (totalGain / Math.max(0, totalInvested)) * 100
      : 0;

  // 6) Allocation by category (by current market value)
  const categoryMap = new Map<string, { value: number; count: number }>();
  const investmentsByCategory: Record<string, any[]> = {};

  for (const inv of investmentsWithCurrentValue) {
    const category = Array.isArray(inv.investment_types)
      ? (inv.investment_types as InvestmentType[])[0]?.category
      : (inv.investment_types as InvestmentType)?.category;

    const cur = categoryMap.get(category) ?? { value: 0, count: 0 };
    cur.value += inv.currentValue;
    cur.count += 1;
    categoryMap.set(category, cur);

    (investmentsByCategory[category] ??= []).push(inv);
  }

  const assetAllocation = Array.from(categoryMap.entries()).map(
    ([category, v]) => ({
      category,
      value: v.value,
      percentage: totalValue > 0 ? (v.value / totalValue) * 100 : 0,
      count: v.count,
    })
  );

  // 7) REAL monthly performance from tx + journal (LOCF)
  // Build transaction map (sorted)
  const txByInv = new Map<
    number,
    Array<{ date: Date; type: "buy" | "sell"; qty: number; amt: number }>
  >();
  for (const t of txs ?? []) {
    const id = t.investment_id as number;
    const arr = txByInv.get(id) ?? [];
    arr.push({
      date: new Date(t.transaction_date as string),
      type: t.transaction_type as "buy" | "sell",
      qty: Number(t.quantity ?? 0),
      amt: Number(t.total_amount ?? 0),
    });
    txByInv.set(id, arr);
  }
  for (const [id, arr] of txByInv) {
    arr.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  const months = lastNMonthsEnds(12); // 13 points
  const monthlyValues: number[] = new Array(months.length).fill(0);

  for (const inv of investments) {
    const id = inv.id as number;

    const txsInv = txByInv.get(id) ?? [];
    let runningQty = 0;
    let txIdx = 0;

    const js = journalByInv.get(id) ?? [];
    let runningPrice: number | null = null;
    let jIdx = 0;

    const fallbackPrice = Number(inv.initial_price_per_unit ?? 0) || 0; // fallback if no journal yet

    months.forEach((monthEnd, mi) => {
      // apply tx up to monthEnd
      while (txIdx < txsInv.length && txsInv[txIdx].date <= monthEnd) {
        const t = txsInv[txIdx++];
        runningQty += t.type === "buy" ? t.qty : -t.qty;
      }

      // advance journal to monthEnd (LOCF)
      while (jIdx < js.length && js[jIdx].date <= monthEnd) {
        const p = js[jIdx++].price;
        if (p > 0) runningPrice = p;
      }

      const price =
        (runningPrice ?? fallbackPrice) > 0 ? runningPrice ?? fallbackPrice : 0;
      const value = Math.max(0, runningQty) * price;
      monthlyValues[mi] += value;
    });
  }

  const performanceData = months.map((d, i) => ({
    date: fmtMMMYYYY(d),
    value: Math.round(monthlyValues[i]),
  }));

  // 8) Top performers (qty > 0)
  const topPerformers = investmentsWithCurrentValue
    .filter((i) => i.totals.totalQuantity > 0)
    .sort((a, b) => b.gainPercent - a.gainPercent)
    .slice(0, 5)
    .map((inv) => ({
      name: inv.name,
      symbol: inv.symbol,
      gainPercent: inv.gainPercent,
      currentValue: inv.currentValue,
    }));

  return {
    totalValue,
    totalInvested,
    totalGain,
    totalGainPercent,
    assetAllocation,
    performanceData,
    topPerformers,
    investmentsByCategory,
  };
}

/* -------------------- Helpers -------------------- */

function sum(arr: number[]) {
  return arr.reduce((s, n) => s + (Number.isFinite(n) ? Number(n) : 0), 0);
}

function endOfMonth(d: Date) {
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  e.setHours(23, 59, 59, 999);
  return e;
}

/** Last n months including current month end, returned ascending */
function lastNMonthsEnds(n = 12): Date[] {
  const arr: Date[] = [];
  const now = new Date();
  for (let i = n; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    d.setHours(23, 59, 59, 999);
    arr.push(d);
  }
  return arr;
}

function fmtMMMYYYY(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getEmptyAnalytics(): PortfolioAnalytics {
  return {
    totalValue: 0,
    totalInvested: 0,
    totalGain: 0,
    totalGainPercent: 0,
    assetAllocation: [],
    performanceData: [],
    topPerformers: [],
    investmentsByCategory: {},
  };
}
