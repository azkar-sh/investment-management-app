import DashboardHeader from "@/components/dashboard/dashboard-header";
import JournalEntryCard from "@/components/journal/journal-entry-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getUserJournalEntriesServer } from "@/lib/database/server";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your journal.</div>;
  }

  const journalEntries = await getUserJournalEntriesServer(user.id);

  return (
    <>
      <DashboardHeader
        title="Investment Journal"
        description="Track price changes and record your investment insights"
      >
        <Button
          asChild
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Link href="/dashboard/journal/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Entry
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex-1 overflow-auto p-6">
        {journalEntries.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Journal Entries Yet</CardTitle>
              <CardDescription>
                Start tracking your investments by recording current prices and
                your thoughts about market conditions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link href="/dashboard/journal/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Entry
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold">
                Recent Entries
              </h2>
              <span className="text-sm text-muted-foreground">
                {journalEntries.length} entries
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {journalEntries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
