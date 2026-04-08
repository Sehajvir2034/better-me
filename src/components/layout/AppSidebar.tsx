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
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xl font-satoshi uppercase font-medium tracking-widest group-data-[collapsible=icon]:hidden">
              Better Us
            </span>
            <p className="text-xs font-satoshi uppercase text-muted-foreground font-medium tracking-widest">
              Health Tracker
            </p>
            {/* Icon shown when collapsed */}
            <span className="hidden text-lg font-bold group-data-[collapsible=icon]:block">
              BU
            </span>
          </div>
          {/* ── Close button ───────────────────────────────── */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full group-data-[collapsible=icon]:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
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
                    <span className="text-xs font-satoshi uppercase font-medium letter-spacing-">
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

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Pill,
//   Salad,
//   Droplets,
//   Sparkles,
//   Wind,
//   Moon,
//   Dumbbell,
//   BookHeart,
//   TrendingUp,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarSeparator,
//   SidebarFooter,
// } from "@/components/ui/sidebar";

// const DAILY = [
//   {
//     href: "/dashboard",
//     label: "Dashboard",
//     icon: LayoutDashboard,
//     color: "text-blue-500",
//   },
//   { href: "/water", label: "Water", icon: Droplets, color: "text-cyan-500" },
//   {
//     href: "/nutrition",
//     label: "Nutrition",
//     icon: Salad,
//     color: "text-green-500",
//   },
//   { href: "/sleep", label: "Sleep", icon: Moon, color: "text-indigo-500" },
//   {
//     href: "/activity",
//     label: "Activity",
//     icon: Dumbbell,
//     color: "text-orange-500",
//   },
// ];

// const RITUALS = [
//   {
//     href: "/vitamins",
//     label: "Vitamins",
//     icon: Pill,
//     color: "text-yellow-500",
//   },
//   {
//     href: "/skincare",
//     label: "Skincare",
//     icon: Sparkles,
//     color: "text-pink-500",
//   },
//   {
//     href: "/haircare",
//     label: "Hair Care",
//     icon: Wind,
//     color: "text-purple-500",
//   },
//   {
//     href: "/journal",
//     label: "Journal",
//     icon: BookHeart,
//     color: "text-rose-500",
//   },
//   {
//     href: "/trends",
//     label: "Trends",
//     icon: TrendingUp,
//     color: "text-teal-500",
//   },
// ];

// // Reusable row — mirrors SwiftUI sidebar List row feel
// function NavItem({
//   href,
//   label,
//   icon: Icon,
//   color,
//   active,
// }: {
//   href: string;
//   label: string;
//   icon: React.ElementType;
//   color: string;
//   active: boolean;
// }) {
//   return (
//     <SidebarMenuItem>
//       <SidebarMenuButton
//         asChild
//         isActive={active}
//         tooltip={label}
//         className={[
//           // Base row — SwiftUI sidebar row: no hard border, light fill
//           "group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 h-11",
//           "text-[15px] font-[450] tracking-[-0.01em]",
//           "transition-all duration-150",
//           // Idle
//           "text-foreground/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
//           // Active — iOS sidebar tinted fill, slightly translucent
//           active
//             ? "bg-primary/10 dark:bg-primary/20 text-primary font-[550]"
//             : "",
//         ].join(" ")}
//       >
//         <Link href={href}>
//           {/* Icon wrapped in a soft pill — matches iOS Settings-style cells */}
//           <span
//             className={[
//               "flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]",
//               "transition-transform duration-150 group-active:scale-90",
//               active
//                 ? "bg-primary/15 dark:bg-primary/25"
//                 : "bg-black/[0.06] dark:bg-white/[0.08]",
//             ].join(" ")}
//           >
//             <Icon
//               size={15}
//               strokeWidth={active ? 2.4 : 1.9}
//               className={active ? "text-primary" : color}
//             />
//           </span>
//           <span>{label}</span>

//           {/* Active indicator — subtle right-side accent dot like macOS sidebar */}
//           {active && (
//             <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary opacity-80" />
//           )}
//         </Link>
//       </SidebarMenuButton>
//     </SidebarMenuItem>
//   );
// }

// export function AppSidebar() {
//   const pathname = usePathname();

//   return (
//     <Sidebar
//       collapsible="offcanvas"
//       variant="sidebar"
//       className={[
//         // iOS material sidebar background — ultra-thin material feel
//         "border-r-0",
//         "bg-white/80 dark:bg-[oklch(15%_0.008_258/0.85)]",
//         "backdrop-blur-2xl",
//         // Hairline right border — iOS separator style
//         "after:absolute after:inset-y-0 after:right-0 after:w-px",
//         "after:bg-black/[0.08] dark:after:bg-white/[0.06]",
//       ].join(" ")}
//     >
//       {/* ── Header — App name with SF Pro large title feel ─── */}
//       <SidebarHeader className="px-5 pb-2 pt-6">
//         <div className="flex items-center gap-2.5">
//           {/* App icon mark */}
//           <div
//             className="flex h-9 w-9 shrink-0 items-center justify-center
//                           rounded-[10px] bg-primary shadow-sm shadow-primary/30"
//           >
//             <span className="text-[13px] font-bold text-white tracking-tight">
//               B
//             </span>
//           </div>
//           <div className="group-data-[collapsible=icon]:hidden">
//             <p className="text-[17px] font-semibold tracking-[-0.02em] leading-tight">
//               Better Me
//             </p>
//             <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
//               Health Tracker
//             </p>
//           </div>
//         </div>
//       </SidebarHeader>

//       {/* ── Content ────────────────────────────────────────── */}
//       <SidebarContent className="px-2 pt-3">
//         {/* Section 1 — Daily Tracking */}
//         <SidebarGroup className="p-0">
//           <SidebarGroupLabel
//             className="px-3 pb-1 pt-0 text-[11px] font-semibold
//                        uppercase tracking-[0.06em] text-muted-foreground/70
//                        group-data-[collapsible=icon]:hidden"
//           >
//             Daily
//           </SidebarGroupLabel>
//           <SidebarMenu className="gap-0.5">
//             {DAILY.map((item) => (
//               <NavItem
//                 key={item.href}
//                 {...item}
//                 active={pathname === item.href}
//               />
//             ))}
//           </SidebarMenu>
//         </SidebarGroup>

//         {/* iOS-style inset separator */}
//         <div
//           className="mx-3 my-3 h-px bg-black/[0.06] dark:bg-white/[0.06]
//                         group-data-[collapsible=icon]:hidden"
//         />

//         {/* Section 2 — Rituals & More */}
//         <SidebarGroup className="p-0">
//           <SidebarGroupLabel
//             className="px-3 pb-1 pt-0 text-[11px] font-semibold
//                        uppercase tracking-[0.06em] text-muted-foreground/70
//                        group-data-[collapsible=icon]:hidden"
//           >
//             Rituals
//           </SidebarGroupLabel>
//           <SidebarMenu className="gap-0.5">
//             {RITUALS.map((item) => (
//               <NavItem
//                 key={item.href}
//                 {...item}
//                 active={pathname === item.href}
//               />
//             ))}
//           </SidebarMenu>
//         </SidebarGroup>
//       </SidebarContent>

//       {/* ── Footer — streak / motivational chip ───────────── */}
//       <SidebarFooter className="px-4 py-5 group-data-[collapsible=icon]:hidden">
//         <div
//           className="flex items-center gap-3 rounded-[14px]
//                         bg-black/[0.04] dark:bg-white/[0.05] px-3 py-2.5"
//         >
//           <span className="text-xl">🔥</span>
//           <div>
//             <p className="text-[13px] font-semibold leading-tight">
//               Keep it up!
//             </p>
//             <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
//               Stay consistent 💪
//             </p>
//           </div>
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
