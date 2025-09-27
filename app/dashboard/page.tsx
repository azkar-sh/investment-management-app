import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardInitializer from "@/components/dashboard/dashboard-initializer";
import DashboardPortfolioChart from "@/components/dashboard/dashboard-portfolio-chart";
import InvestmentCards from "@/components/dashboard/investment-cards";
import PortfolioOverview from "@/components/dashboard/portfolio-overview";
import AddInvestmentModal from "@/components/investment/add-investment-modal";
import { getDashboardData } from "@/lib/dashboard-service";

const EMPTY_SUMMARY = {
  totalValue: 0,
  totalGain: 0,
  totalGainPercent: 0,
  totalInvested: 0,
  todayChange: 0,
  todayChangePercent: 0,
};

const EMPTY_ANALYTICS = {
  totalValue: 0,
  totalInvested: 0,
  totalGain: 0,
  totalGainPercent: 0,
  assetAllocation: [],
  performanceData: [],
  topPerformers: [],
  investmentsByCategory: {},
};

export default async function DashboardPage() {
  let data;

  try {
    data = await getDashboardData();
  } catch (error) {
    console.error("Failed to load dashboard data", error);
    data = {
      portfolioSummary: EMPTY_SUMMARY,
      investments: [],
      chartData: [],
      currency: "USD",
      analytics: EMPTY_ANALYTICS,
    };
  }

  return (
    <>
      <DashboardInitializer {...data} />

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
            <DashboardPortfolioChart />
          </div>
          <div className="space-y-6">
            <InvestmentCards />
          </div>
        </div>
      </div>
    </>
  );
}
