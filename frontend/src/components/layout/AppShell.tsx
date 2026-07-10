"use client";

import React from "react";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { MobileBottomNav, MobileDrawer } from "@/components/navigation/MobileNav";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  fullBleed?: boolean; // skip content padding (e.g. for session page)
}

export function AppShell({
  children,
  headerTitle,
  headerSubtitle,
  headerActions,
  className,
  fullBleed = false,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Mobile drawer */}
      <MobileDrawer />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto md:overflow-hidden">
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          actions={headerActions}
        />

        <main
          className={cn(
            "flex-1 md:overflow-y-auto shrink-0 md:shrink",
            !fullBleed && "p-4 md:p-6",
            "pb-safe md:pb-6", // extra bottom padding on mobile for nav
            className
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

// Page section wrapper with consistent max-width
interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageSection({ children, className, title, description, action }: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            {title && (
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// Grid helpers
export function PageGrid({ children, cols = 3, className }: { children: React.ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid gap-4", colClass, className)}>
      {children}
    </div>
  );
}
