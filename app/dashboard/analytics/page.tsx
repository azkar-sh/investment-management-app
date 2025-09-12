import DashboardHeader from "@/components/dashboard/dashboard-header";
import AnalyticsOverview from "@/components/analytics/analytics-overview";
import PortfolioAllocationChart from "@/components/analytics/portfolio-allocation-chart";
import PerformanceChart from "@/components/analytics/performance-chart";
import TopPerformers from "@/components/analytics/top-performers";
import { createClient } from "@/lib/supabase/server";
import { calculatePortfolioAnalytics } from "@/lib/analytics";
import { getDefaultCurrency } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  const [analytics, currency] = await Promise.all([
    calculatePortfolioAnalytics(user.id),
    getDefaultCurrency(),
  ]);

  return (
    <>
      <DashboardHeader
        title="Analytics"
        description="Comprehensive analysis of your investment portfolio performance"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AnalyticsOverview
          totalValue={analytics.totalValue}
          totalInvested={analytics.totalInvested}
          totalGain={analytics.totalGain}
          totalGainPercent={analytics.totalGainPercent}
          assetCount={
            Object.values(analytics.investmentsByCategory).flat().length
          }
          categoryCount={analytics.assetAllocation.length}
          currency={currency}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart
            data={analytics.performanceData}
            currency={currency}
          />
          <PortfolioAllocationChart
            data={analytics.assetAllocation}
            currency={currency}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopPerformers
              performers={analytics.topPerformers}
              currency={currency}
            />
          </div>
          <div className="space-y-4">
            {analytics.assetAllocation.map((category) => (
              <div
                key={category.category}
                className="bg-card rounded-lg p-4 border"
              >
                <h3 className="font-semibold mb-2">{category.category}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Value:</span>
                    <span className="font-medium">
                      {formatCurrency(category.value, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Allocation:</span>
                    <span className="font-medium">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Assets:</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
