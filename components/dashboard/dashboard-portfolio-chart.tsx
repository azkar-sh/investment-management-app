"use client";

import PortfolioChart from "@/components/dashboard/portfolio-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/stores/dashboard-store";

export default function DashboardPortfolioChart() {
  const { chartData, currency, loading, initialized, error } =
    useDashboardStore((state) => ({
      chartData: state.chartData,
      currency: state.currency,
      loading: state.loading,
      initialized: state.initialized,
      error: state.error,
    }));

  if (loading && !initialized) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  return (
    <>
      {error && initialized && (
        <Alert variant="destructive">
          <AlertTitle>Unable to refresh data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <PortfolioChart data={chartData} currency={currency} />
    </>
  );
}
