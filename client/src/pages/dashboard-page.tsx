import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BuyerDashboard } from "@/components/dashboards/BuyerDashboard";
import DashboardOverview from "@/pages/farmer/DashboardOverview";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Wrap the dashboard content with OnboardingGuard
  return (
    <OnboardingGuard>
      {(() => {
        // Role-based dashboard routing
        switch (user.role) {
          case "farmer":
            return <DashboardOverview />;
          case "buyer":
            return <BuyerDashboard />;
          case "seller":
          case "supplier":
            // For now, sellers use the same dashboard as buyers
            // TODO: Create SellerDashboard component
            return <BuyerDashboard />;
          case "admin":
            return <Redirect to="/admin" />;
          default:
            // Fallback for unknown roles
            return <Redirect to="/auth" />;
        }
      })()}
    </OnboardingGuard>
  );
}
