"use client";

import type React from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { deleteInvestmentAction } from "@/lib/actions/investment-actions";

interface DeleteConfirmationDialogProps {
  title: string;
  description: string;
  investmentId?: string; // New prop for investment ID
  onConfirm?: () => Promise<void>; // Keep this optional for backward compatibility
  triggerClassName?: string;
  children?: React.ReactNode;
}

export default function DeleteConfirmationDialog({
  title,
  description,
  investmentId,
  onConfirm,
  triggerClassName,
  children,
}: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (investmentId) {
        // Use the server action directly
        const result = await deleteInvestmentAction(investmentId);
        if (!result.success) {
          throw new Error(result.error || "Failed to delete investment");
        }
      } else if (onConfirm) {
        // Fallback to onConfirm for backward compatibility
        await onConfirm();
      }

      toast({
        title: "Deleted",
        description: "Investment has been removed successfully",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn("text-destructive", triggerClassName)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
