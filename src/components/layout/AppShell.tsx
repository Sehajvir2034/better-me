"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Salad,
  Droplets,
  Moon,
  Dumbbell,
  MoreHorizontal,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/water", label: "Water", icon: Droplets },
  { href: "/nutrition", label: "Nutrition", icon: Salad },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/activity", label: "Activity", icon: Dumbbell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden">
        {/* shadcn Sidebar — handles desktop + mobile sheet automatically */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Page content */}
          <main className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-24 md:px-6 md:pt-6 md:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav — hidden on md+ */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50
                        bg-card/95 backdrop-blur-xl border-t pb-safe"
        >
          <div className="flex items-center justify-around h-16">
            {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 min-w-15 py-1",
                    "rounded-xl transition-all active:scale-95",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium leading-none">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}
