import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
  ChevronDown,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppSubdomain, setIsAppSubdomain] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  // Temporarily using 0 as notification count was moved to TopNavbar
  const notificationCount = 0;

  useEffect(() => {
    // Check if we're on app subdomain
    setIsAppSubdomain(window.location.hostname.startsWith("app."));
  }, []);

  // Toggle expanded state for items with submenus
  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemTitle)) {
        newSet.delete(itemTitle);
      } else {
        newSet.add(itemTitle);
      }
      return newSet;
    });
  };

  // Check if an item should be expanded by default
  const shouldBeExpanded = (item: NavItem) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => subItem.active);
  };

  // Initialize expanded items based on active subitems
  useEffect(() => {
    const newExpandedItems = new Set<string>();
    const currentNavItems = getNavItems();
    currentNavItems.forEach((item) => {
      if (shouldBeExpanded(item)) {
        newExpandedItems.add(item.title);
      }
    });
    setExpandedItems(newExpandedItems);
  }, [location]);

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
      subItems: [
        {
          title: "All Products",
          href: "/dashboard/marketplace",
          active: location === "/dashboard/marketplace",
        },
        {
          title: "Orders",
          href: "/dashboard/orders",
          active: location === "/dashboard/orders",
        },
        {
          title: "Inventory",
          href: "/dashboard/inventory",
          active: location === "/dashboard/inventory",
        },
        {
          title: "Expert Directory",
          href: "/dashboard/experts",
          active: location === "/dashboard/experts",
        },
        {
          title: "Dealer Directory",
          href: "/dashboard/dealers",
          active: location === "/dashboard/dealers",
        },
      ],
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
    subItems?: {
      title: string;
      href: string;
      active: boolean;
    }[];
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
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen flex-col bg-sidebar text-sidebar-foreground border-r border-primary/20 w-64 fixed top-0 left-0">
        <div className="p-6">
          <Link href="/" className="group flex items-center relative">
            <img
              src={greenuppLogo}
              alt="Greenupp Logo"
              className="h-10 group-hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <div key={item.href}>
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer",
                    item.active
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-primary/10"
                  )}
                  onClick={() => {
                    if (item.subItems) {
                      toggleExpanded(item.title);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 flex-1"
                    onClick={(e) => {
                      if (item.subItems) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                  <div className="flex items-center">
                    {item.subItems && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.title);
                        }}
                      >
                        {expandedItems.has(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {!item.subItems && (
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 opacity-0 transition-opacity",
                          item.active && "opacity-100"
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Submenu items */}
                {item.subItems && expandedItems.has(item.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md transition-colors text-sm",
                          subItem.active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-primary/5"
                        )}
                      >
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-primary/20">
          {/* Build version - using import.meta.env for Vite */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Build: v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
