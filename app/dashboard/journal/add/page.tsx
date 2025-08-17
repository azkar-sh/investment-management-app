import DashboardHeader from "@/components/dashboard/dashboard-header";
import AddJournalEntryForm from "@/components/journal/add-journal-entry-form";
import { createClient } from "@/lib/supabase/server";
import { getUserInvestmentsServer } from "@/lib/database/server";

export default async function AddJournalEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to add journal entries.</div>;
  }

  const investments = await getUserInvestmentsServer(user.id);

  if (investments.length === 0) {
    return (
      <>
        <DashboardHeader
          title="Add Journal Entry"
          description="Record investment price changes and insights"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No Investments Found</h2>
            <p className="text-muted-foreground mb-6">
              You need to add investments before creating journal entries.
            </p>
            <a
              href="/dashboard/add-investment"
              className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
            >
              Add Your First Investment
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        title="Add Journal Entry"
        description="Record investment price changes and insights"
      />

      <div className="flex-1 overflow-auto p-6">
        <AddJournalEntryForm investments={investments} />
      </div>
    </>
  );
}
