import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BarChart3,
  Settings,
  Activity,
  Shield,
  FileText,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";

interface AdminNavProps {
  className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
  const { user } = useAuth();

  // Only show admin nav if user has admin role
  if (!user || user.role !== "admin") {
    return null;
  }

  const adminLinks = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Activity,
      description: "Admin overview and metrics",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      description: "Manage user accounts",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "System analytics and trends",
    },
    {
      href: "/admin/content",
      label: "Content",
      icon: FileText,
      description: "Manage marketplace content",
    },
    {
      href: "/admin/system",
      label: "System",
      icon: Settings,
      description: "System monitoring and settings",
    },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <Shield className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium text-orange-600">Admin Panel</span>
        <Badge variant="secondary" className="text-xs">
          Admin
        </Badge>
      </div>

      <div className="space-y-1">
        {adminLinks.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto p-3"
            asChild
          >
            <a href={link.href}>
              <link.icon className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">{link.label}</div>
                <div className="text-xs text-muted-foreground">
                  {link.description}
                </div>
              </div>
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
