import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import {
  Home,
  ShoppingBag,
  Cloud,
  Sprout,
  Users,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { getUrl } = useRoleNavigation();

  // Don't show on public pages or when no user
  if (!user) return null;

  // Define the 5 essential navigation items for mobile
  const getNavItems = (): NavItem[] => {
    // Common items for all roles
    const commonItems = [
      {
        href: getUrl("dashboard"),
        label: "Home",
        icon: Home,
      },
      {
        href: getUrl("marketplace"),
        label: "Shop",
        icon: ShoppingBag,
      },
    ];

    // Add role-specific items
    const roleSpecificItems: NavItem[] = [];

    if (user.role === "farmer") {
      roleSpecificItems.push(
        {
          href: getUrl("weather"),
          label: "Weather",
          icon: Cloud,
        },
        {
          href: getUrl("diagnose"),
          label: "Diagnose",
          icon: Sprout,
        }
      );
    }

    // Social and chat are available to all
    const socialItems = [
      {
        href: getUrl("social"),
        label: "Social",
        icon: Users,
      },
    ];

    return [...commonItems, ...roleSpecificItems, ...socialItems];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          // Check if current location matches the nav item
          const isActive =
            location === item.href || location.startsWith(item.href + "/");

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 relative min-w-0 flex-1 min-h-[44px] touch-manipulation",
                isActive
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-xs mt-1 font-medium transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute top-0 right-2 h-4 min-w-4 px-1 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
