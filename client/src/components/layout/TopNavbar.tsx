import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import {
  LogOut,
  User,
  Settings,
  Bell,
  ShoppingCart,
  Search,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CartIcon } from "@/components/cart/CartIcon";
import { NotificationCenter } from "@/components/farmer/NotificationCenter";
import { GlobalSearchDrawer } from "@/components/search/GlobalSearchDrawer";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import greenuppLogo from "@/assets/greenupp-full-logo.png";

interface TopNavbarProps {
  title: string;
  description?: string;
  onAvatarClick?: () => void;
}

export function TopNavbar({
  title,
  description,
  onAvatarClick,
}: TopNavbarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const isAppSubdomain = location.indexOf("/dashboard") === -1;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <div className="fixed right-0 md:right-0 z-40 h-14 md:h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center px-4 md:px-6 top-0 left-0 md:left-64">
        {/* Mobile: Avatar on left, Logo in center */}
        <div className="md:hidden flex items-center justify-between w-full">
          {/* Left: Avatar (clickable for sidebar) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-10 w-10 rounded-full"
              onClick={onAvatarClick}
            >
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user?.profileImage || undefined} />
                <AvatarFallback className="text-sm bg-primary/20 text-primary font-medium">
                  {(user && (user.firstName?.[0] || user.username?.[0])) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>

          {/* Center: GreenUpp Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/dashboard" className="flex items-center">
              <img
                src={greenuppLogo}
                alt="Greenupp Logo"
                className="h-8 md:h-10"
              />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile search icon */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-9 w-9"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile notification bell */}
            <div className="md:hidden">
              <NotificationCenter />
            </div>

            {/* Mobile cart icon */}
            <div className="md:hidden">
              <CartIcon />
            </div>
          </div>
        </div>

        {/* Desktop: Full title and description */}
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Desktop: Right section with profile and notifications */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {/* Search icon */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-9 w-9 relative group"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              K
            </Badge>
          </Button>

          {/* Cart */}
          <CartIcon />

          {/* Notification bell */}
          <NotificationCenter />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={user?.profileImage || undefined} />
                  <AvatarFallback className="text-sm bg-primary/20 text-primary">
                    {(user && (user.firstName?.[0] || user.username?.[0])) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={user?.profileImage || undefined} />
                    <AvatarFallback className="text-sm bg-primary/20 text-primary">
                      {(user && (user.firstName?.[0] || user.username?.[0])) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/profile`}
                  className="cursor-pointer w-full flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/settings`}
                  className="cursor-pointer w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 flex items-center gap-2"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Global Search Drawer */}
      <GlobalSearchDrawer open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
