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

  // 1) Ambil investments (id, meta)
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

  // 2) Ambil semua transactions untuk ids tsb
  const { data: txs, error: txErr } = await supabase
    .from("transactions")
    .select(
      "investment_id, transaction_type, quantity, total_amount, transaction_date"
    )
    .in("investment_id", ids);

  if (txErr) console.error("tx fetch error", txErr);

  // Reduce transaksi → holdings & cost basis per investment
  type Agg = { qty: number; amt: number; last: string | null };
  const aggByInv = new Map<number, Agg>();

  for (const tx of txs ?? []) {
    const key = tx.investment_id as number;
    const rec = aggByInv.get(key) ?? { qty: 0, amt: 0, last: null };
    const q = Number(tx.quantity ?? 0);
    const a = Number(tx.total_amount ?? 0);

    if (tx.transaction_type === "buy") {
      rec.qty += q;
      rec.amt += a;
    } else if (tx.transaction_type === "sell") {
      rec.qty -= q;
      rec.amt -= a;
    }
    const d = (tx.transaction_date as string) ?? null;
    if (!rec.last || (d && d > rec.last)) rec.last = d;
    aggByInv.set(key, rec);
  }

  // 3) Ambil journal_entries terbaru per investment (manual price)
  const { data: journals, error: jErr } = await supabase
    .from("journal_entries")
    .select("investment_id, entry_date, current_price")
    .in("investment_id", ids)
    .order("entry_date", { ascending: false });

  if (jErr) console.error("journal fetch error", jErr);

  // Pilih yang terbaru per investment
  const lastJournalPrice = new Map<number, { date: string; price: number }>();
  for (const j of journals ?? []) {
    const id = j.investment_id as number;
    if (!lastJournalPrice.has(id)) {
      lastJournalPrice.set(id, {
        date: j.entry_date as string,
        price: Number(j.current_price ?? 0),
      });
    }
  }

  // 4) Bentuk “investmentsWithCurrentValue”
  const investmentsWithCurrentValue = investments.map((inv) => {
    const agg = aggByInv.get(inv.id) ?? { qty: 0, amt: 0, last: null };
    const qtyNow = agg.qty; // totalQuantity
    const costBasis = agg.amt; // netInvested (buy−sell)
    const avgCost =
      qtyNow !== 0 ? costBasis / qtyNow : inv.initial_price_per_unit;

    // harga sekarang prioritas: journal.latest → avgCost → initialPrice
    const j = lastJournalPrice.get(inv.id);
    const currentPrice =
      (j?.price && j.price > 0 ? j.price : undefined) ??
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
      lastJournalDate: j?.date ?? null,
    };
  });

  // 5) Ringkasan portofolio
  const totalValue = sum(
    investmentsWithCurrentValue.map((i) => i.currentValue)
  );
  // “Total Invested” → cost basis agregat; kalau banyak jualan, bisa negatif.
  // Jika mau “capital deployed only”, gunakan sum(max(netInvested, 0)).
  const totalInvested = sum(
    investmentsWithCurrentValue.map((i) => i.totals.netInvested)
  );
  const totalGain = totalValue - Math.max(0, totalInvested);
  const totalGainPercent =
    Math.max(0, totalInvested) > 0
      ? (totalGain / Math.max(0, totalInvested)) * 100
      : 0;

  // 6) Asset allocation by category (berdasarkan nilai pasar sekarang)
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

  // 7) Performance timeline (pakai generator lamamu)
  const performanceData = generatePerformanceTimeline(
    Math.max(0, totalInvested),
    totalValue
  );

  // 8) Top performers (qty > 0 saja biar relevan)
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

// helper kecil
function sum(arr: number[]) {
  return arr.reduce((s, n) => s + (Number.isFinite(n) ? Number(n) : 0), 0);
}

function generatePerformanceTimeline(
  initialValue: number,
  currentValue: number
) {
  const months = 12;
  const data = [];
  const growth = currentValue / initialValue;

  for (let i = 0; i <= months; i++) {
    const progress = i / months;
    // Add some volatility to make it more realistic
    const volatility = 0.95 + Math.random() * 0.1;
    const value = initialValue * (1 + (growth - 1) * progress) * volatility;

    const date = new Date();
    date.setMonth(date.getMonth() - (months - i));

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      value: Math.round(value),
    });
  }

  return data;
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
