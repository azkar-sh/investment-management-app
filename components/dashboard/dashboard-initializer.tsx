"use client";

import { useEffect } from "react";

import type { DashboardDataPayload } from "@/lib/dashboard-service";
import { useDashboardStore } from "@/stores/dashboard-store";

type DashboardInitializerProps = DashboardDataPayload;

export default function DashboardInitializer({
  portfolioSummary,
  investments,
  chartData,
  currency,
  analytics,
}: DashboardInitializerProps) {
  const setInitialData = useDashboardStore((state) => state.setInitialData);

  useEffect(() => {
    setInitialData({
      portfolioSummary,
      investments,
      chartData,
      currency,
      analytics,
    });
  }, [
    setInitialData,
    portfolioSummary,
    investments,
    chartData,
    currency,
    analytics,
  ]);

  return null;
}
