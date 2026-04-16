"use client";

import * as React from "react";
import {
  Search,
  Bell,
  Settings,
  Droplets,
  Salad,
  Moon,
  Dumbbell,
  Pill,
  Sparkles,
  Wind,
  BookHeart,
  TrendingUp,
  LayoutDashboard,
  Zap,
  ArrowRight,
  Crown,
  LogOut,
  User,
  Palette,
  Download,
  SmartphoneNfc,
  Clock,
  Check,
  Menu,
} from "lucide-react";
// Add these imports
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    type: "reminder",
    icon: Pill,
    title: "Vitamin D3 + K2",
    body: "Best taken with lunch. Don't forget today!",
    time: "10 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "streak",
    icon: Droplets,
    title: "Hydration Streak 🔥",
    body: "Only 500ml away from a 13-day streak!",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 3,
    type: "ritual",
    icon: Sparkles,
    title: "Evening Skincare",
    body: "Start your 18-minute restoration ritual.",
    time: "2 hrs ago",
    unread: true,
  },
  {
    id: 4,
    type: "insight",
    icon: TrendingUp,
    title: "New Vitality Insight",
    body: "Your recovery score is optimal today.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    type: "insight",
    icon: TrendingUp,
    title: "New Vitality Insight",
    body: "Your recovery score is optimal today.",
    time: "Yesterday",
    unread: false,
  },
];

const SEARCH_QUICK_ACTIONS = [
  {
    icon: Droplets,
    label: "Log Water",
    sub: "Quick add 250ml",
    href: "/water",
  },
  {
    icon: Salad,
    label: "Log Meal",
    sub: "Add nutrition entry",
    href: "/nutrition",
  },
  { icon: Moon, label: "Log Sleep", sub: "Record last night", href: "/sleep" },
  {
    icon: Dumbbell,
    label: "Log Activity",
    sub: "Add workout",
    href: "/activity",
  },
];

const SEARCH_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Droplets, label: "Water Tracker", href: "/water" },
  { icon: Salad, label: "Nutrition", href: "/nutrition" },
  { icon: Moon, label: "Sleep", href: "/sleep" },
  { icon: Dumbbell, label: "Activity", href: "/activity" },
  { icon: Pill, label: "Vitamins", href: "/vitamins" },
  { icon: Sparkles, label: "Skincare", href: "/skincare" },
  { icon: Wind, label: "Hair Care", href: "/haircare" },
  { icon: BookHeart, label: "Journal", href: "/journal" },
  { icon: TrendingUp, label: "Trends", href: "/trends" },
];

// ─── Search Command Content (shared between mobile + desktop) ─────────────────

function SearchCommandContent({ onClose }: { onClose: () => void }) {
  return (
    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5">
      <CommandInput
        placeholder="Search entries, logs, insights..."
        className="font-satoshi"
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty className="py-8 text-center text-sm text-muted-foreground font-satoshi">
          No results found.
        </CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {SEARCH_QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.href}
              onSelect={onClose}
              className="gap-3 rounded-lg"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10">
                <action.icon className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-satoshi text-sm font-medium">
                  {action.label}
                </span>
                <span className="font-satoshi text-xs text-muted-foreground">
                  {action.sub}
                </span>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate To">
          {SEARCH_NAV.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={onClose}
              className="gap-3 rounded-lg"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-satoshi text-sm">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent Insights">
          <CommandItem className="gap-3 rounded-lg" onSelect={onClose}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/20">
              <Zap className="h-4 w-4 text-sidebar-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-satoshi text-sm font-medium">
                Hydration & Deep Sleep
              </span>
              <span className="font-satoshi text-xs text-muted-foreground">
                Correlation found — high hydration days improve deep sleep by
                18%
              </span>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

// ─── Desktop Search ───────────────────────────────────────────────────────────

function SearchDialog() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative cursor-pointer h-9 w-64 justify-start gap-2 rounded-full border-border bg-white px-3 text-sm text-black hover:text-black hover:pointer"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="font-satoshi tracking-widest">Search here...</span>
        <kbd className="pointer-events-none ml-auto hidden select-none items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-satoshi text-white text-xs sm:flex ">
          ⌘K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="overflow-hidden p-0 shadow-lg sm:max-w-xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <SearchCommandContent onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Mobile Search ────────────────────────────────────────────────────────────

function MobileSearch() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl"
        onClick={() => setOpen(true)}
      >
        <Search className="size-5" />
        <span className="sr-only">Search</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="overflow-hidden p-0 shadow-lg"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <SearchCommandContent onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Notifications Content (shared) ──────────────────────────────────────────

function NotificationsContent({ onClose }: { onClose?: () => void }) {
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <>
      <div className="flex flex-col w-full overflow-hidden">
        <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-satoshi tracking-widest text-sm uppercase font-bold text-black">
              Notifications
            </p>
            <p className="font-satoshi tracking-widest text-sm font-semibold text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="font-satoshi tracking-widest text-sm hover:text-foreground bg-sidebar-primary text-white font-semibold"
            >
              <Check strokeWidth={3} className="mr-1 h-3 w-3 font-bold" /> Mark
              all read
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {notifications.map((n, i) => (
            <React.Fragment key={n.id}>
              <div
                className={`flex w-full cursor-pointer gap-3 px-4 py-3 overflow-hidden transition-colors hover:bg-muted/50 ${n.unread ? "bg-sidebar-primary/5" : ""}`}
                onClick={() =>
                  setNotifications((prev) =>
                    prev.map((item) =>
                      item.id === n.id ? { ...item, unread: false } : item,
                    ),
                  )
                }
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/15">
                  <n.icon className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-satoshi text-sm font-bold leading-tight text-black tracking-widest">
                      {n.title}
                    </p>
                    {n.unread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-sidebar-primary" />
                    )}
                  </div>
                  <p className="font-satoshi text-sm font-semibold text-muted-foreground leading-snug">
                    {n.body}
                  </p>
                  <p className="font-satoshi text-xs font-semibold text-muted-foreground/70">
                    {n.time}
                  </p>
                </div>
              </div>
              {i < notifications.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
        <div className="shrink-0 border-t border-border px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full font-satoshi text-sm font-bold tracking-widest text-muted-foreground"
          >
            View all notifications
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Desktop Notifications Popover ───────────────────────────────────────────

function NotificationsPopover() {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-orange-400 data-[state=open]:bg-orange-400 cursor-pointer"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sidebar-primary p-0 text-xs text-white">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-96 p-0 flex flex-col max-h-[calc(100dvh-80px)]"
      >
        <NotificationsContent />
      </PopoverContent>
    </Popover>
  );
}

// ─── Settings Content (shared) ────────────────────────────────────────────────

function SettingsContent() {
  const [notifPrefs, setNotifPrefs] = React.useState({
    water: true,
    sleep: true,
    vitamins: true,
    skincare: false,
    insights: true,
  });

  return (
    <>
      <SheetHeader className="border-b border-border px-6 py-5">
        <SheetTitle className="font-satoshi text-lg font-bold tracking-wide uppercase text-black">
          Settings
        </SheetTitle>
        <p className="font-satoshi text-sm font-semibold text-muted-foreground tracking-wide">
          Personalize your ecosystem
        </p>
      </SheetHeader>
      <div className="space-y-0 divide-y divide-border">
        {/* Personal Profile */}
        <div className="px-6 py-5 space-y-3">
          <p className="font-satoshi text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Personal Profile
          </p>
          <div className="grid grid-cols-2 gap-3 text-black">
            {[
              { label: "Age", value: "28 years" },
              { label: "Weight", value: "68 kg" },
              { label: "Activity Level", value: "Moderate" },
              { label: "Water Target", value: "2.5 L/day" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-muted/30 px-3 py-2.5"
              >
                <p className="font-satoshi text-sm font-semibold tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="font-satoshi text-sm font-semibold mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full font-satoshi text-sm font-semibold rounded-xl tracking-widest text-white"
          >
            Edit Profile
          </Button>
        </div>
        {/* Ritual Timing */}
        <div className="px-6 py-5 space-y-3">
          <p className="font-satoshi text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Ritual Timing
          </p>
          <div className="space-y-2">
            {[
              { label: "Morning", value: "7:00 AM", icon: "🌅" },
              { label: "Post-Lunch", value: "1:30 PM", icon: "☀️" },
              { label: "Evening", value: "8:00 PM", icon: "🌙" },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center font-satoshi font-semibold text-black justify-between rounded-xl border border-border px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.icon}</span>
                  <span className="font-satoshi text-sm tracking-widest">
                    {t.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-satoshi text-sm">{t.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Notifications */}
        <div className="px-6 py-5 space-y-3">
          <p className="font-satoshi text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Notifications
          </p>
          <div className="space-y-2.5">
            {(Object.keys(notifPrefs) as (keyof typeof notifPrefs)[]).map(
              (key) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-black"
                >
                  <Label
                    htmlFor={`notif-${key}`}
                    className="font-satoshi text-sm font-semibold capitalize cursor-pointer tracking-widest"
                  >
                    {key === "insights" ? "AI Insights" : key}
                  </Label>
                  <Switch
                    id={`notif-${key}`}
                    checked={notifPrefs[key]}
                    onCheckedChange={(val) =>
                      setNotifPrefs((prev) => ({ ...prev, [key]: val }))
                    }
                  />
                </div>
              ),
            )}
          </div>
        </div>
        {/* Appearance */}
        <div className="px-6 py-5 space-y-3">
          <p className="font-satoshi text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Appearance
          </p>
          <div className="flex gap-2 text-white">
            {["Light", "Dark", "System"].map((mode) => (
              <Button
                key={mode}
                variant={mode === "System" ? "default" : "outline"}
                size="sm"
                className="flex-1 font-satoshi font-semibold text-sm rounded-xl tracking-widest"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
        {/* Integrations */}
        <div className="px-6 py-5 space-y-3">
          <p className="font-satoshi text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Integrations
          </p>
          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <SmartphoneNfc className="h-4 w-4 text-muted-foreground" />
              <span className="font-satoshi text-sm text-black font-semibold tracking-widest">
                Apple Health
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-satoshi text-sm rounded-lg h-7 font-bold text-white"
            >
              Connect
            </Button>
          </div>
        </div>
        {/* Data Management */}
        <div className="px-6 py-5 space-y-2">
          <p className="font-satoshi text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Data Management
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-satoshi font-semibold text-sm rounded-xl gap-1.5 text-white"
            >
              <Download className="h-3 w-3" /> Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 font-satoshi text-sm font-semibold rounded-xl gap-1.5 text-white"
            >
              <Download className="h-3 w-3" /> Export CSV
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Desktop Settings Sheet ───────────────────────────────────────────────────

function SettingsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-orange-400 data-[state=open]:bg-orange-400 cursor-pointer"
        >
          <Settings className="size-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-105 overflow-y-auto p-0 sm:max-w-105">
        <SettingsContent />
      </SheetContent>
    </Sheet>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  // Generate initials from name
  const name = session?.user?.name ?? "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const email = session?.user?.email ?? "";

  const handleLogout = async () => {
    setLoggingOut(true); // show overlay immediately
    await signOut(); // sign out in parallel
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200); // redirect after animation plays
  };

  return (
    <>
      {/* ── Logout overlay ─────────────────────────────── */}
      {loggingOut && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-full bg-sidebar-primary/20 animate-ping" />
              <div className="h-12 w-12 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="font-satoshi text-lg font-bold text-white">
                  B
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-satoshi text-sm font-semibold uppercase tracking-widest">
                Signing you out...
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full p-0 border-none"
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarFallback className="rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-satoshi text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-4 w-4 sm:hidden items-center justify-center rounded-full bg-sidebar-primary p-0 text-xs text-sidebar-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-0">
          {/* User info */}
          <div className="flex  items-center gap-3 px-4 py-3">
            <Avatar className="h-10 w-10 rounded-full ">
              <AvatarFallback className="rounded-full bg-sidebar-primary border-none text-sidebar-primary-foreground font-satoshi text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 ">
              <div className="flex items-center gap-1.5">
                <p className="font-satoshi text-sm font-semibold truncate">
                  {name}
                </p>
                <Crown className="h-3 w-3 shrink-0 text-amber-500" />
              </div>
              <p className="font-satoshi text-xs text-muted-foreground truncate">
                {email}
              </p>
              <Badge className="mt-0.5 h-4 rounded-full bg-amber-100 px-1.5 text-[10px] font-satoshi font-medium text-amber-700 hover:bg-amber-100">
                Premium · Level 12
              </Badge>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-border px-1 py-2">
            {[
              { label: "Streak", value: "13d" },
              { label: "Entries", value: "247" },
              { label: "Score", value: "94%" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-1">
                <span className="font-satoshi text-sm font-semibold">
                  {s.value}
                </span>
                <span className="font-satoshi text-[10px] text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Mobile-only: Notifications & Settings */}
          <DropdownMenuGroup className="p-1 sm:hidden">
            <DropdownMenuItem
              className="gap-2 rounded-lg font-satoshi text-sm"
              onSelect={() => setNotifOpen(true)}
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-auto h-4 w-4 rounded-full bg-sidebar-primary p-0 text-[10px] text-sidebar-primary-foreground flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 rounded-lg font-satoshi text-sm"
              onSelect={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="sm:hidden" />

          {/* Always visible */}
          <DropdownMenuGroup className="p-1">
            <DropdownMenuItem className="gap-2 rounded-lg font-satoshi text-sm">
              <User className="h-4 w-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 rounded-lg font-satoshi text-sm">
              <Crown className="h-4 w-4 text-amber-500" /> Membership & Billing
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 rounded-lg font-satoshi text-sm">
              <Palette className="h-4 w-4" /> Appearance
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout */}
          <div className="px-1 pb-2">
            <DropdownMenuItem
              className="gap-2 rounded-lg font-satoshi text-sm text-destructive focus:text-destructive cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="h-4 w-4 " />{" "}
              <span className="text-destructive">Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile Notifications Drawer */}
      <Drawer open={notifOpen} onOpenChange={setNotifOpen}>
        <DrawerContent className="flex flex-col overflow-hidden h-[60dvh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle className="font-satoshi tracking-widest text-black">
              Notifications
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col w-full overflow-hidden">
            <NotificationsContent onClose={() => setNotifOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile Settings Drawer — replaces Sheet */}
      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent className="flex flex-col overflow-hidden h-[92dvh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Settings</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <SettingsContent />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

export function TopBar() {
  const { toggleSidebar } = useSidebar();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const todayShort = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center  bg-black px-3 backdrop-blur-sm sm:h-16 sm:px-6">
      {/* ── LEFT: Menu toggle + Title ── */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {" "}
        {/* ← flex-1 here */}
        <Button
          variant="ghost"
          size="icon"
          color="#FFFFE4"
          className="h-9 w-9 shrink-0 text-[#FFFFE4] rounded-full hover:bg-orange-400 cursor-pointer"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
        </Button>
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-[#FFFFE4] font-satoshi capitalize text-lg sm:text-2xl font-medium tracking-wide leading-tight truncate">
            Daily Command Center
          </h1>
          <p className="font-satoshi text-xs uppercase tracking-widest text-muted-foreground sm:hidden">
            {todayShort}
          </p>
          <p className="hidden font-satoshi font-bold text-sm uppercase tracking-widest text-muted-foreground sm:block">
            {today}
          </p>
        </div>
      </div>

      {/* RIGHT: Search, Notifications, Settings, Profile */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <div className="lg:hidden">
          <MobileSearch />
        </div>
        <div className="hidden lg:block">
          <SearchDialog />
        </div>

        <div className="hidden sm:flex sm:items-center sm:gap-1">
          <Separator orientation="vertical" className="mx-1" />
          <NotificationsPopover />
          <SettingsSheet />
        </div>

        <Separator orientation="vertical" className="mx-1" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
