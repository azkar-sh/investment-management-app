"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

interface PerformanceData {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  title?: string;
  description?: string;
  currency: string;
}

export default function PerformanceChart({
  data,
  title = "Portfolio Performance",
  description = "Your portfolio value over time",
  currency,
}: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No performance data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Portfolio Value",
              color: "var(--chart-1)",
            },
          }}
          style={{ ["--color-value" as any]: "var(--chart-1)" }}
        >
          <ResponsiveContainer width="100%" aspect={2}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.98),
                  (dataMax: number) => Math.ceil(dataMax * 1.02),
                ]}
                tickCount={5}
                tickFormatter={(value) =>
                  `${getCurrencySymbol(currency)}${(
                    Number(value) / 1000
                  ).toFixed(0)}k`
                }
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [
                  formatCurrency(Number(value), currency),
                  "Portfolio Value",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeOpacity={0.9}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                baseValue="dataMin"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
