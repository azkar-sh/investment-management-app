"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";
import { useDashboardStore } from "@/stores/dashboard-store";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export default function InvestmentCards() {
  const { investments, currency, loading } = useDashboardStore((state) => ({
    investments: state.investments,
    currency: state.currency,
    loading: state.loading && !state.initialized,
  }));

  if (loading) {
    return <InvestmentCardsSkeleton />;
  }

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
        {investments.slice(0, 4).map((investment) => {
          const isPositive = (investment.gain ?? 0) >= 0;
          const gainPercent = Math.abs(investment.gain_percent ?? 0).toFixed(2);

          return (
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
                  <Badge variant={isPositive ? "default" : "destructive"}>
                    {isPositive ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {gainPercent}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Value</span>
                  <span className="font-semibold">
                    {formatCurrency(investment.current_value || 0, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <span className="font-medium">
                    {investment.quantity || 0} {investment.unit || "shares"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-medium">
                    {formatCurrency(investment.current_price || 0, currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Gain/Loss</span>
                  <span
                    className={`font-semibold ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(investment.gain || 0, currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function InvestmentCardsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map((key) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
