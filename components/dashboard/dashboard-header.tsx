"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  description,
  children,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex py-2 items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">{children}</div>
      </div>
    </div>
  );
}
