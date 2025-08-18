"use client";

import type React from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const initialize = async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect("/auth/login");
        return;
      }

      setUser(user);

      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("id", user.id)
        .single();

      if (settings) {
        if (settings.theme) {
          setTheme(settings.theme);
        }
        if (typeof settings.compact_mode === "boolean") {
          document.body.classList.toggle("compact", settings.compact_mode);
        }
      }

      setLoading(false);
    };

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); // Start collapsed on mobile
      }
    };

    initialize();
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setTheme]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
          !isCollapsed && isMobile && "blur-sm"
        )}
      >
        {/* Mobile header with menu button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b bg-card md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-serif font-semibold">InvestTracker</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        )}

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
