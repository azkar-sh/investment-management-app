// app/dashboard/portfolio/page.tsx
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
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import { formatCurrency } from "@/lib/currency";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your portfolio.</div>;
  }

  const investments = await getUserInvestmentsServer(user.id);

  return (
    <>
      <DashboardHeader
        title="Portfolio"
        description="Manage your investments and track performance"
      >
        <Button
          asChild
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Link href="/dashboard/add-investment">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Investment
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex-1 overflow-auto p-6">
        {investments.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Investments Yet</CardTitle>
              <CardDescription>
                Start building your portfolio by adding your first investment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link href="/dashboard/add-investment">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Investment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold">
                Your Investments
              </h2>
              <Badge variant="secondary">{investments.length} Assets</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {investments.map((investment) => (
                <Card
                  key={investment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {investment.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {investment.symbol && `${investment.symbol} • `}
                          {investment.investment_types?.name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {investment.investment_types?.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Initial Investment
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(
                            investment.initial_amount,
                            investment.currency
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Quantity
                        </span>
                        <span className="font-medium">
                          {investment.initial_quantity}{" "}
                          {investment.investment_types?.unit_type}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Purchase Price
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            investment.initial_price_per_unit,
                            investment.currency
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Purchase Date
                        </span>
                        <span className="font-medium">
                          {new Date(
                            investment.purchase_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <TransactionForm investment={investment} />
                      <DeleteConfirmationDialog
                        investmentId={investment.id.toString()}
                        investmentName={investment.name}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
