import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { FarmerDashboard } from "@/components/dashboards/FarmerDashboard";
import { SupplierDashboard } from "@/components/dashboards/SupplierDashboard";
import { BuyerDashboard } from "@/components/dashboards/BuyerDashboard";
import { UserRoleType, UserRole } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();

  // Render the appropriate dashboard based on the user's role
  const renderDashboard = () => {
    if (!user) return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    
    switch (user.role) {
      case UserRole.FARMER:
        return <FarmerDashboard />;
      case UserRole.SUPPLIER:
        return <SupplierDashboard />;
      case UserRole.BUYER:
        return <BuyerDashboard />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-primary/40 rounded-md">
            <p className="text-gray-300 mb-4">Role-specific dashboard not available</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="py-6 border-b border-primary/20">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-space tracking-wider group">
            Green<span className="text-primary group-hover:animate-pulse transition-all">upp</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Welcome, <span className="text-primary font-medium">{user?.firstName || user?.username}</span>
              {user?.role && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 font-space">Your Dashboard</h1>
        {renderDashboard()}
      </main>
    </div>
  );
}