"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { addTransaction } from "@/lib/investment-actions"
import type { Investment } from "@/lib/database"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Transaction...
        </>
      ) : (
        "Add Transaction"
      )}
    </Button>
  )
}

interface TransactionFormProps {
  investment: Investment
}

export default function TransactionForm({ investment }: TransactionFormProps) {
  const [state, formAction] = useActionState(addTransaction, null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a buy or sell transaction for {investment.name}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="investmentId" value={investment.id} />

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
            <Label htmlFor="transactionType">Transaction Type *</Label>
            <Select name="transactionType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input id="quantity" name="quantity" type="number" step="0.000001" min="0" placeholder="10" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price per Unit *</Label>
              <Input
                id="pricePerUnit"
                name="pricePerUnit"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDate">Transaction Date *</Label>
            <Input id="transactionDate" name="transactionDate" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Add any notes about this transaction..." rows={3} />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
