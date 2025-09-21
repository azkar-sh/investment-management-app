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
import { PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog";
import { deleteInvestmentAction } from "@/lib/actions/investment-actions";
import { formatCurrency } from "@/lib/currency";
import { safeFormatCurrency, safeFormatDate, safeText } from "@/lib/format";
import InvestmentCard from "@/components/investment/investmentCard";
import AddInvestmentModal from "@/components/investment/add-investment-modal";

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
          <AddInvestmentModal />
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
              {investments.map((inv) => (
                <InvestmentCard key={inv.id} investment={inv} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
