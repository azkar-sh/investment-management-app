import { createClient } from "@/lib/supabase/server";

export interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  totalInvested: number;
  todayChange: number;
  todayChangePercent: number;
}

export interface InvestmentWithValue {
  id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  unit: string | null;
  purchase_price: number;
  current_price: number;
  current_value: number;
  gain: number;
  gain_percent: number;
  created_at: string;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const supabase = await createClient();

  // Get user's investments first
  const { data: investments, error: investmentsError } = await supabase
    .from("investments")
    .select("*")
    .order("created_at", { ascending: false });

  if (investmentsError) {
    console.error("Error fetching investments:", investmentsError);
    return {
      totalValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      totalInvested: 0,
      todayChange: 0,
      todayChangePercent: 0,
    };
  }

  if (!investments?.length) {
    return {
      totalValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      totalInvested: 0,
      todayChange: 0,
      todayChangePercent: 0,
    };
  }

  let totalInvested = 0;
  let totalValue = 0;

  // Get latest journal entries for each investment
  for (const investment of investments) {
    const { data: latestEntry } = await supabase
      .from("journal_entries")
      .select("current_price")
      .eq("investment_id", investment.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const purchasePrice = Number(investment.initial_price_per_unit) || 0;
    const quantity = Number(investment.initial_quantity) || 0;
    const currentPrice = latestEntry?.current_price
      ? Number(latestEntry.current_price)
      : purchasePrice;

    const invested = purchasePrice * quantity;
    const currentValue = currentPrice * quantity;

    totalInvested += invested;
    totalValue += currentValue;
  }

  const totalGain = totalValue - totalInvested;
  const totalGainPercent =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalGain,
    totalGainPercent,
    totalInvested,
    todayChange: totalGain * 0.1, // Mock today's change as 10% of total gain
    todayChangePercent: totalGainPercent * 0.1,
  };
}

export async function getUserInvestments(): Promise<InvestmentWithValue[]> {
  const supabase = await createClient();

  const { data: investments, error } = await supabase
    .from("investments")
    .select(`*, investment_types (name, category, unit_type)`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching investments:", error);
    return [];
  }

  if (!investments?.length) {
    return [];
  }

  const investmentsWithValues: InvestmentWithValue[] = [];

  for (const investment of investments) {
    const { data: latestEntry } = await supabase
      .from("journal_entries")
      .select("current_price")
      .eq("investment_id", investment.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const purchasePrice = Number(investment.initial_price_per_unit) || 0;
    const quantity = Number(investment.initial_quantity) || 0;
    const currentPrice = latestEntry?.current_price
      ? Number(latestEntry.current_price)
      : purchasePrice;

    const currentValue = currentPrice * quantity;
    const investedValue = purchasePrice * quantity;
    const gain = currentValue - investedValue;
    const gainPercent = investedValue > 0 ? (gain / investedValue) * 100 : 0;

    investmentsWithValues.push({
      id: investment.id,
      name: investment.name,
      symbol: investment.symbol,
      type: investment.type,
      quantity,
      unit: investment.investment_types?.unit_type,
      purchase_price: purchasePrice,
      current_price: currentPrice,
      current_value: currentValue,
      gain,
      gain_percent: gainPercent,
      created_at: investment.created_at,
    });
  }

  return investmentsWithValues;
}

export async function getPortfolioChartData(): Promise<
  { date: string; value: number }[]
> {
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select(
      `
      created_at,
      current_price,
      investment_id,
      investments!inner(name, initial_quantity)
    `
    )
    .order("created_at", { ascending: true });

  if (error || !entries?.length) {
    // Return mock data if no real data available
    return [
      { date: "Jan", value: 10000 },
      { date: "Feb", value: 10250 },
      { date: "Mar", value: 10800 },
      { date: "Apr", value: 11500 },
      { date: "May", value: 11850 },
      { date: "Jun", value: 12200 },
    ];
  }

  // Group entries by month and calculate portfolio value
  const monthlyData = entries.reduce((acc: any, entry: any) => {
    const date = new Date(entry.created_at);
    const monthKey = date.toLocaleDateString("en-US", { month: "short" });

    if (!acc[monthKey]) {
      acc[monthKey] = { date: monthKey, value: 0 };
    }

    const value =
      entry.current_price * (entry.investments?.initial_quantity || 1);
    acc[monthKey].value += value;

    return acc;
  }, {});

  return Object.values(monthlyData);
}
