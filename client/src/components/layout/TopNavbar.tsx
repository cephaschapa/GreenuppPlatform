import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, Settings } from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TopNavbarProps {
  title: string;
  description?: string;
}

export function TopNavbar({ title, description }: TopNavbarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
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
    <div className="fixed right-0 md:right-0 z-40 h-14 md:h-16 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 md:px-6 top-0 left-0 md:left-64">
      {/* Title shown on mobile only */}
      <div className="md:hidden flex-1 font-medium">Dashboard</div>
      {/* Show page title and description */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Right section with profile and notifications */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Cart */}
        <div className="hidden md:flex">
          <CartIcon />
        </div>

        {/* Notification bell */}
        <div className="hidden md:flex">
          <NotificationCenter />
        </div>

        {/* Profile dropdown */}
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
                href={isAppSubdomain ? "/profile" : "/dashboard/profile"}
                className="cursor-pointer w-full flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={isAppSubdomain ? "/settings" : "/dashboard/settings"}
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
  );
}
