"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import type { JournalEntry } from "@/lib/database/client";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import { deleteJournalEntry } from "@/lib/delete-actions";
import { formatCurrency } from "@/lib/currency";

interface JournalEntryCardProps {
  entry: JournalEntry;
  currency: string;
}

export default function JournalEntryCard({
  entry,
  currency,
}: JournalEntryCardProps) {
  const investment = entry.investments;
  if (!investment) return null;

  const priceChange = entry.current_price - investment.initial_price_per_unit;
  const priceChangePercent = (
    (priceChange / investment.initial_price_per_unit) *
    100
  ).toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{investment.name}</h3>
            <p className="text-sm text-muted-foreground">
              {investment.symbol && `${investment.symbol} • `}
              {new Date(entry.entry_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(Number.parseFloat(priceChangePercent))}%
            </Badge>
            <DeleteConfirmationDialog
              title="Delete Journal Entry"
              description={`Are you sure you want to delete this journal entry for ${investment.name}? This action cannot be undone.`}
              onConfirm={async () => {
                await deleteJournalEntry(entry.id as unknown as string);
              }}
              triggerClassName="text-destructive hover:text-destructive"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="font-semibold">
              {formatCurrency(entry.current_price, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Initial Price</p>
            <p className="font-medium">
              {formatCurrency(investment.initial_price_per_unit, currency)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Price Change</p>
          <p
            className={`font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(priceChange, currency)} ({isPositive ? "+" : ""}
            {priceChangePercent}%)
          </p>
        </div>

        {entry.notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Notes</p>
            <p className="text-sm bg-muted p-3 rounded-md">{entry.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
