import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { useLocation } from "wouter";
import {
  Shield,
  Activity,
  Users,
  Settings,
  BarChart3,
  Database,
  Lock,
  FileText,
  MessageSquare,
  Globe,
  AlertTriangle,
  Zap,
  Eye,
  UserCog,
  CreditCard,
  Terminal,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface AdminNavItem {
  icon: any;
  label: string;
  href: string;
  description?: string;
  badge?: string;
  category: string;
}

const adminNavItems: AdminNavItem[] = [
  // Dashboard & Overview
  {
    icon: Activity,
    label: "Dashboard",
    href: "/admin",
    description: "System overview & metrics",
    category: "overview",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/admin/analytics",
    description: "Platform analytics & insights",
    category: "overview",
  },

  // User Management
  {
    icon: Users,
    label: "Users",
    href: "/admin/users",
    description: "Manage user accounts",
    category: "users",
  },
  {
    icon: UserCog,
    label: "Roles & Permissions",
    href: "/admin/roles",
    description: "Role-based access control",
    category: "users",
  },
  {
    icon: Eye,
    label: "User Sessions",
    href: "/admin/sessions",
    description: "Active user sessions",
    category: "users",
  },

  // Platform Management
  {
    icon: FileText,
    label: "Content",
    href: "/admin/content",
    description: "Manage platform content",
    category: "platform",
  },
  {
    icon: MessageSquare,
    label: "Communications",
    href: "/admin/communications",
    description: "Messages & announcements",
    category: "platform",
  },
  {
    icon: Users,
    label: "Waitlist",
    href: "/admin/waitlist-management",
    description: "Testing program waitlist",
    category: "platform",
  },

  // System & Security
  {
    icon: Settings,
    label: "System Health",
    href: "/admin/system-health",
    description: "System monitoring",
    category: "system",
  },
  {
    icon: Database,
    label: "Database",
    href: "/admin/database",
    description: "Database management",
    category: "system",
  },
  {
    icon: Lock,
    label: "Security",
    href: "/admin/security",
    description: "Security settings & logs",
    category: "system",
  },
  {
    icon: Zap,
    label: "Feature Flags",
    href: "/admin/features",
    description: "Toggle platform features",
    category: "system",
  },

  // Developer Tools
  {
    icon: Terminal,
    label: "API Explorer",
    href: "/admin/api",
    description: "Test API endpoints",
    category: "dev",
  },
  {
    icon: Globe,
    label: "Webhooks",
    href: "/admin/webhooks",
    description: "Manage webhooks",
    category: "dev",
  },
  {
    icon: AlertTriangle,
    label: "Error Logs",
    href: "/admin/errors",
    description: "System error tracking",
    category: "dev",
  },
];

const categoryLabels = {
  overview: "Overview",
  users: "User Management",
  platform: "Platform",
  system: "System",
  dev: "Developer Tools",
};

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  // Only allow admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  const isCurrentPath = (href: string) => {
    if (href === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(href);
  };

  const groupedItems = adminNavItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AdminNavItem[]>);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <div className="w-72 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Super Admin</h1>
              <p className="text-sm text-muted-foreground">GreenUpp Platform</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              Admin Access
            </Badge>
            <Badge variant="outline" className="text-xs">
              {user.username}
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <Button
                    key={item.href}
                    variant={isCurrentPath(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start h-auto p-3 text-left"
                    asChild
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin/help">
                <HelpCircle className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div>
            {title && (
              <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
