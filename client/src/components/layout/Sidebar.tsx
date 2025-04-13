import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  TractorIcon,
  CalendarDays,
  ClipboardList,
  Cloud,
  Sparkles,
  Settings,
  User,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  Home,
  MoreHorizontal,
  Sprout,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const farmerNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      mobileIcon: <Home className="h-6 w-6" />,
      active: location === "/dashboard",
      showInMobileNav: true,
    },
    {
      title: "Fields & Crops",
      href: "/dashboard/fields",
      icon: <TractorIcon className="h-5 w-5" />,
      mobileIcon: <TractorIcon className="h-6 w-6" />,
      active: location === "/dashboard/fields",
      showInMobileNav: true,
    },
    {
      title: "Tasks",
      href: "/dashboard/tasks",
      icon: <ClipboardList className="h-5 w-5" />,
      mobileIcon: <ClipboardList className="h-6 w-6" />,
      active: location === "/dashboard/tasks",
      showInMobileNav: true,
    },
    {
      title: "Weather",
      href: "/dashboard/weather",
      icon: <Cloud className="h-5 w-5" />,
      mobileIcon: <Cloud className="h-6 w-6" />,
      active: location === "/dashboard/weather",
      showInMobileNav: true,
    },
    {
      title: "Plant Diagnosis",
      href: "/dashboard/plant-diagnosis",
      icon: <Sprout className="h-5 w-5" />,
      mobileIcon: <Sprout className="h-6 w-6" />,
      active: location === "/dashboard/plant-diagnosis",
      showInMobileNav: false,
    },
    {
      title: "Marketplace",
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      mobileIcon: <ShoppingBag className="h-6 w-6" />,
      active: location.startsWith("/dashboard/marketplace"),
      showInMobileNav: true,
    },
    {
      title: "Predictions",
      href: "/dashboard/predictions",
      icon: <Sparkles className="h-5 w-5" />,
      mobileIcon: <Sparkles className="h-6 w-6" />,
      active: location === "/dashboard/predictions",
      showInMobileNav: false,
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: <CalendarDays className="h-5 w-5" />,
      mobileIcon: <CalendarDays className="h-6 w-6" />,
      active: location === "/dashboard/calendar",
      showInMobileNav: false,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
      mobileIcon: <User className="h-6 w-6" />,
      active: location === "/dashboard/profile",
      showInMobileNav: false,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      mobileIcon: <Settings className="h-6 w-6" />,
      active: location === "/dashboard/settings",
      showInMobileNav: false,
    },
  ];

  const supplierNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      mobileIcon: <Home className="h-6 w-6" />,
      active: location === "/dashboard",
      showInMobileNav: true,
    },
    {
      title: "Marketplace",
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      mobileIcon: <ShoppingBag className="h-6 w-6" />,
      active: location.startsWith("/dashboard/marketplace"),
      showInMobileNav: true,
    },
    // Add more supplier-specific navigation items here
  ];

  const buyerNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      mobileIcon: <Home className="h-6 w-6" />,
      active: location === "/dashboard",
      showInMobileNav: true,
    },
    {
      title: "Marketplace",
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      mobileIcon: <ShoppingBag className="h-6 w-6" />,
      active: location.startsWith("/dashboard/marketplace"),
      showInMobileNav: true,
    },
    // Add more buyer-specific navigation items here
  ];

  // Select the appropriate navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.FARMER:
        return farmerNavItems;
      case UserRole.SUPPLIER:
        return supplierNavItems;
      case UserRole.BUYER:
        return buyerNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const mobileNavItems = navItems.filter((item) => item.showInMobileNav);

  return (
    <>
      {/* Mobile Status Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-sidebar-background text-sidebar-foreground border-b border-primary/20 flex items-center justify-between px-4 safe-top">
        <Logo size="sm" href="/dashboard" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarFallback className="text-sm bg-primary/20 text-primary">
                    {(user && (user.firstName?.[0] || user.username?.[0])) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="cursor-pointer w-full"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="cursor-pointer w-full"
                >
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-24 bg-sidebar-background text-sidebar-foreground border-t border-primary/20 flex items-center justify-around px-1 safe-bottom">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full px-1",
              item.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.mobileIcon}
            <span className="text-xs line-clamp-1 text-center max-w-[70px]">
              {item.title}
            </span>
          </Link>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col items-center mt-2 justify-center gap-1 w-full h-full rounded-none text-muted-foreground"
            >
              <MoreHorizontal className="h-6 w-6" />
              <span className="text-xs">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 mr-2 mb-2 rounded-xl bg-sidebar-background border border-primary/20 shadow-lg shadow-primary/5">
            <DropdownMenuLabel className="text-sidebar-foreground">
              More Features
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />

            {navItems
              .filter((item) => !item.showInMobileNav)
              .map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "cursor-pointer w-full focus:bg-primary/10 focus:text-sidebar-foreground",
                      item.active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3 py-1">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen flex-col bg-sidebar-background text-sidebar-foreground border-r border-primary/20 w-64 fixed top-0 left-0">
        <div className="p-6 flex items-center justify-between">
          <Logo size="md" href="/" />
          
          <ThemeToggle />
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md transition-colors",
                  item.active
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-primary/10",
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 opacity-0 transition-opacity",
                    item.active && "opacity-100",
                  )}
                />
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-primary/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary/20 text-primary">
                {(user && (user.firstName?.[0] || user.username?.[0])) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName || user?.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {user && user.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "User"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 text-muted-foreground hover:text-sidebar-foreground"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </>
  );
}
