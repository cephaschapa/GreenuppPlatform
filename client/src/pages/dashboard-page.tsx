import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium text-white font-space">Current Crops</CardTitle>
              <CardDescription className="text-gray-400">Manage your active crops</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
                <p className="text-gray-500">No crops added yet</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
                <i className="fas fa-plus mr-2"></i> Add New Crop
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium text-white font-space">Weather Forecast</CardTitle>
              <CardDescription className="text-gray-400">5-day weather prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
                <p className="text-gray-500">Set your farm location</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
                <i className="fas fa-map-marker-alt mr-2"></i> Update Location
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium text-white font-space">Marketplace</CardTitle>
              <CardDescription className="text-gray-400">Buy supplies and sell produce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
                <p className="text-gray-500">Coming soon</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
                <i className="fas fa-store mr-2"></i> Browse Marketplace
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12">
          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-white font-space">AI-Powered Insights</CardTitle>
              <CardDescription className="text-gray-400">Smart recommendations based on your farm data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
                <p className="text-gray-300 text-center mb-4">AI analytics will appear here once you set up your farm profile and add crops</p>
                <Button variant="default">
                  <i className="fas fa-robot mr-2"></i> Complete Farm Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}