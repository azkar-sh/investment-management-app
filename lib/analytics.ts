import { createClient } from "@/lib/supabase/server";
import type { Investment } from "@/lib/database";

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

  // Get user investments with types
  const { data: investments, error: investmentsError } = await supabase
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
    .eq("user_id", userId);

  if (investmentsError || !investments) {
    console.error("Error fetching investments:", investmentsError);
    return getEmptyAnalytics();
  }

  // Get all journal entries for the user
  const { data: journalEntries, error: journalError } = await supabase
    .from("journal_entries")
    .select(
      `
      *,
      investments!inner (
        id,
        name,
        symbol,
        initial_price_per_unit,
        initial_quantity,
        user_id,
        investment_types (
          category
        )
      )
    `
    )
    .eq("investments.user_id", userId)
    .order("entry_date", { ascending: true });

  if (journalError) {
    console.error("Error fetching journal entries:", journalError);
  }

  // Calculate basic metrics
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.initial_amount,
    0
  );

  // For demo purposes, simulate current values based on journal entries or add 5-15% growth
  const investmentsWithCurrentValue = investments.map((investment) => {
    const latestEntry = journalEntries?.find(
      (entry) => entry.investments?.id === investment.id
    );

    let currentPrice = investment.initial_price_per_unit;
    if (latestEntry) {
      currentPrice = latestEntry.current_price;
    } else {
      // Simulate price changes for demo
      const randomGrowth = 0.95 + Math.random() * 0.3; // -5% to +25%
      currentPrice = investment.initial_price_per_unit * randomGrowth;
    }

    const currentValue = currentPrice * investment.initial_quantity;
    return {
      ...investment,
      currentPrice,
      currentValue,
      gain: currentValue - investment.initial_amount,
      gainPercent:
        ((currentValue - investment.initial_amount) /
          investment.initial_amount) *
        100,
    };
  });

  const totalValue = investmentsWithCurrentValue.reduce(
    (sum, inv) => sum + inv.currentValue,
    0
  );
  const totalGain = totalValue - totalInvested;
  const totalGainPercent =
    totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Calculate asset allocation by category
  const categoryMap = new Map<string, { value: number; count: number }>();
  const investmentsByCategory: Record<string, Investment[]> = {};

  investmentsWithCurrentValue.forEach((investment) => {
    const category = investment.investment_types?.category || "Other";
    const existing = categoryMap.get(category) || { value: 0, count: 0 };
    categoryMap.set(category, {
      value: existing.value + investment.currentValue,
      count: existing.count + 1,
    });

    if (!investmentsByCategory[category]) {
      investmentsByCategory[category] = [];
    }
    investmentsByCategory[category].push(investment);
  });

  const assetAllocation = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count,
    })
  );

  // Generate performance data (mock timeline for demo)
  const performanceData = generatePerformanceTimeline(
    totalInvested,
    totalValue
  );

  // Get top performers
  const topPerformers = investmentsWithCurrentValue
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
