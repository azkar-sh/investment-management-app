"use client";

import { create } from "zustand";

import type {
  InvestmentWithValue,
  PortfolioChartPoint,
  PortfolioSummary,
} from "@/lib/dashboard-data";
import type { DashboardDataPayload } from "@/lib/dashboard-service";
import type { PortfolioAnalytics } from "@/lib/analytics";

interface DashboardState {
  initialized: boolean;
  loading: boolean;
  error?: string;
  portfolioSummary: PortfolioSummary | null;
  investments: InvestmentWithValue[];
  chartData: PortfolioChartPoint[];
  currency: string;
  analytics: PortfolioAnalytics | null;
  setInitialData: (payload: DashboardDataPayload) => void;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  initialized: false,
  loading: false,
  error: undefined,
  portfolioSummary: null,
  investments: [],
  chartData: [],
  currency: "USD",
  analytics: null,
  setInitialData: (payload) => {
    set((state) => ({
      ...state,
      portfolioSummary: payload.portfolioSummary,
      investments: payload.investments,
      chartData: payload.chartData,
      currency: payload.currency || "USD",
      analytics: payload.analytics,
      initialized: true,
      loading: false,
      error: undefined,
    }));
  },
  refresh: async () => {
    if (get().loading) {
      return;
    }

    set((state) => ({ ...state, loading: true, error: undefined }));

    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });

      if (!response.ok) {
        let message = "Unable to refresh dashboard data";
        try {
          const body = (await response.json()) as { error?: string };
          if (body?.error) {
            message = body.error;
          }
        } catch {
          // ignore body parse errors
        }
        throw new Error(message);
      }

      const data = (await response.json()) as DashboardDataPayload;

      set((state) => ({
        ...state,
        portfolioSummary: data.portfolioSummary,
        investments: data.investments,
        chartData: data.chartData,
        currency: data.currency || "USD",
        analytics: data.analytics,
        initialized: true,
        loading: false,
        error: undefined,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to refresh dashboard";
      console.error("Dashboard refresh failed", error);
      set((state) => ({ ...state, loading: false, error: message }));
      throw new Error(message);
    }
  },
}));
