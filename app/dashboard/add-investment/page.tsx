import DashboardHeader from "@/components/dashboard/dashboard-header";
import AddInvestmentForm from "@/components/investment/add-investment-form";
import { getInvestmentTypesServer } from "@/lib/database/server";

export default async function AddInvestmentPage() {
  const investmentTypes = await getInvestmentTypesServer();

  return (
    <>
      <DashboardHeader
        title="Add Investment"
        description="Add a new investment to your portfolio"
      />

      <div className="flex-1 overflow-auto p-6">
        <AddInvestmentForm investmentTypes={investmentTypes} />
      </div>
    </>
  );
}
