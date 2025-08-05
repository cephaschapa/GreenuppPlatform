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
  Activity,
} from "lucide-react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "./AdminNav";
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

  // Get the role-based base path for the current user
  const getRoleBasePath = () => {
    if (!user) return "";
    const userId = user.id.toString();

    if (user.role === UserRole.FARMER) return `/farmer/${userId}`;
    if (user.role === UserRole.BUYER) return `/buyer/${userId}`;
    if (user.role === UserRole.SUPPLIER || user.role === "seller")
      return `/seller/${userId}`;

    return "";
  };

  const basePath = getRoleBasePath();

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
      href: `${basePath}/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
      mobileIcon: <Home className="h-6 w-6" />,
      active: location === `${basePath}/dashboard` || location === basePath,
      showInMobileNav: true,
    },
    {
      title: "Fields & Crops",
      href: `${basePath}/fields`,
      icon: <TractorIcon className="h-5 w-5" />,
      mobileIcon: <TractorIcon className="h-6 w-6" />,
      active: location === `${basePath}/fields`,
      showInMobileNav: false,
    },
    {
      title: "Tasks",
      href: `${basePath}/tasks`,
      icon: <ClipboardList className="h-5 w-5" />,
      mobileIcon: <ClipboardList className="h-6 w-6" />,
      active: location === `${basePath}/tasks`,
      showInMobileNav: false,
    },
    {
      title: "Weather",
      href: `${basePath}/weather`,
      icon: <Cloud className="h-5 w-5" />,
      mobileIcon: <Cloud className="h-6 w-6" />,
      active: location === `${basePath}/weather`,
      showInMobileNav: true,
    },
    {
      title: "Diagnose",
      href: `${basePath}/diagnose`,
      icon: <Sprout className="h-5 w-5" />,
      mobileIcon: <Sprout className="h-6 w-6" />,
      active: location === `${basePath}/diagnose`,
      showInMobileNav: true,
    },
    {
      title: "Product Verification",
      href: `${basePath}/verification`,
      icon: <ShieldCheck className="h-5 w-5" />,
      mobileIcon: <ShieldCheck className="h-6 w-6" />,
      active: location === `${basePath}/verification`,
      showInMobileNav: true,
    },
    {
      title: "Shop",
      href: `${basePath}/marketplace`,
      icon: <ShoppingBag className="h-5 w-5" />,
      mobileIcon: <ShoppingBag className="h-6 w-6" />,
      active: location.startsWith(`${basePath}/marketplace`),
      showInMobileNav: true,
      subItems: [
        {
          title: "All Products",
          href: `${basePath}/marketplace`,
          active: location === `${basePath}/marketplace`,
        },
        {
          title: "Orders",
          href: `${basePath}/orders`,
          active: location === `${basePath}/orders`,
        },
        {
          title: "Inventory",
          href: `${basePath}/inventory`,
          active: location === `${basePath}/inventory`,
        },
        {
          title: "Expert Directory",
          href: `${basePath}/experts`,
          active: location === `${basePath}/experts`,
        },
        {
          title: "Dealer Directory",
          href: `${basePath}/dealers`,
          active: location === `${basePath}/dealers`,
        },
      ],
    },
    {
      title: "Predictions",
      href: `${basePath}/predictions`,
      icon: <Sparkles className="h-5 w-5" />,
      mobileIcon: <Sparkles className="h-6 w-6" />,
      active: location === `${basePath}/predictions`,
      showInMobileNav: false,
    },
    {
      title: "Profile",
      href: `${basePath}/profile`,
      icon: <User className="h-5 w-5" />,
      mobileIcon: <User className="h-6 w-6" />,
      active: location === `${basePath}/profile`,
      showInMobileNav: false,
    },
    {
      title: "Settings",
      href: `${basePath}/settings`,
      icon: <Settings className="h-5 w-5" />,
      mobileIcon: <Settings className="h-6 w-6" />,
      active:
        location === `${basePath}/settings` ||
        location === `${basePath}/security`,
      showInMobileNav: false,
      subItems: [
        {
          title: "General Settings",
          href: `${basePath}/settings`,
          active: location === `${basePath}/settings`,
        },
        {
          title: "Security Settings",
          href: `${basePath}/security`,
          active: location === `${basePath}/security`,
        },
      ],
    },
    {
      title: "Socials",
      href: `${basePath}/social`,
      icon: <Users className="h-5 w-5" />,
      mobileIcon: <Users className="h-6 w-6" />,
      active: location === `${basePath}/social`,
      showInMobileNav: true,
    },
    {
      title: "Stream Chat",
      href: `${basePath}/chat`,
      icon: <MessageSquare className="h-5 w-5" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />,
      active: location === `${basePath}/chat`,
      showInMobileNav: true,
    },
    {
      title: "AI Farming Assistant",
      href: `${basePath}/assistant`,
      icon: <Brain className="h-5 w-5" />,
      mobileIcon: <Brain className="h-6 w-6" />,
      active: location === `${basePath}/assistant`,
      showInMobileNav: true,
    },
    {
      title: "System Health",
      href: "/system-health",
      icon: <Activity className="h-5 w-5" />,
      mobileIcon: <Activity className="h-6 w-6" />,
      active: location === "/system-health",
      showInMobileNav: false,
    },
  ];

  const supplierNavItems = [
    {
      title: "Overview",
      href: `${basePath}/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
      mobileIcon: <Home className="h-6 w-6" />,
      active: location === `${basePath}/dashboard` || location === basePath,
      showInMobileNav: true,
    },
    {
      title: "Products",
      href: `${basePath}/products`,
      icon: <ShoppingBag className="h-5 w-5" />,
      mobileIcon: <ShoppingBag className="h-6 w-6" />,
      active: location.startsWith(`${basePath}/products`),
      showInMobileNav: true,
      subItems: [
        {
          title: "All Products",
          href: `${basePath}/products`,
          active: location === `${basePath}/products`,
        },
        {
          title: "Add New Product",
          href: `${basePath}/products/new`,
          active: location === `${basePath}/products/new`,
        },
      ],
    },
    {
      title: "Orders",
      href: `${basePath}/orders`,
      icon: <ClipboardList className="h-5 w-5" />,
      mobileIcon: <ClipboardList className="h-6 w-6" />,
      active: location === `${basePath}/orders`,
      showInMobileNav: true,
    },
    {
      title: "Inventory",
      href: `${basePath}/inventory`,
      icon: <Grid className="h-5 w-5" />,
      mobileIcon: <Grid className="h-6 w-6" />,
      active: location === `${basePath}/inventory`,
      showInMobileNav: true,
    },
    {
      title: "Verify Products",
      href: `${basePath}/verification`,
      icon: <ShieldCheck className="h-5 w-5" />,
      mobileIcon: <ShieldCheck className="h-6 w-6" />,
      active: location === `${basePath}/verification`,
      showInMobileNav: false,
    },
    {
      title: "Green Socials",
      href: `${basePath}/social`,
      icon: <Users className="h-5 w-5" />,
      mobileIcon: <Users className="h-6 w-6" />,
      active: location === `${basePath}/social`,
      showInMobileNav: true,
    },
    {
      title: "Stream Chat",
      href: `${basePath}/chat`,
      icon: <MessageSquare className="h-5 w-5" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />,
      active: location === `${basePath}/chat`,
      showInMobileNav: true,
    },
    {
      title: "Farming Assistant",
      href: `${basePath}/assistant`,
      icon: <Brain className="h-5 w-5" />,
      mobileIcon: <Brain className="h-6 w-6" />,
      active: location === `${basePath}/assistant`,
      showInMobileNav: true,
    },
    // Add more supplier-specific navigation items here
  ];

  const buyerNavItems = [
    {
      title: "Overview",
      href: `${basePath}/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
      mobileIcon: <Home className="h-6 w-6" />,
      active: location === `${basePath}/dashboard` || location === basePath,
      showInMobileNav: true,
    },
    {
      title: "Marketplace",
      href: `${basePath}/marketplace`,
      icon: <ShoppingBag className="h-5 w-5" />,
      mobileIcon: <ShoppingBag className="h-6 w-6" />,
      active: location.startsWith(`${basePath}/marketplace`),
      showInMobileNav: true,
      subItems: [
        {
          title: "Browse Products",
          href: `${basePath}/marketplace`,
          active: location === `${basePath}/marketplace`,
        },
        {
          title: "Shopping Cart",
          href: `${basePath}/marketplace/cart`,
          active: location === `${basePath}/marketplace/cart`,
        },
      ],
    },
    {
      title: "Orders",
      href: `${basePath}/orders`,
      icon: <ClipboardList className="h-5 w-5" />,
      mobileIcon: <ClipboardList className="h-6 w-6" />,
      active: location === `${basePath}/orders`,
      showInMobileNav: true,
    },
    {
      title: "Verify Products",
      href: `${basePath}/verification`,
      icon: <ShieldCheck className="h-5 w-5" />,
      mobileIcon: <ShieldCheck className="h-6 w-6" />,
      active: location === `${basePath}/verification`,
      showInMobileNav: false,
    },
    {
      title: "Green Socials",
      href: `${basePath}/social`,
      icon: <Users className="h-5 w-5" />,
      mobileIcon: <Users className="h-6 w-6" />,
      active: location === `${basePath}/social`,
      showInMobileNav: true,
    },
    {
      title: "Stream Chat",
      href: `${basePath}/chat`,
      icon: <MessageSquare className="h-5 w-5" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />,
      active: location === `${basePath}/chat`,
      showInMobileNav: true,
    },
    {
      title: "AI Farming Assistant",
      href: `${basePath}/assistant`,
      icon: <Brain className="h-5 w-5" />,
      mobileIcon: <Brain className="h-6 w-6" />,
      active: location === `${basePath}/assistant`,
      showInMobileNav: true,
    },
    // Add more buyer-specific navigation items here
  ];

  // Function to rewrite URLs for subdomain - now simplified since we use role-based paths
  const getPathForSubdomain = (path: string): string => {
    if (!isAppSubdomain) return path; // Keep as is for main domain

    // For app subdomain, if path starts with role-based structure, simplify it
    if (path.startsWith(`/farmer/${user?.id}/`)) {
      return path.replace(`/farmer/${user?.id}`, "");
    }
    if (path.startsWith(`/buyer/${user?.id}/`)) {
      return path.replace(`/buyer/${user?.id}`, "");
    }
    if (path.startsWith(`/seller/${user?.id}/`)) {
      return path.replace(`/seller/${user?.id}`, "");
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
      case "seller": // Handle both supplier and seller roles
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

            {/* Admin Navigation */}
            <AdminNav className="mt-6" />
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
