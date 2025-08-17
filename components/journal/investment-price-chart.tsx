"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { JournalEntry } from "@/lib/database"

interface InvestmentPriceChartProps {
  entries: JournalEntry[]
  investmentName: string
}

export default function InvestmentPriceChart({ entries, investmentName }: InvestmentPriceChartProps) {
  // Sort entries by date and prepare chart data
  const chartData = entries
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map((entry) => ({
      date: new Date(entry.entry_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: entry.current_price,
      fullDate: entry.entry_date,
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>No price data available yet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          Add journal entries to see price trends
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History - {investmentName}</CardTitle>
        <CardDescription>Price movements based on your journal entries</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                strokeWidth={3}
                dot={{ fill: "var(--color-price)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-price)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
