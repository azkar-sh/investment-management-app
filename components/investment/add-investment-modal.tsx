"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddInvestmentForm from "./add-investment-form";
import { getInvestmentTypes } from "@/lib/database/client";
import type { InvestmentType } from "@/lib/database/client";
import { useDashboardStore } from "@/stores/dashboard-store";
import { toast } from "@/hooks/use-toast";

interface AddInvestmentModalProps {
  onSuccess?: () => void;
}

export default function AddInvestmentModal({
  onSuccess,
}: AddInvestmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const refreshDashboard = useDashboardStore((state) => state.refresh);

  useEffect(() => {
    if (isOpen) {
      getInvestmentTypes().then(setInvestmentTypes);
    }
  }, [isOpen]);

  const handleSuccess = async () => {
    setIsOpen(false);
    if (onSuccess) {
      onSuccess();
    }
    try {
      await refreshDashboard();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update dashboard.";
      toast({
        title: "Refresh failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
        </DialogHeader>
        <AddInvestmentForm
          investmentTypes={investmentTypes}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
