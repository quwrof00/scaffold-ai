"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Sparkles, Map, Clock, Settings,
  Users, ClipboardList, AlertTriangle, TrendingUp,
  ChevronLeft, ChevronRight, LogOut, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar";
import { Avatar, ProgressBar, Tooltip } from "@/components/primitives";
import { STUDENT_NAV_SECTIONS, TEACHER_NAV_SECTIONS, PARENT_NAV_SECTIONS } from "@/mock-data";
import { useSession, signOut } from "next-auth/react";
import type { NavItem } from "@/types";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Sparkles, Map, Clock, Settings,
  Users, ClipboardList, AlertTriangle, TrendingUp,
};

function NavIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />;
}

function SidebarNavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  const content = (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]",
        isCollapsed && "justify-center px-0"
      )}
    >
      <span className={cn("relative z-10", isActive && "text-[hsl(var(--primary))]")}>
        <NavIcon name={item.icon} />
      </span>
      {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
      {item.badge && !isCollapsed && (
        <span className="ml-auto relative z-10 text-xs bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] px-1.5 py-0.5 rounded-full font-medium">
          {item.badge}
        </span>
      )}
    </Link>
  );

  return content;
}

export function DesktopSidebar() {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Student";
  const userGrade = (session?.user as any)?.grade || "";
  const levelProgress = 0; // Will be updated once profile is fetched

  const navSections = React.useMemo(() => {
    const role = (session?.user as any)?.role;
    if (role === "TEACHER") return TEACHER_NAV_SECTIONS;
    if (role === "PARENT") return PARENT_NAV_SECTIONS;
    return STUDENT_NAV_SECTIONS;
  }, [session]);

  return (
    <aside className={cn("hidden md:flex flex-col h-screen bg-[hsl(var(--surface))] border-r border-[hsl(var(--border))] relative z-20 flex-shrink-0 transition-all duration-300", isCollapsed ? "w-[72px]" : "w-[240px]")}>
      {/* Logo */}
      <div className={cn("flex items-center h-[var(--header-height)] flex-shrink-0", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" title={isCollapsed ? "ScaffoldAI" : undefined}>
          <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-md flex items-center justify-center shrink-0">
             <span className="text-white font-bold text-sm">S</span>
          </div>
          {!isCollapsed && <span className="font-bold text-[15px] tracking-tight text-[hsl(var(--foreground))] overflow-hidden whitespace-nowrap">
            ScaffoldAI
          </span>}
        </Link>
        {!isCollapsed && (
          <button onClick={toggleCollapse} className="p-1 rounded-md hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--muted-foreground))] transition-colors">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
      
      {isCollapsed && (
        <div className="flex justify-center mb-2">
          <button onClick={toggleCollapse} className="p-1.5 rounded-md hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--muted-foreground))] transition-colors border border-[hsl(var(--border))]">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navSections.map((section) => (
          <div key={section.id} className="space-y-0.5">
            {section.label && !isCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)] px-3 py-2">
                {section.label}
              </p>
            )}
            {section.label && isCollapsed && (
              <div className="h-px w-8 mx-auto bg-[hsl(var(--border))] my-2" />
            )}
            {section.items.map((item) => (
              <SidebarNavItem key={item.id} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 py-3 border-t border-[hsl(var(--border))] flex-shrink-0">
        <div className={cn("rounded-[var(--radius-md)] bg-[hsl(var(--surface-2))] p-3 space-y-2.5", isCollapsed && "flex flex-col items-center p-2")}>
          <div className={cn("flex items-center gap-2.5 min-w-0", isCollapsed && "justify-center")}>
            <Avatar name={userName} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">{userName}</p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{session?.user?.email || ""}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">ScaffoldAI</span>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title={isCollapsed ? "Log out" : undefined}
              className={cn("p-2 w-full flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] rounded-[var(--radius-sm)] transition-colors text-xs font-semibold", isCollapsed && "px-0")}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
