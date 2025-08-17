// components/ui/delete-confirmation-dialog.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteInvestmentAction } from "@/lib/actions/investment-actions";

interface DeleteConfirmationDialogProps {
  investmentId: string;
  investmentName: string;
}

export default function DeleteConfirmationDialog({
  investmentId,
  investmentName,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInvestmentAction(investmentId);

      if (result.success) {
        setIsOpen(false);
        // Success! The page will automatically refresh due to revalidatePath
      } else {
        // Handle error - you might want to show a toast notification
        console.error("Delete failed:", result.error);
        alert("Failed to delete investment: " + result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Investment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{investmentName}</strong>?
            This will also delete all related transactions and journal entries.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
