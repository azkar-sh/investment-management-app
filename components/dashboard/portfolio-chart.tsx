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
import {
  Area,
  AreaChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

type Pt = { date: string; value: number };
interface PortfolioChartProps {
  data: Pt[];
  currency: string;
  title?: string;
  description?: string;
  /** tinggi pada desktop; mobile pakai aspect agar stabil */
  height?: number;
}

export default function PortfolioChart({
  data,
  currency,
  title = "Portfolio Performance",
  description = "Your portfolio value over time",
  height = 320,
}: PortfolioChartProps) {
  const chartData = data?.length
    ? data
    : [
        { date: "Jan", value: 0 },
        { date: "Feb", value: 0 },
        { date: "Mar", value: 0 },
        { date: "Apr", value: 0 },
        { date: "May", value: 0 },
        { date: "Jun", value: 0 },
      ];

  // --- hitung domain Y dengan padding agar tidak nempel tepi
  const [yMin, yMax] = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const d of chartData) {
      if (d.value < min) min = d.value;
      if (d.value > max) max = d.value;
    }
    if (!isFinite(min) || !isFinite(max)) return [0, 0];
    if (min === max) {
      const pad = Math.max(1, max * 0.05);
      return [max - pad, max + pad];
    }
    const range = max - min;
    const pad = range * 0.08;
    return [min - pad, max + pad];
  }, [chartData]);

  // --- ResizeObserver: ganti key supaya ResponsiveContainer re-measure
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [resizeKey, setResizeKey] = useState(0);
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => setResizeKey((k) => k + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const compactYAxis = (v: number) =>
    Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(v);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Wrapper WAJIB: punya height & min-w-0 agar flex container tidak nge-extend lebar */}
        <div ref={wrapRef} className="min-w-0 w-full">
          {/* Mobile pakai aspect biar aman, desktop pakai fixed height */}
          <div className="block sm:hidden w-full">
            <ChartContainer
              config={{
                value: {
                  label: "Portfolio Value",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full"
            >
              <ResponsiveContainer
                width="100%"
                aspect={1.8}
                debounce={1}
                key={`m-${resizeKey}`}
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 12, bottom: 8, left: 12 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="date"
                    tickMargin={6}
                    interval="preserveEnd"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    width={48}
                    tickMargin={6}
                    tickFormatter={(v) =>
                      `${getCurrencySymbol(currency)}${compactYAxis(Number(v))}`
                    }
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(l) => String(l)}
                        formatter={(val) => [
                          formatCurrency(Number(val), currency),
                          "Portfolio Value",
                        ]}
                      />
                    }
                  />
                  <defs>
                    <linearGradient id="lineG" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.9,
                        }}
                      />
                      <stop
                        offset="100%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.2,
                        }}
                      />
                    </linearGradient>
                    <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.18,
                        }}
                      />
                      <stop
                        offset="100%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.04,
                        }}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="transparent"
                    fill="url(#areaG)"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineG)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 5,
                      stroke: "var(--color-value)",
                      strokeWidth: 2,
                      fill: "var(--color-value)",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="hidden sm:block w-full" style={{ height }}>
            <ChartContainer
              config={{
                value: {
                  label: "Portfolio Value",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                debounce={1}
                key={`d-${resizeKey}`}
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 16, bottom: 8, left: 12 }}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="date"
                    tickMargin={6}
                    interval="preserveEnd"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    width={56}
                    tickMargin={6}
                    tickFormatter={(v) =>
                      `${getCurrencySymbol(currency)}${compactYAxis(Number(v))}`
                    }
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(l) => String(l)}
                        formatter={(val) => [
                          formatCurrency(Number(val), currency),
                          "Portfolio Value",
                        ]}
                      />
                    }
                  />
                  <defs>
                    <linearGradient id="lineGd" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.9,
                        }}
                      />
                      <stop
                        offset="100%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.2,
                        }}
                      />
                    </linearGradient>
                    <linearGradient id="areaGd" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.18,
                        }}
                      />
                      <stop
                        offset="100%"
                        style={{
                          stopColor: "var(--color-value)",
                          stopOpacity: 0.04,
                        }}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="transparent"
                    fill="url(#areaGd)"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineGd)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 5,
                      stroke: "var(--color-value)",
                      strokeWidth: 2,
                      fill: "var(--color-value)",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {(!data || data.length === 0) && (
          <p className="mt-3 text-xs text-muted-foreground">
            No data yet — add investments to see your performance over time.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
