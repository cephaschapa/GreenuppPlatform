import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  TrendingUp,
  PieChart,
  Sprout,
  MapPin,
  Calendar,
  ShoppingCart,
  Package,
  Users2,
  BookOpen,
  Bell,
  Mail,
  Megaphone,
  Target,
  UserPlus,
  Award,
  Smartphone,
  Plug,
  CheckCircle,
  Brain,
  Cpu,
  FlaskConical,
  GitBranch,
  LineChart,
  CloudCog,
  BarChart4,
  MonitorSpeaker,
  Layers,
  TestTube,
  Workflow,
  Network,
  Beaker,
  Wifi,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Radio,
  Satellite,
  ScanLine,
  Radar,
  Router,
  Power,
  BatteryLow,
  Waves,
  Compass,
  ChevronDown,
  ChevronRight,
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

  // Business Intelligence & Analytics
  {
    icon: TrendingUp,
    label: "Business Intelligence",
    href: "/admin/business-intelligence",
    description: "Revenue, growth metrics, KPIs",
    category: "platform",
  },
  {
    icon: PieChart,
    label: "Market Analytics",
    href: "/admin/market-analytics",
    description: "Marketplace trends & insights",
    category: "platform",
  },

  // Agriculture-Specific Management
  {
    icon: Sprout,
    label: "Crop Management",
    href: "/admin/crops",
    description: "Global crop data & varieties",
    category: "platform",
  },
  {
    icon: MapPin,
    label: "Regional Settings",
    href: "/admin/regions",
    description: "Geographic zones & climate data",
    category: "platform",
  },
  {
    icon: Calendar,
    label: "Seasonal Calendar",
    href: "/admin/seasons",
    description: "Planting & harvest schedules",
    category: "platform",
  },

  // Marketplace & Commerce
  {
    icon: ShoppingCart,
    label: "Marketplace Admin",
    href: "/admin/marketplace",
    description: "Listings, orders, transactions",
    category: "platform",
  },
  {
    icon: Package,
    label: "Inventory Oversight",
    href: "/admin/inventory",
    description: "Platform-wide inventory tracking",
    category: "platform",
  },
  {
    icon: CreditCard,
    label: "Payment Management",
    href: "/admin/payments",
    description: "Transactions, refunds, disputes",
    category: "platform",
  },

  // Community & Support
  {
    icon: Users2,
    label: "Community Management",
    href: "/admin/community",
    description: "Social features, forums, groups",
    category: "platform",
  },
  {
    icon: HelpCircle,
    label: "Support Center",
    href: "/admin/support",
    description: "Tickets, FAQ management",
    category: "platform",
  },
  {
    icon: BookOpen,
    label: "Knowledge Base",
    href: "/admin/knowledge-base",
    description: "Educational content & guides",
    category: "platform",
  },

  // Communication & Engagement
  {
    icon: Bell,
    label: "Notification Center",
    href: "/admin/notifications",
    description: "Push, email, SMS campaigns",
    category: "platform",
  },
  {
    icon: Mail,
    label: "Email Campaigns",
    href: "/admin/email-campaigns",
    description: "Marketing & transactional emails",
    category: "platform",
  },
  {
    icon: Megaphone,
    label: "Announcements",
    href: "/admin/announcements",
    description: "Platform-wide communications",
    category: "platform",
  },

  // Growth & Optimization
  {
    icon: Target,
    label: "A/B Testing",
    href: "/admin/ab-testing",
    description: "Feature experiments & optimization",
    category: "platform",
  },
  {
    icon: UserPlus,
    label: "User Onboarding",
    href: "/admin/onboarding",
    description: "Registration flows & tutorials",
    category: "platform",
  },
  {
    icon: Award,
    label: "Rewards Program",
    href: "/admin/rewards",
    description: "Loyalty points, achievements",
    category: "platform",
  },

  // Mobile & Integration
  {
    icon: Smartphone,
    label: "Mobile App Management",
    href: "/admin/mobile",
    description: "App versions, push settings",
    category: "platform",
  },
  {
    icon: Plug,
    label: "Integrations",
    href: "/admin/integrations",
    description: "Third-party APIs & services",
    category: "platform",
  },

  // Quality & Moderation
  {
    icon: Shield,
    label: "Content Moderation",
    href: "/admin/moderation",
    description: "Review flagged content & users",
    category: "platform",
  },
  {
    icon: CheckCircle,
    label: "Quality Assurance",
    href: "/admin/quality",
    description: "Product verification & standards",
    category: "platform",
  },

  // AI Lab - Model Management
  {
    icon: Brain,
    label: "Model Training",
    href: "/admin/ai-lab/model-training",
    description: "Retrain crop recognition & disease models",
    category: "ailab",
  },
  {
    icon: GitBranch,
    label: "Model Versioning",
    href: "/admin/ai-lab/model-versions",
    description: "Manage model versions & rollbacks",
    category: "ailab",
  },
  {
    icon: LineChart,
    label: "Model Performance",
    href: "/admin/ai-lab/model-performance",
    description: "Accuracy metrics & validation results",
    category: "ailab",
  },
  {
    icon: Layers,
    label: "Dataset Management",
    href: "/admin/ai-lab/datasets",
    description: "Training data & annotations",
    category: "ailab",
  },

  // AI Lab - Conversational AI
  {
    icon: MessageSquare,
    label: "Chat Assistants",
    href: "/admin/ai-lab/chat-assistants",
    description: "Configure AI personalities & knowledge",
    category: "ailab",
  },
  {
    icon: Target,
    label: "Intent Training",
    href: "/admin/ai-lab/intent-training",
    description: "Teach AI farming query understanding",
    category: "ailab",
  },
  {
    icon: FileText,
    label: "Response Templates",
    href: "/admin/ai-lab/response-templates",
    description: "Manage AI response patterns & tone",
    category: "ailab",
  },
  {
    icon: BarChart4,
    label: "Conversation Analytics",
    href: "/admin/ai-lab/conversation-analytics",
    description: "Chat success rates & satisfaction",
    category: "ailab",
  },

  // AI Lab - Experiments & Research
  {
    icon: FlaskConical,
    label: "Experiment Dashboard",
    href: "/admin/ai-lab/experiments",
    description: "Track AI research & tests",
    category: "ailab",
  },
  {
    icon: TestTube,
    label: "Feature Flags",
    href: "/admin/ai-lab/feature-flags",
    description: "Toggle experimental AI features",
    category: "ailab",
  },
  {
    icon: Beaker,
    label: "Hypothesis Testing",
    href: "/admin/ai-lab/hypothesis-testing",
    description: "Document AI improvement experiments",
    category: "ailab",
  },
  {
    icon: Network,
    label: "Research Projects",
    href: "/admin/ai-lab/research",
    description: "Long-term AI development initiatives",
    category: "ailab",
  },

  // AI Lab - Analytics & Infrastructure
  {
    icon: BarChart3,
    label: "AI Usage Analytics",
    href: "/admin/ai-lab/usage-analytics",
    description: "User interaction with AI features",
    category: "ailab",
  },
  {
    icon: MonitorSpeaker,
    label: "Model Drift Detection",
    href: "/admin/ai-lab/model-drift",
    description: "Monitor when models need retraining",
    category: "ailab",
  },
  {
    icon: Cpu,
    label: "Compute Resources",
    href: "/admin/ai-lab/compute",
    description: "GPU clusters & training jobs",
    category: "ailab",
  },
  {
    icon: CloudCog,
    label: "AI Infrastructure",
    href: "/admin/ai-lab/infrastructure",
    description: "Deployment, scaling & pipelines",
    category: "ailab",
  },
  {
    icon: Workflow,
    label: "API Management",
    href: "/admin/ai-lab/api-management",
    description: "Third-party AI service integrations",
    category: "ailab",
  },

  // IoT & Sensors - Device Management
  {
    icon: Wifi,
    label: "Device Registry",
    href: "/admin/iot/device-registry",
    description: "Manage all connected IoT devices",
    category: "iot",
  },
  {
    icon: Router,
    label: "Network Topology",
    href: "/admin/iot/network-topology",
    description: "View device connections & gateways",
    category: "iot",
  },
  {
    icon: Power,
    label: "Device Status",
    href: "/admin/iot/device-status",
    description: "Real-time device health & connectivity",
    category: "iot",
  },
  {
    icon: BatteryLow,
    label: "Power Management",
    href: "/admin/iot/power-management",
    description: "Battery levels & power optimization",
    category: "iot",
  },

  // IoT & Sensors - Environmental Monitoring
  {
    icon: Thermometer,
    label: "Temperature Sensors",
    href: "/admin/iot/temperature-sensors",
    description: "Soil & air temperature monitoring",
    category: "iot",
  },
  {
    icon: Droplets,
    label: "Moisture Sensors",
    href: "/admin/iot/moisture-sensors",
    description: "Soil moisture & irrigation control",
    category: "iot",
  },
  {
    icon: Wind,
    label: "Weather Stations",
    href: "/admin/iot/weather-stations",
    description: "Wind, humidity & pressure sensors",
    category: "iot",
  },
  {
    icon: Gauge,
    label: "Soil Sensors",
    href: "/admin/iot/soil-sensors",
    description: "pH, nutrients & soil composition",
    category: "iot",
  },

  // IoT & Sensors - Automation & Control
  {
    icon: Waves,
    label: "Irrigation Control",
    href: "/admin/iot/irrigation-control",
    description: "Automated watering systems",
    category: "iot",
  },
  {
    icon: ScanLine,
    label: "Drone Management",
    href: "/admin/iot/drone-management",
    description: "Agricultural drone fleet control",
    category: "iot",
  },
  {
    icon: Satellite,
    label: "GPS Tracking",
    href: "/admin/iot/gps-tracking",
    description: "Equipment & livestock location",
    category: "iot",
  },
  {
    icon: Radio,
    label: "Communication Protocols",
    href: "/admin/iot/communication-protocols",
    description: "LoRaWAN, Zigbee, WiFi management",
    category: "iot",
  },

  // IoT & Sensors - Data & Analytics
  {
    icon: BarChart3,
    label: "Sensor Data Analytics",
    href: "/admin/iot/sensor-analytics",
    description: "Analyze environmental trends",
    category: "iot",
  },
  {
    icon: Radar,
    label: "Predictive Maintenance",
    href: "/admin/iot/predictive-maintenance",
    description: "Prevent equipment failures",
    category: "iot",
  },
  {
    icon: Compass,
    label: "Field Mapping",
    href: "/admin/iot/field-mapping",
    description: "IoT-enabled precision agriculture",
    category: "iot",
  },
  {
    icon: AlertTriangle,
    label: "Alert Management",
    href: "/admin/iot/alert-management",
    description: "Sensor threshold alerts & notifications",
    category: "iot",
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
  ailab: "AI Lab",
  iot: "IoT & Sensors",
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
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (category: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Only allow admin users - redirect to admin login if not authenticated
  if (!user || user.role !== "admin") {
    // Use setTimeout to avoid immediate redirect during render
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 100);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Redirecting...
          </h1>
          <p className="text-muted-foreground">
            Redirecting to admin login page...
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
      <div className="w-72 bg-card border-r border-border flex flex-col fixed left-0 top-0 h-screen z-40">
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
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => {
              const isCollapsed = collapsedSections.has(category);
              const categoryLabel =
                categoryLabels[category as keyof typeof categoryLabels];

              return (
                <div key={category}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between h-auto p-2 mb-2 hover:bg-muted/50"
                    onClick={() => toggleSection(category)}
                  >
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {categoryLabel}
                    </h3>
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>

                  {!isCollapsed && (
                    <div className="space-y-1 ml-2">
                      {items.map((item) => (
                        <Button
                          key={item.href}
                          variant={
                            isCurrentPath(item.href) ? "secondary" : "ghost"
                          }
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
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
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
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

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
      <div className="flex-1 flex flex-col ml-72">
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
