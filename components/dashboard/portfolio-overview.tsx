"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import { useDashboardStore } from "@/stores/dashboard-store";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";

export default function PortfolioOverview() {
  const { analytics, summary, currency, loading } = useDashboardStore((state) => ({
    analytics: state.analytics,
    summary: state.portfolioSummary,
    currency: state.currency,
    loading: state.loading && !state.initialized,
  }));

  if (loading || !analytics || !summary) {
    return <PortfolioOverviewSkeleton />;
  }

  const totalGainIsPositive = analytics.totalGain >= 0;
  const todayChangePercent = summary.todayChangePercent ?? 0;

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
            {todayChangePercent > 0 ? "+" : ""}
            {todayChangePercent.toFixed(2)}% from yesterday
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
              totalGainIsPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalGainIsPositive ? "+" : ""}
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

function PortfolioOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2].map((key) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
