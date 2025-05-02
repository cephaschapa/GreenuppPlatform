import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useNotifications } from "@/hooks/use-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRole } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { CartIcon } from "@/components/CartIcon";
import { NotificationBell } from "@/components/NotificationBell";
import { 
  Home, 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare,
  Menu, 
  Users,
  Settings,
  Cloud,
  Sprout,
  Sparkles,
  User,
  ShieldCheck,
  LogOut
} from "lucide-react";

export function ChatTopbar() {
  const { user, logoutMutation } = useAuth();
  const { totalUnreadCount: chatUnreadCount } = useChat();
  const { unreadCount: notificationCount } = useNotifications();
  const { itemCount } = useCart();
  const [location] = useLocation();

  const farmerNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === "/dashboard",
    },
    {
      title: "Weather",
      href: "/dashboard/weather",
      icon: <Cloud className="h-5 w-5" />,
      active: location === "/dashboard/weather",
    },
    {
      title: "Diagnose",
      href: "/dashboard/plant-diagnosis",
      icon: <Sprout className="h-5 w-5" />,
      active: location === "/dashboard/plant-diagnosis",
    },
    {
      title: "Shop",
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      active: location.startsWith("/dashboard/marketplace"),
    },
    {
      title: "Verify",
      href: "/trace",
      icon: <ShieldCheck className="h-5 w-5" />,
      active: location === "/trace",
    },
    {
      title: "Socials",
      href: "/dashboard/social",
      icon: <Users className="h-5 w-5" />,
      active: location === "/dashboard/social",
    },
    {
      title: "Chat",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      active: location === "/dashboard/chat",
    },
  ];

  const supplierNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === "/dashboard",
    },
    {
      title: "Marketplace",
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      active: location.startsWith("/dashboard/marketplace"),
    },
    {
      title: "Verify",
      href: "/trace",
      icon: <ShieldCheck className="h-5 w-5" />,
      active: location === "/trace",
    },
    {
      title: "Socials",
      href: "/dashboard/social",
      icon: <Users className="h-5 w-5" />,
      active: location === "/dashboard/social",
    },
    {
      title: "Chat",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      active: location === "/dashboard/chat",
    },
  ];

  const buyerNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === "/dashboard",
    },
    {
      title: "Marketplace",
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      active: location.startsWith("/dashboard/marketplace"),
    },
    {
      title: "Verify",
      href: "/trace",
      icon: <ShieldCheck className="h-5 w-5" />,
      active: location === "/trace",
    },
    {
      title: "Socials",
      href: "/dashboard/social",
      icon: <Users className="h-5 w-5" />,
      active: location === "/dashboard/social",
    },
    {
      title: "Chat",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      active: location === "/dashboard/chat",
    },
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

  // Get only the top menu items we want to show in the topbar
  const topbarMenuItems = navItems.filter(item => item.href !== "/dashboard/chat");

  return (
    <div className="flex items-center justify-between h-14 bg-sidebar text-sidebar-foreground border-b border-primary/20 px-4">
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="text-xl font-bold font-space tracking-wider relative mr-6"
        >
          Green<span className="text-primary">upp</span>
          <span className="absolute -top-1 -right-10 text-slate-600 text-[10px] px-1 py-0.5 rounded-full font-semibold">
            BETA
          </span>
        </Link>
      </div>

      {/* Desktop Menu Items */}
      <div className="hidden md:flex items-center space-x-1">
        {topbarMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md transition-colors",
              item.active
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-primary/10",
            )}
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="hidden lg:inline-block">{item.title}</span>
            </div>
            {item.title === "Socials" && notificationCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <CartIcon variant="topbar" />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="text-sm bg-primary/20 text-primary">
                  {(user && (user.firstName?.[0] || user.username?.[0])) || "U"}
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
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="cursor-pointer w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}