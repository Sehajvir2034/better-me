"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  Salad,
  Droplets,
  Sparkles,
  Wind,
  Moon,
  Dumbbell,
  BookHeart,
  TrendingUp,
  X,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  useSidebar,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/water", label: "Water", icon: Droplets },
  { href: "/nutrition", label: "Nutrition", icon: Salad },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/activity", label: "Activity", icon: Dumbbell },
  { href: "/vitamins", label: "Vitamins", icon: Pill },
  { href: "/skincare", label: "Skincare", icon: Sparkles },
  { href: "/haircare", label: "Hair Care", icon: Wind },
  { href: "/journal", label: "Journal", icon: BookHeart },
  { href: "/trends", label: "Trends", icon: TrendingUp },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      {/* ── Header ─────────────────────────────────────────── */}
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xl font-satoshi uppercase font-medium tracking-widest group-data-[collapsible=icon]:hidden">
              Better Us
            </span>
            <p className="text-xs font-satoshi uppercase text-muted-foreground font-medium tracking-widest">
              Health Tracker
            </p>
            {/* Icon shown when collapsed */}
            {/* <span className="hidden text-lg font-bold group-data-[collapsible=icon]:block">
              BU
            </span> */}
          </div>
          {/* ── Close button ───────────────────────────────── */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:text-white cursor-pointer hover:bg-orange-400 mt-1 group-data-[collapsible=icon]:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        </div>
      </SidebarHeader>

      {/* ── Main nav ───────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {PRIMARY_NAV.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === href}
                  data-active={pathname === href}
                  tooltip={label} // shows on collapsed icon hover
                >
                  <Link href={href}>
                    <Icon />
                    <span className="text-sm font-satoshi uppercase font-normal tracking-widest">
                      {label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ─────────────────────────────────────────── */}
      {/* <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">Stay consistent 💪</p>
      </SidebarFooter> */}
    </Sidebar>
  );
}
