import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { getUserInvestments } from "@/lib/dashboard-data";

export default async function InvestmentCards() {
  const investments = await getUserInvestments();

  if (investments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-semibold">Your Investments</h2>
          <Badge variant="secondary">0 Assets</Badge>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center">
              No investments yet. Start by adding your first investment!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold">Your Investments</h2>
        <Badge variant="secondary">{investments.length} Assets</Badge>
      </div>

      <div className="space-y-4">
        {investments.slice(0, 4).map((investment) => (
          <Card
            key={investment.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{investment.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {investment.symbol} • {investment.type}
                  </p>
                </div>
                <Badge
                  variant={investment.gain >= 0 ? "default" : "destructive"}
                >
                  {investment.gain >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(investment.gain_percent).toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Value
                </span>
                <span className="font-semibold">
                  ${(investment.current_value || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="font-medium">
                  {investment.quantity || 0} {investment.unit || "shares"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Price
                </span>
                <span className="font-medium">
                  ${(investment.current_price || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Gain/Loss</span>
                <span
                  className={`font-semibold ${
                    (investment.gain || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(investment.gain || 0) >= 0 ? "+" : ""}$
                  {(investment.gain || 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
