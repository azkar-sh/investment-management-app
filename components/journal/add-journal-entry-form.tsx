"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createJournalEntry } from "@/lib/journal-actions"
import type { Investment } from "@/lib/database"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Entry...
        </>
      ) : (
        "Add Journal Entry"
      )}
    </Button>
  )
}

interface AddJournalEntryFormProps {
  investments: Investment[]
}

export default function AddJournalEntryForm({ investments }: AddJournalEntryFormProps) {
  const [state, formAction] = useActionState(createJournalEntry, null)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Journal Entry</CardTitle>
        <CardDescription>Record the current price and your thoughts about an investment's performance.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-md text-sm">
              {state.success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="investmentId">Investment *</Label>
            <Select name="investmentId" required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select an investment" />
              </SelectTrigger>
              <SelectContent>
                {investments.map((investment) => (
                  <SelectItem key={investment.id} value={investment.id.toString()}>
                    {investment.name} {investment.symbol && `(${investment.symbol})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryDate">Entry Date *</Label>
              <Input
                id="entryDate"
                name="entryDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price *</Label>
              <Input
                id="currentPrice"
                name="currentPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                required
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add your thoughts about the investment's performance, market conditions, or any other relevant observations..."
              rows={4}
              className="bg-background"
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
