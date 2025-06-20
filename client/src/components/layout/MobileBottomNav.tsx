import { useLocation } from "wouter";
import {
  Home,
  MapPin,
  Calendar,
  Cloud,
  Settings,
  BarChart3,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/fields",
    label: "Fields",
    icon: MapPin,
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: Calendar,
  },
  {
    href: "/weather",
    label: "Weather",
    icon: Cloud,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/social",
    label: "Social",
    icon: Users,
  },
  {
    href: "/chat",
    label: "Chat",
    icon: MessageSquare,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mobile-icon" />
              <span className="text-xs mt-1 mobile-text-xs">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
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
