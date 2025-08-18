import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface AnalyticsOverviewProps {
  totalValue: number
  totalInvested: number
  totalGain: number
  totalGainPercent: number
  assetCount: number
  categoryCount: number
  currency: string
}

export default function AnalyticsOverview({
  totalValue,
  totalInvested,
  totalGain,
  totalGainPercent,
  assetCount,
  categoryCount,
  currency,
}: AnalyticsOverviewProps) {
  const isPositiveGain = totalGain >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalValue, currency)}
          </div>
          <p className="text-xs text-muted-foreground">Current market value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          {isPositiveGain ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isPositiveGain ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositiveGain ? "+" : ""}
            {formatCurrency(totalGain, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {isPositiveGain ? "+" : ""}
            {totalGainPercent.toFixed(2)}% overall return
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalInvested, currency)}
          </div>
          <p className="text-xs text-muted-foreground">Principal investment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{assetCount}</div>
          <p className="text-xs text-muted-foreground">Individual investments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Asset Categories</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categoryCount}</div>
          <p className="text-xs text-muted-foreground">Different asset types</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Return</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {assetCount > 0 ? (totalGainPercent / assetCount).toFixed(2) : "0.00"}%
          </div>
          <p className="text-xs text-muted-foreground">Per investment</p>
        </CardContent>
      </Card>
    </div>
  )
}
