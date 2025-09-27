import { createClient } from "@/lib/supabase/server";
import {
  getPortfolioSummary,
  getUserInvestments,
  getPortfolioChartData,
  type PortfolioSummary,
  type InvestmentWithValue,
  type PortfolioChartPoint,
} from "@/lib/dashboard-data";
import { getDefaultCurrency } from "@/lib/settings";
import {
  calculatePortfolioAnalytics,
  type PortfolioAnalytics,
} from "@/lib/analytics";

export interface DashboardDataPayload {
  portfolioSummary: PortfolioSummary;
  investments: InvestmentWithValue[];
  chartData: PortfolioChartPoint[];
  currency: string;
  analytics: PortfolioAnalytics;
}

export async function getDashboardData(): Promise<DashboardDataPayload> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const [chartData, currency] = await Promise.all([
      getPortfolioChartData(),
      getDefaultCurrency(),
    ]);

    return {
      portfolioSummary: {
        totalValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        totalInvested: 0,
        todayChange: 0,
        todayChangePercent: 0,
      },
      investments: [],
      chartData,
      currency: currency || "USD",
      analytics: {
        totalValue: 0,
        totalInvested: 0,
        totalGain: 0,
        totalGainPercent: 0,
        assetAllocation: [],
        performanceData: [],
        topPerformers: [],
        investmentsByCategory: {},
      },
    };
  }

  const [portfolioSummary, investments, chartData, currency, analytics] =
    await Promise.all([
      getPortfolioSummary(),
      getUserInvestments(),
      getPortfolioChartData(),
      getDefaultCurrency(),
      calculatePortfolioAnalytics(user.id),
    ]);

  return {
    portfolioSummary,
    investments,
    chartData,
    currency: currency || "USD",
    analytics,
  };
}
