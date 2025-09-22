import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getPortfolioSummary } from "@/lib/dashboard-data";
import { formatCurrency } from "@/lib/currency";
import { getDefaultCurrency } from "@/lib/settings";
import { calculatePortfolioAnalytics } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

export default async function PortfolioOverview() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  const [portfolioData, currency2] = await Promise.all([
    getPortfolioSummary(),
    getDefaultCurrency(),
  ]);

  const [analytics, currency] = await Promise.all([
    calculatePortfolioAnalytics(user.id),
    getDefaultCurrency(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(analytics.totalValue, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {portfolioData.todayChangePercent > 0 ? "+" : ""}
            {portfolioData.todayChangePercent.toFixed(2)}% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              analytics.totalGain >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {analytics.totalGain >= 0 ? "+" : ""}
            {formatCurrency(analytics.totalGain, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.totalGainPercent >= 0 ? "+" : ""}
            {analytics.totalGainPercent.toFixed(2)}% overall return
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(analytics.totalInvested, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            Principal investment amount
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
