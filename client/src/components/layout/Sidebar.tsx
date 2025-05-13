import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
// Import for NotificationBell, useCart, and useNotifications removed as they're now in TopNavbar
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
  ShoppingCart,
  ShieldCheck,
  Users,
  Grid,
  Brain,
  MessageSquare,
} from "lucide-react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";
import { CartIcon } from "@/components/cart/CartIcon";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { totalUnreadCount: chatUnreadCount } = useChat();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppSubdomain, setIsAppSubdomain] = useState(false);

  useEffect(() => {
    // Check if we're on app subdomain
    setIsAppSubdomain(window.location.hostname.startsWith("app."));
  }, []);

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
      showInMobileNav: false,
    },
    {
      title: "Tasks",
      href: "/dashboard/tasks",
      icon: <ClipboardList className="h-5 w-5" />,
      mobileIcon: <ClipboardList className="h-6 w-6" />,
      active: location === "/dashboard/tasks",
      showInMobileNav: false,
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
      title: "Diagnose",
      href: "/dashboard/plant-diagnosis",
      icon: <Sprout className="h-5 w-5" />,
      mobileIcon: <Sprout className="h-6 w-6" />,
      active: location === "/dashboard/plant-diagnosis",
      showInMobileNav: true,
    },
    {
      title: "Shop",
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
    // {
    //   title: "Calendar",
    //   href: "/dashboard/calendar",
    //   icon: <CalendarDays className="h-5 w-5" />,
    //   mobileIcon: <CalendarDays className="h-6 w-6" />,
    //   active: location === "/dashboard/calendar",
    //   showInMobileNav: false,
    // },
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
    {
      title: "Verify Products",
      href: "/trace",
      icon: <ShieldCheck className="h-5 w-5" />,
      mobileIcon: <ShieldCheck className="h-6 w-6" />,
      active: location === "/trace",
      showInMobileNav: false,
    },
    {
      title: "AI Knowledge Base",
      href: "/ai-knowledge-base",
      icon: <Sparkles className="h-5 w-5" />,
      mobileIcon: <Sparkles className="h-6 w-6" />,
      active: location === "/ai-knowledge-base",
      showInMobileNav: false,
    },
    {
      title: "Socials",
      href: "/dashboard/social",
      icon: <Users className="h-5 w-5" />,
      mobileIcon: <Users className="h-6 w-6" />,
      active: location === "/dashboard/social",
      showInMobileNav: true,
    },
    {
      title: "Stream Chat",
      href: "/dashboard/stream-chat",
      icon: <MessageSquare className="h-5 w-5" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />,
      active: location === "/dashboard/stream-chat",
      showInMobileNav: true,
    },
    {
      title: "AI Farming Assistant",
      href: "/dashboard/farming-assistant",
      icon: <Brain className="h-5 w-5" />,
      mobileIcon: <Brain className="h-6 w-6" />,
      active: location === "/dashboard/farming-assistant",
      showInMobileNav: true,
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
    {
      title: "Verify Products",
      href: "/trace",
      icon: <ShieldCheck className="h-5 w-5" />,
      mobileIcon: <ShieldCheck className="h-6 w-6" />,
      active: location === "/trace",
      showInMobileNav: false,
    },
    {
      title: "AI Knowledge Base",
      href: "/ai-knowledge-base",
      icon: <Sparkles className="h-5 w-5" />,
      mobileIcon: <Sparkles className="h-6 w-6" />,
      active: location === "/ai-knowledge-base",
      showInMobileNav: false,
    },
    {
      title: "Green Socials",
      href: "/dashboard/social",
      icon: <Users className="h-5 w-5" />,
      mobileIcon: <Users className="h-6 w-6" />,
      active: location === "/dashboard/social",
      showInMobileNav: true,
    },
    {
      title: "Stream Chat",
      href: "/dashboard/stream-chat",
      icon: <MessageSquare className="h-5 w-5" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />,
      active: location === "/dashboard/stream-chat",
      showInMobileNav: true,
    },
    {
      title: "Farming Assistant",
      href: "/dashboard/farming-assistant",
      icon: <Brain className="h-5 w-5" />,
      mobileIcon: <Brain className="h-6 w-6" />,
      active: location === "/dashboard/farming-assistant",
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
    {
      title: "Verify Products",
      href: "/trace",
      icon: <ShieldCheck className="h-5 w-5" />,
      mobileIcon: <ShieldCheck className="h-6 w-6" />,
      active: location === "/trace",
      showInMobileNav: false,
    },
    {
      title: "AI Knowledge Base",
      href: "/ai-knowledge-base",
      icon: <Sparkles className="h-5 w-5" />,
      mobileIcon: <Sparkles className="h-6 w-6" />,
      active: location === "/ai-knowledge-base",
      showInMobileNav: false,
    },
    {
      title: "Green Socials",
      href: "/dashboard/social",
      icon: <Users className="h-5 w-5" />,
      mobileIcon: <Users className="h-6 w-6" />,
      active: location === "/dashboard/social",
      showInMobileNav: true,
    },
    {
      title: "Stream Chat",
      href: "/dashboard/stream-chat",
      icon: <MessageSquare className="h-5 w-5" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />,
      active: location === "/dashboard/stream-chat",
      showInMobileNav: true,
    },
    {
      title: "AI Farming Assistant",
      href: "/dashboard/farming-assistant",
      icon: <Brain className="h-5 w-5" />,
      mobileIcon: <Brain className="h-6 w-6" />,
      active: location === "/dashboard/farming-assistant",
      showInMobileNav: true,
    },
    // Add more buyer-specific navigation items here
  ];

  // Function to rewrite URLs for subdomain
  const getPathForSubdomain = (path: string): string => {
    if (!isAppSubdomain) return path; // Keep as is for main domain

    // For app subdomain, remove '/dashboard' prefix
    if (path.startsWith("/dashboard")) {
      return path === "/dashboard" ? "/" : path.replace("/dashboard/", "/");
    }

    return path; // Keep paths like /trace and /ai-knowledge-base as is
  };

  // Define nav item type
  type NavItem = {
    title: string;
    href: string;
    icon: React.ReactNode;
    mobileIcon: React.ReactNode;
    active: boolean;
    showInMobileNav: boolean;
  };

  // Create modified nav items for the current subdomain
  const createSubdomainNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      // Create new path based on subdomain
      const newPath = getPathForSubdomain(item.href);

      // Create new active check based on subdomain paths
      // We need to check both the original and new paths to handle initial render
      const newActive = isAppSubdomain
        ? newPath === location || item.href === location
        : item.active;

      // For paths that start with /dashboard/xyz, also check for /xyz on app subdomain
      const isNestedPath =
        item.href.startsWith("/dashboard/") && isAppSubdomain;
      const appEquivalentPath = isNestedPath
        ? item.href.replace("/dashboard", "")
        : "";
      const activePath = isNestedPath
        ? location === appEquivalentPath || location === item.href || newActive
        : newActive;

      return {
        ...item,
        href: newPath,
        active: activePath,
      };
    });
  };

  // Select the appropriate navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    let items: NavItem[] = [];
    switch (user.role) {
      case UserRole.FARMER:
        items = farmerNavItems;
        break;
      case UserRole.SUPPLIER:
        items = supplierNavItems;
        break;
      case UserRole.BUYER:
        items = buyerNavItems;
        break;
      default:
        items = [];
    }

    // Apply subdomain-specific path adjustments
    return createSubdomainNavItems(items);
  };

  const navItems = getNavItems();
  const mobileNavItems = navItems.filter((item) => item.showInMobileNav);

  return (
    <>
      {/* Mobile Status Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-sidebar text-sidebar-foreground border-b border-primary/20 flex items-center justify-between px-4 safe-top">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href={isAppSubdomain ? "/" : "/dashboard"}
            className="flex items-center"
          >
            <img src={greenuppLogo} alt="Greenupp Logo" className="h-8" />
            <span className="absolute -top-1 -right-10 text-slate-600 text-[10px] px-1 py-0.5 rounded-full font-semibold">
              BETA
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Cart and notification functions moved to TopNavbar */}
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
                  href={isAppSubdomain ? "/profile" : "/dashboard/profile"}
                  className="cursor-pointer w-full"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={isAppSubdomain ? "/settings" : "/dashboard/settings"}
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-24 bg-sidebar text-sidebar-foreground border-t border-primary/20 flex items-center justify-around px-1 safe-bottom">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full px-1 relative",
              item.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.title === "Chat" && chatUnreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
              >
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </Badge>
            )}
            {/* Social notifications moved to top navbar */}
            {item.mobileIcon}
            <span className="text-xs line-clamp-1 text-center max-w-[70px]">
              {item.title}
            </span>
          </Link>
        ))}

        {/* Mobile Side Navigation */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ animationDuration: "0.25s" }}
          >
            <div
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-sidebar border-l border-primary/20 shadow-xl p-4 overflow-y-auto safe-top safe-bottom flex flex-col h-screen animate-slide-in-right"
              onClick={(e) => e.stopPropagation()}
              style={{ animationDuration: "0.3s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-1 pb-6">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-2 py-2 rounded-md transition-colors animate-scale-in",
                        item.active
                          ? "bg-primary/20 text-primary"
                          : "text-foreground hover:bg-primary/10",
                      )}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      {item.title === "Chat" && chatUnreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                        >
                          {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                        </Badge>
                      )}
                      {/* Social notifications moved to top navbar */}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2 animate-fade-in"
                  style={{ animationDelay: "0.5s" }}
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen flex-col bg-sidebar text-sidebar-foreground border-r border-primary/20 w-64 fixed top-0 left-0">
        <div className="p-6">
          <Link href="/" className="group flex items-center relative">
            <img
              src={greenuppLogo}
              alt="Greenupp Logo"
              className="h-10 group-hover:opacity-90 transition-opacity"
            />
            <span className="absolute -top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-semibold">
              BETA
            </span>
          </Link>
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
                <div className="flex items-center">
                  {item.title === "Chat" && chatUnreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 mr-1 flex items-center justify-center p-0 text-[10px] rounded-full"
                    >
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </Badge>
                  )}
                  {item.title === "Socials" && notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 mr-1 flex items-center justify-center p-0 text-[10px] rounded-full"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 opacity-0 transition-opacity",
                      item.active && "opacity-100",
                    )}
                  />
                </div>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-primary/20">
          {/* Build version - using import.meta.env for Vite */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Build: v1.0.0
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
