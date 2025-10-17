import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  BarChart3,
  SquareDashedBottom,
} from "lucide-react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format large numbers
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
};

export function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch social profile data for follower/following counts
  const { data: socialProfile } = useQuery({
    queryKey: ["/api/social/profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await fetch(`/api/social/profile/${user.id}`);
        if (!response.ok) {
          // Profile might not exist yet, return defaults
          if (response.status === 404) {
            return { followerCount: 0, followingCount: 0 };
          }
          throw new Error("Failed to fetch social profile");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching social profile:", error);
        return { followerCount: 0, followingCount: 0 };
      }
    },
    enabled: !!user?.id,
    staleTime: 60000, // Cache for 1 minute
  });

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

  // Get navigation items based on user role
  const getNavItems = () => {
    if (user?.role === UserRole.SUPPLIER) {
      return [
        {
          title: "Overview",
          href: "/dashboard",
          icon: <SquareDashedBottom className="h-5 w-5" />,
          active: location === "/dashboard",
        },
        {
          title: "Fields & Crops",
          href: "/dashboard/fields",
          icon: <TractorIcon className="h-5 w-5" />,
          active: location === "/dashboard/fields",
        },
        {
          title: "Tasks",
          href: "/dashboard/tasks",
          icon: <ClipboardList className="h-5 w-5" />,
          active: location === "/dashboard/tasks",
        },
        {
          title: "Marketplace Manager",
          icon: <ShoppingBag className="h-5 w-5" />,
          expandable: true,
          children: [
            {
              title: "Orders",
              href: "/dashboard/orders",
              icon: <ShoppingCart className="h-5 w-5" />,
              active: location === "/dashboard/orders",
            },
            {
              title: "Inventory",
              href: "/dashboard/inventory",
              icon: <Grid className="h-5 w-5" />,
              active: location === "/dashboard/inventory",
            },
            {
              title: "Dealer Directory",
              href: "/dashboard/dealers",
              icon: <ShoppingBag className="h-5 w-5" />,
              active: location === "/dashboard/dealers",
            },
          ],
        },
        {
          title: "Expert Directory",
          href: "/dashboard/experts",
          icon: <Users className="h-5 w-5" />,
          active: location === "/dashboard/experts",
        },
        {
          title: "Predictions",
          href: "/dashboard/predictions",
          icon: <Sparkles className="h-5 w-5" />,
          active: location === "/dashboard/predictions",
        },
        {
          title: "AI Farming Assistant",
          href: "/dashboard/farming-assistant",
          icon: <Brain className="h-5 w-5" />,
          active: location === "/dashboard/farming-assistant",
        },
        {
          title: "Stream Chat",
          href: "/dashboard/stream-chat",
          icon: <MessageSquare className="h-5 w-5" />,
          active: location === "/dashboard/stream-chat",
        },
        {
          title: "Verify Products",
          href: "/trace",
          icon: <ShieldCheck className="h-5 w-5" />,
          active: location === "/trace",
        },
        {
          title: "Profile",
          href: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
          active: location === "/dashboard/profile",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
          active: location === "/dashboard/settings",
        },
      ];
    } else if (user?.role === UserRole.BUYER) {
      return [
        {
          title: "Marketplace Manager",
          icon: <ShoppingBag className="h-5 w-5" />,
          expandable: true,
          children: [
            {
              title: "Orders",
              href: "/dashboard/orders",
              icon: <ShoppingCart className="h-5 w-5" />,
              active: location === "/dashboard/orders",
            },
            {
              title: "Dealer Directory",
              href: "/dashboard/dealers",
              icon: <ShoppingBag className="h-5 w-5" />,
              active: location === "/dashboard/dealers",
            },
          ],
        },
        {
          title: "Expert Directory",
          href: "/dashboard/experts",
          icon: <Users className="h-5 w-5" />,
          active: location === "/dashboard/experts",
        },
        {
          title: "AI Farming Assistant",
          href: "/dashboard/farming-assistant",
          icon: <Brain className="h-5 w-5" />,
          active: location === "/dashboard/farming-assistant",
        },
        {
          title: "Stream Chat",
          href: "/dashboard/stream-chat",
          icon: <MessageSquare className="h-5 w-5" />,
          active: location === "/dashboard/stream-chat",
        },
        {
          title: "Verify Products",
          href: "/trace",
          icon: <ShieldCheck className="h-5 w-5" />,
          active: location === "/trace",
        },
        {
          title: "Profile",
          href: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
          active: location === "/dashboard/profile",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
          active: location === "/dashboard/settings",
        },
      ];
    } else {
      // Default farmer navigation
      return [
        {
          title: "Overview",
          href: "/dashboard",
          icon: <SquareDashedBottom className="h-5 w-5" />,
          active: location === "/dashboard",
        },
        {
          title: "Fields & Crops",
          href: "/dashboard/fields",
          icon: <TractorIcon className="h-5 w-5" />,
          active: location === "/dashboard/fields",
        },
        {
          title: "Tasks",
          href: "/dashboard/tasks",
          icon: <ClipboardList className="h-5 w-5" />,
          active: location === "/dashboard/tasks",
        },
        {
          title: "Marketplace Manager",
          icon: <ShoppingBag className="h-5 w-5" />,
          expandable: true,
          children: [
            {
              title: "Orders",
              href: "/dashboard/orders",
              icon: <ShoppingCart className="h-5 w-5" />,
              active: location === "/dashboard/orders",
            },
            {
              title: "Inventory",
              href: "/dashboard/inventory",
              icon: <Grid className="h-5 w-5" />,
              active: location === "/dashboard/inventory",
            },
            {
              title: "Dealer Directory",
              href: "/dashboard/dealers",
              icon: <ShoppingBag className="h-5 w-5" />,
              active: location === "/dashboard/dealers",
            },
          ],
        },
        {
          title: "Expert Directory",
          href: "/dashboard/experts",
          icon: <Users className="h-5 w-5" />,
          active: location === "/dashboard/experts",
        },
        {
          title: "Predictions",
          href: "/dashboard/predictions",
          icon: <Sparkles className="h-5 w-5" />,
          active: location === "/dashboard/predictions",
        },
        {
          title: "AI Farming Assistant",
          href: "/dashboard/farming-assistant",
          icon: <Brain className="h-5 w-5" />,
          active: location === "/dashboard/farming-assistant",
        },
        {
          title: "Stream Chat",
          href: "/dashboard/stream-chat",
          icon: <MessageSquare className="h-5 w-5" />,
          active: location === "/dashboard/stream-chat",
        },
        {
          title: "Verify Products",
          href: "/trace",
          icon: <ShieldCheck className="h-5 w-5" />,
          active: location === "/trace",
        },
        {
          title: "Profile",
          href: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
          active: location === "/dashboard/profile",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
          active: location === "/dashboard/settings",
        },
      ];
    }
  };

  const navItems = getNavItems();

  // Auto-expand Marketplace Manager if any of its children are active
  useEffect(() => {
    navItems.forEach((item: any) => {
      if (item.expandable && item.children) {
        const hasActiveChild = item.children.some((child: any) => child.active);
        if (hasActiveChild && !expandedItems.has(item.title)) {
          setExpandedItems((prev) => {
            const newSet = new Set(prev);
            newSet.add(item.title);
            return newSet;
          });
        }
      }
    });
  }, [location]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user?.profileImage || undefined} />
              <AvatarFallback className="text-lg font-semibold bg-primary/20 text-primary">
                {(user && (user.firstName?.[0] || user.username?.[0])) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left text-lg font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </SheetTitle>
              <SheetDescription className="text-left text-sm text-muted-foreground truncate">
                @{user?.username}
              </SheetDescription>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <Link
                  href={`/dashboard/social`}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="font-semibold text-foreground">
                    {formatCount(socialProfile?.followingCount ?? 0)}
                  </span>
                  <span className="text-muted-foreground">Following</span>
                </Link>
                <Link
                  href={`/dashboard/social`}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="font-semibold text-foreground">
                    {formatCount(socialProfile?.followerCount ?? 0)}
                  </span>
                  <span className="text-muted-foreground">Followers</span>
                </Link>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4 overflow-y-auto h-full">
          <nav className="space-y-1 px-4">
            {navItems.map((item: any) => {
              // Handle expandable items
              if (item.expandable && item.children) {
                const isExpanded = expandedItems.has(item.title);
                const hasActiveChild = item.children.some(
                  (child: any) => child.active
                );

                return (
                  <div key={item.title} className="space-y-1">
                    {/* Parent item - clickable to expand/collapse */}
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "flex items-center justify-between w-full gap-3 px-3 py-3 rounded-lg transition-colors min-h-[44px] touch-manipulation",
                        hasActiveChild
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu items */}
                    {isExpanded && (
                      <div className="ml-4 space-y-1 border-l-2 border-border pl-2">
                        {item.children.map((child: any) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation",
                              child.active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            onClick={() => onOpenChange(false)}
                          >
                            {child.icon}
                            <span className="font-medium text-sm">
                              {child.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular items
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors min-h-[44px] touch-manipulation",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => onOpenChange(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t absolute bottom-0 left-0 right-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              logoutMutation.mutate();
              onOpenChange(false);
            }}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
