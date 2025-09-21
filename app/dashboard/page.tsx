import DashboardHeader from "@/components/dashboard/dashboard-header";
import PortfolioOverview from "@/components/dashboard/portfolio-overview";
import InvestmentCards from "@/components/dashboard/investment-cards";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import AddInvestmentModal from "@/components/investment/add-investment-modal";
import { getPortfolioChartData } from "@/lib/dashboard-data";
import { getDefaultCurrency } from "@/lib/settings";

export default async function DashboardPage() {
  const [chartData, currency] = await Promise.all([
    getPortfolioChartData(),
    getDefaultCurrency(),
  ]);

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Welcome back! Here's your portfolio overview."
      >
        <AddInvestmentModal />
      </DashboardHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PortfolioOverview />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="lg:col-span-2">
            <PortfolioChart data={chartData} currency={currency} />
          </div>
          <div className="space-y-6">
            <InvestmentCards />
          </div>
        </div>
      </div>
    </>
  );
}
