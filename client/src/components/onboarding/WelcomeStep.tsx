import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  ShoppingCart,
  Store,
  Users,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";
import { UserRoleType } from "@shared/schema";

interface WelcomeStepProps {
  userRole: UserRoleType;
  firstName?: string;
  onContinue: () => void;
}

const roleConfig = {
  farmer: {
    icon: Leaf,
    title: "Welcome to Your Farming Journey!",
    subtitle: "Let's set up your farm profile to unlock personalized insights",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    features: [
      {
        icon: Leaf,
        title: "AI Plant Diagnosis",
        description:
          "Get instant disease detection and treatment recommendations",
      },
      {
        icon: TrendingUp,
        title: "Smart Analytics",
        description: "Track crop performance and optimize your yields",
      },
      {
        icon: Globe,
        title: "Weather Integration",
        description: "Hyperlocal weather data and agricultural advisories",
      },
      {
        icon: Users,
        title: "Expert Network",
        description: "Connect with agricultural experts and fellow farmers",
      },
    ],
  },
  buyer: {
    icon: ShoppingCart,
    title: "Welcome to GreenUpp Marketplace!",
    subtitle: "Discover fresh, traceable produce directly from farmers",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    features: [
      {
        icon: ShoppingCart,
        title: "Fresh Produce",
        description: "Buy directly from verified local farmers",
      },
      {
        icon: Shield,
        title: "Crop Traceability",
        description: "Track your food from farm to table with blockchain",
      },
      {
        icon: TrendingUp,
        title: "Quality Assurance",
        description: "AI-verified quality and freshness guarantees",
      },
      {
        icon: Smartphone,
        title: "Easy Ordering",
        description: "Simple mobile-first shopping experience",
      },
    ],
  },
  supplier: {
    icon: Store,
    title: "Welcome to Your Supply Hub!",
    subtitle: "Connect with farmers and manage your agricultural supply chain",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    features: [
      {
        icon: Store,
        title: "Inventory Management",
        description: "Track and manage your agricultural supplies",
      },
      {
        icon: Users,
        title: "Farmer Network",
        description: "Connect directly with farmers in your region",
      },
      {
        icon: TrendingUp,
        title: "Sales Analytics",
        description: "Monitor sales performance and market trends",
      },
      {
        icon: Shield,
        title: "Quality Control",
        description: "Ensure product quality with verification tools",
      },
    ],
  },
} as const;

export function WelcomeStep({
  userRole,
  firstName,
  onContinue,
}: WelcomeStepProps) {
  const config = roleConfig[userRole as keyof typeof roleConfig];
  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-4">
        <div className={`inline-flex p-4 rounded-full ${config.color}`}>
          <IconComponent className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {firstName ? `Hi ${firstName}! ` : ""}
            {config.title}
          </h2>
          <p className="text-muted-foreground mt-2">{config.subtitle}</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.features.map((feature, index) => {
          const FeatureIcon = feature.icon;
          return (
            <Card
              key={index}
              className="border-2 hover:border-primary/20 transition-colors"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FeatureIcon className="h-4 w-4 text-primary" />
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Badge */}
      <div className="text-center">
        <Badge variant="secondary" className="text-sm px-4 py-2">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
        </Badge>
      </div>

      {/* Continue Button */}
      <div className="text-center pt-4">
        <Button onClick={onContinue} size="lg" className="min-w-[200px]">
          Let's Get Started
        </Button>
      </div>
    </div>
  );
}

