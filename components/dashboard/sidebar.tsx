"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  BookOpen,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/actions"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Wallet },
  { name: "Add Investment", href: "/dashboard/add-investment", icon: PlusCircle },
  { name: "Journal", href: "/dashboard/journal", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-full flex-col bg-card border-r transition-all duration-300 ease-in-out z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
          isCollapsed ? (isMobile ? "-translate-x-full" : "w-16") : "w-64",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b px-3">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-accent flex-shrink-0" />
              <span className="text-xl font-serif font-bold transition-opacity duration-300">InvestTracker</span>
            </Link>
          ) : (
            <div className="flex items-center justify-center w-full">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          )}

          {/* Toggle button for desktop */}
          {!isMobile && (
            <Button variant="ghost" size="sm" onClick={onToggle} className="ml-auto p-1 h-8 w-8">
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed ? "justify-center" : "space-x-3",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sign out button */}
        <div className="border-t p-2">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                "w-full text-muted-foreground hover:text-foreground transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isCollapsed ? "justify-center px-3" : "justify-start",
              )}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3 transition-opacity duration-300">Sign Out</span>}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
