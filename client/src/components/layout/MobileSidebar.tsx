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
  FileText,
  BarChart3,
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

export function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
          title: "Expert Directory",
          href: "/dashboard/experts",
          icon: <Users className="h-5 w-5" />,
          active: location === "/dashboard/experts",
        },
        {
          title: "Dealer Directory",
          href: "/dashboard/dealers",
          icon: <ShoppingBag className="h-5 w-5" />,
          active: location === "/dashboard/dealers",
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
          title: "AI Knowledge Base",
          href: "/ai-knowledge-base",
          icon: <FileText className="h-5 w-5" />,
          active: location === "/ai-knowledge-base",
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
          title: "Orders",
          href: "/dashboard/orders",
          icon: <ShoppingCart className="h-5 w-5" />,
          active: location === "/dashboard/orders",
        },
        {
          title: "Expert Directory",
          href: "/dashboard/experts",
          icon: <Users className="h-5 w-5" />,
          active: location === "/dashboard/experts",
        },
        {
          title: "Dealer Directory",
          href: "/dashboard/dealers",
          icon: <ShoppingBag className="h-5 w-5" />,
          active: location === "/dashboard/dealers",
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
          title: "AI Knowledge Base",
          href: "/ai-knowledge-base",
          icon: <FileText className="h-5 w-5" />,
          active: location === "/ai-knowledge-base",
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
          title: "Expert Directory",
          href: "/dashboard/experts",
          icon: <Users className="h-5 w-5" />,
          active: location === "/dashboard/experts",
        },
        {
          title: "Dealer Directory",
          href: "/dashboard/dealers",
          icon: <ShoppingBag className="h-5 w-5" />,
          active: location === "/dashboard/dealers",
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
          title: "AI Knowledge Base",
          href: "/ai-knowledge-base",
          icon: <FileText className="h-5 w-5" />,
          active: location === "/ai-knowledge-base",
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
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">0</span>
                  <span>Following</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">0</span>
                  <span>Followers</span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onOpenChange(false)}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
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
