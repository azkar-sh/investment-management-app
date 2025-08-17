"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface PortfolioChartProps {
  data: Array<{ date: string; value: number }>
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { date: "Jan", value: 0 },
          { date: "Feb", value: 0 },
          { date: "Mar", value: 0 },
          { date: "Apr", value: 0 },
          { date: "May", value: 0 },
          { date: "Jun", value: 0 },
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <CardDescription>Your portfolio value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Portfolio Value",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Portfolio Value"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={3}
                dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-value)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
