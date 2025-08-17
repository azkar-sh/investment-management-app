import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp, Wallet } from "lucide-react"
import { getPortfolioSummary } from "@/lib/dashboard-data"

export default async function PortfolioOverview() {
  const portfolioData = await getPortfolioSummary()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
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
          <div className={`text-2xl font-bold ${portfolioData.totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
            {portfolioData.totalGain >= 0 ? "+" : ""}${portfolioData.totalGain.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {portfolioData.totalGainPercent >= 0 ? "+" : ""}
            {portfolioData.totalGainPercent.toFixed(2)}% overall return
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${portfolioData.totalInvested.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Principal investment amount</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
          {portfolioData.todayChange > 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${portfolioData.todayChange > 0 ? "text-green-600" : "text-red-600"}`}>
            {portfolioData.todayChange > 0 ? "+" : ""}${portfolioData.todayChange.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {portfolioData.todayChangePercent > 0 ? "+" : ""}
            {portfolioData.todayChangePercent.toFixed(2)}% today
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
