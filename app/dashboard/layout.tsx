"use client";

import type React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const THEME_STORAGE_KEY = "investtracker-theme"; // samakan dengan ThemeProvider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  // pastikan bootstrap theme dari DB hanya sekali
  const didBootstrapThemeRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // di client, pakai push, bukan redirect()
        router.replace("/auth/login");
        return;
      }

      setUser(user);

      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("id", user.id)
        .single();

      // === BOOTSTRAP THEME DARI DB (HANYA JIKA BELUM ADA DI STORAGE) ===
      if (settings && !didBootstrapThemeRef.current) {
        try {
          const stored = localStorage.getItem(THEME_STORAGE_KEY);
          // hanya apply dari DB kalau storage belum punya preferensi (first run / fresh browser)
          if (!stored && settings.theme) {
            setTheme(settings.theme as "light" | "dark" | "system");
          }
        } catch {
          // no-op
        } finally {
          didBootstrapThemeRef.current = true;
        }

        // compact mode: boleh langsung diterapkan (ini bukan urusan next-themes)
        if (typeof settings.compact_mode === "boolean") {
          document.body.classList.toggle("compact", settings.compact_mode);
        }
      }

      setLoading(false);
    };

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };

    initialize();
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router, setTheme]);

  const toggleSidebar = () => setIsCollapsed((v) => !v);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
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
            <div className="w-9" />
          </div>
        )}

        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
