import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, ShoppingBag, Cloud, Sprout, Users, Menu } from "lucide-react";
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

  // Define the 5 essential navigation items for mobile
  const getNavItems = (): NavItem[] => {
    const baseItems = [
      {
        href: "/dashboard",
        label: "Home",
        icon: Home,
      },
      {
        href: "/dashboard/marketplace",
        label: "Shop",
        icon: ShoppingBag,
      },
      {
        href: "/dashboard/weather",
        label: "Weather",
        icon: Cloud,
      },
      {
        href: "/dashboard/plant-diagnosis",
        label: "Diagnose",
        icon: Sprout,
      },
      {
        href: "/dashboard/social",
        label: "Social",
        icon: Users,
      },
    ];

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href === "/dashboard/marketplace" &&
              location.startsWith("/dashboard/marketplace"));

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 relative min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
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
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
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
