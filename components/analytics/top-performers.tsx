import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface TopPerformer {
  name: string
  symbol?: string
  gainPercent: number
  currentValue: number
}

interface TopPerformersProps {
  performers: TopPerformer[]
}

export default function TopPerformers({ performers }: TopPerformersProps) {
  if (performers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>No performance data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          Add investments to see top performers
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
        <CardDescription>Your best and worst performing investments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.map((performer, index) => {
            const isPositive = performer.gainPercent >= 0
            return (
              <div
                key={`${performer.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    {performer.symbol && <p className="text-sm text-muted-foreground">{performer.symbol}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={isPositive ? "default" : "destructive"} className="mb-1">
                    {isPositive ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                    {Math.abs(performer.gainPercent).toFixed(2)}%
                  </Badge>
                  <p className="text-sm text-muted-foreground">${performer.currentValue.toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
