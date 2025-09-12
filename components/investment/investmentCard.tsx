import DashboardHeader from "@/components/dashboard/dashboard-header";
import TransactionForm from "@/components/investment/transaction-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getUserInvestmentsServer } from "@/lib/database/server";
import { PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import { deleteInvestmentAction } from "@/lib/actions/investment-actions";
import { formatCurrency } from "@/lib/currency";
import { safeFormatCurrency, safeFormatDate, safeText } from "@/lib/format";

type InvestmentCardProps = {
  investment: any; // pakai tipe khusus kalau sudah ada
};

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function InvestmentCard({ investment }: InvestmentCardProps) {
  const qty = Number(investment.totals?.totalQuantity ?? 0);
  const net = Number(investment.totals?.netInvested ?? 0);
  const avg = investment.totals?.avgCostPerUnit ?? null;
  const unit = investment.investment_types?.unit_type ?? "";
  const last = investment.totals?.lastTxDate ?? null;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{investment.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {investment.symbol ? `${investment.symbol} • ` : ""}
              {investment.investment_types?.name}
            </p>
          </div>
          <Badge variant="outline">
            {investment.investment_types?.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <StatRow
          label="Quantity"
          value={
            <>
              {safeText(qty)} {safeText(unit)}
            </>
          }
        />

        <StatRow
          label="Cost Basis (Net Invested)"
          value={safeFormatCurrency(net, investment.currency)}
        />

        {qty > 0 && (
          <StatRow
            label="Average Cost"
            value={safeFormatCurrency(avg, investment.currency)}
          />
        )}

        <StatRow
          label={last ? "Last Transaction" : "Purchase Date"}
          value={safeFormatDate(last ?? investment.purchase_date)}
        />

        {/* CTA */}
        <div className="flex items-center gap-2 pt-4 border-t">
          {/* Saran: jadikan TransactionForm membuka modal/drawer */}
          <TransactionForm investment={investment} />
          <Button asChild variant="secondary" size="sm">
            <Link href={`/dashboard/portfolio/${investment.id}`}>Details</Link>
          </Button>

          <div className="ml-auto">
            <DeleteConfirmationDialog
              title="Delete Investment"
              description={`Are you sure you want to delete ${investment.name}? This will also delete all related transactions and journal entries. This action cannot be undone.`}
              investmentId={investment.id.toString()}
            >
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteConfirmationDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvestmentCard;
