"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createInvestment } from "@/lib/investment-actions";
import type { InvestmentType } from "@/lib/database";
import { toast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Investment...
        </>
      ) : (
        "Add Investment"
      )}
    </Button>
  );
}

interface AddInvestmentFormProps {
  investmentTypes?: InvestmentType[];
  onSuccess?: () => void;
}

export default function AddInvestmentForm({
  investmentTypes = [],
  onSuccess,
}: AddInvestmentFormProps) {
  const [state, formAction] = useActionState(createInvestment, null);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Investment created", description: state.success });
      if (onSuccess) onSuccess();
    }
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, onSuccess]);

  return (
    <div className="max-w-2xl mx-auto">
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Investment Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Apple Inc., Gold, Bitcoin"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol (Optional)</Label>
            <Input
              id="symbol"
              name="symbol"
              placeholder="e.g., AAPL, XAU, BTC"
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investmentTypeId">Investment Type *</Label>
          <Select name="investmentTypeId" required>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select investment type" />
            </SelectTrigger>
            <SelectContent>
              {investmentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name} ({type.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Initial Amount *</Label>
            <Input
              id="initialAmount"
              name="initialAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000.00"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialQuantity">Quantity *</Label>
            <Input
              id="initialQuantity"
              name="initialQuantity"
              type="number"
              step="0.000001"
              min="0"
              placeholder="10"
              required
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select name="currency" defaultValue="USD">
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="IDR">IDR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            required
            className="bg-background"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
