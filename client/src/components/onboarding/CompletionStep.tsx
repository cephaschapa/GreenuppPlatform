import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Leaf,
  ShoppingCart,
  Store,
  Camera,
  Cloud,
  Users,
  TrendingUp,
} from "lucide-react";
import { UserRoleType } from "@shared/schema";

interface CompletionStepProps {
  userRole: UserRoleType;
  firstName?: string;
  onComplete: () => void;
  isLoading?: boolean;
}

const roleConfig = {
  farmer: {
    icon: Leaf,
    title: "Your farm is ready to grow! 🌱",
    subtitle: "You're all set to start your smart farming journey",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    nextSteps: [
      {
        icon: Camera,
        title: "Take your first plant photo",
        description: "Use AI diagnosis to check crop health",
        action: "Go to Plant Diagnosis",
      },
      {
        icon: Cloud,
        title: "Check today's weather",
        description: "Get hyperlocal weather for your farm",
        action: "View Weather",
      },
      {
        icon: Leaf,
        title: "Add your first field",
        description: "Map your farming areas and crops",
        action: "Manage Fields",
      },
      {
        icon: Users,
        title: "Connect with experts",
        description: "Join the farming community",
        action: "Browse Experts",
      },
    ],
  },
  buyer: {
    icon: ShoppingCart,
    title: "Welcome to fresh, local produce! 🛒",
    subtitle: "Start discovering amazing products from local farmers",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    nextSteps: [
      {
        icon: ShoppingCart,
        title: "Browse the marketplace",
        description: "Discover fresh produce from verified farmers",
        action: "Shop Now",
      },
      {
        icon: TrendingUp,
        title: "Track your orders",
        description: "Follow your purchases from farm to table",
        action: "View Orders",
      },
      {
        icon: Users,
        title: "Follow your favorite farmers",
        description: "Get updates on new products and harvests",
        action: "Find Farmers",
      },
      {
        icon: CheckCircle,
        title: "Verify product quality",
        description: "Use QR codes to trace your food's journey",
        action: "Learn More",
      },
    ],
  },
  supplier: {
    icon: Store,
    title: "Your supply hub is ready! 📦",
    subtitle: "Start connecting with farmers and managing your inventory",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    nextSteps: [
      {
        icon: Store,
        title: "Set up your inventory",
        description: "Add your agricultural products and supplies",
        action: "Manage Inventory",
      },
      {
        icon: Users,
        title: "Connect with farmers",
        description: "Build relationships with local farmers",
        action: "Find Farmers",
      },
      {
        icon: TrendingUp,
        title: "Track your sales",
        description: "Monitor performance and market trends",
        action: "View Analytics",
      },
      {
        icon: CheckCircle,
        title: "Verify product quality",
        description: "Ensure quality control with our tools",
        action: "Quality Tools",
      },
    ],
  },
} as const;

export function CompletionStep({
  userRole,
  firstName,
  onComplete,
  isLoading,
}: CompletionStepProps) {
  const config = roleConfig[userRole as keyof typeof roleConfig];
  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className={`inline-flex p-4 rounded-full ${config.color}`}>
            <IconComponent className="h-8 w-8" />
          </div>
          <div className="absolute -top-1 -right-1">
            <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {firstName ? `Congratulations ${firstName}! ` : ""}
            {config.title}
          </h2>
          <p className="text-muted-foreground mt-2">{config.subtitle}</p>
        </div>

        <Badge variant="secondary" className="text-sm px-4 py-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Setup Complete
        </Badge>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">What's next?</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.nextSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary/20 transition-colors cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <StepIcon className="h-4 w-4 text-primary" />
                    </div>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center text-xs text-primary font-medium">
                    {step.action}
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Complete Button */}
      <div className="text-center pt-4">
        <Button
          onClick={onComplete}
          size="lg"
          className="min-w-[200px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Setting up..." : "Enter GreenUpp"}
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>You can always change these settings later in your profile</p>
      </div>
    </div>
  );
}

