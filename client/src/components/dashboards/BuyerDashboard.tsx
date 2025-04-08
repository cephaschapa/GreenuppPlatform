import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, Heart, TrendingDown, MapPin, Truck } from "lucide-react";

export function BuyerDashboard() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Top row of cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Marketplace</CardTitle>
            <CardDescription className="text-gray-400">Discover fresh produce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              <div className="flex flex-col items-center">
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <p className="text-gray-300">Browse available products</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              Shop Now
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Saved Items</CardTitle>
            <CardDescription className="text-gray-400">Your favorite products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              <div className="flex flex-col items-center">
                <Heart className="h-8 w-8 text-primary mb-2" />
                <p className="text-gray-300">No saved items yet</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View Wishlist
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Price Alerts</CardTitle>
            <CardDescription className="text-gray-400">Track best deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              <div className="flex flex-col items-center">
                <TrendingDown className="h-8 w-8 text-primary mb-2" />
                <p className="text-gray-300">Set price drop alerts</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              Set Alert
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Featured Farms</CardTitle>
            <CardDescription className="text-gray-400">Discover quality produce sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
              <div className="flex flex-col items-center text-center">
                <MapPin className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Farms Near You</h3>
                <p className="text-gray-400 mb-4">Discover local farms and support your community</p>
                <Button variant="default">
                  Explore Local Farms
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">My Orders</CardTitle>
            <CardDescription className="text-gray-400">Track your purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white">Recent Orders</h3>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-10 w-10 text-primary mb-2" />
                  <p className="text-gray-400">No orders yet</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View Order History
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Bottom card */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white font-space">Seasonal Recommendations</CardTitle>
          <CardDescription className="text-gray-400">AI-powered suggestions based on availability and quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6 bg-gradient-to-br from-green-950/50 to-black/50">
            <div className="text-center">
              <h3 className="text-primary font-medium mb-3">Top Picks This Season</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Organic apples are in peak season - best quality now
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Local honey production is high - great prices available
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Consider bulk purchasing grain products this month
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}