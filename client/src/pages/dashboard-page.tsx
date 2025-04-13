import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { UserRole } from "@shared/schema";
import { Loader2 } from "lucide-react";
import DashboardOverview from "./farmer/DashboardOverview";

export default function DashboardPage() {
  const { user } = useAuth();

  // Show loading while checking user
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect based on role
  switch (user.role) {
    case UserRole.FARMER:
      return <DashboardOverview />;
    case UserRole.SUPPLIER:
      // Could redirect to a supplier-specific page in the future
      return <Redirect to="/dashboard/supplier" />;
    case UserRole.BUYER:
      // Could redirect to a buyer-specific page in the future
      return <Redirect to="/dashboard/buyer" />;
    default:
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="flex flex-col items-center justify-center max-w-md text-center">
            <h1 className="text-3xl font-bold mb-4 relative inline-block">
              Welcome to Greenupp
              <span className="absolute -top-2 -right-12 bg-primary text-black text-xs px-2 py-0.5 rounded-full font-semibold">BETA</span>
            </h1>
            <p className="text-muted-foreground mb-4">
              Your role-specific dashboard is currently unavailable. Please contact support.
            </p>
          </div>
        </div>
      );
  }
}