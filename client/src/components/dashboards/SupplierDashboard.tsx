import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Package, TrendingUp, AlertCircle, Users, ShoppingBag } from "lucide-react";

export function SupplierDashboard() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Top row of cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Inventory Management</CardTitle>
            <CardDescription className="text-gray-400">Track and manage your products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              <div className="flex flex-col items-center">
                <Package className="h-8 w-8 text-primary mb-2" />
                <p className="text-gray-300">0 products in inventory</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              Manage Inventory
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Sales Analytics</CardTitle>
            <CardDescription className="text-gray-400">Monitor your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              <div className="flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <p className="text-gray-300">No sales data yet</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View Analytics
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Notifications</CardTitle>
            <CardDescription className="text-gray-400">Important updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-primary mb-2" />
                <p className="text-gray-300">No new notifications</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View All
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Customer Management</CardTitle>
            <CardDescription className="text-gray-400">Track and manage your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
              <div className="flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Build Your Network</h3>
                <p className="text-gray-400 mb-4">Connect with farmers and buyers to expand your business</p>
                <Button variant="default">
                  Browse Potential Customers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Orders</CardTitle>
            <CardDescription className="text-gray-400">Manage purchase orders</CardDescription>
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
                  <ShoppingBag className="h-10 w-10 text-primary mb-2" />
                  <p className="text-gray-400">No orders yet</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View All Orders
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Bottom card */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white font-space">Market Insights</CardTitle>
          <CardDescription className="text-gray-400">AI-powered market trends and demand forecasting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6 bg-gradient-to-br from-green-950/50 to-black/50">
            <div className="text-center">
              <h3 className="text-primary font-medium mb-3">Supply Chain Recommendations</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  High demand predicted for organic fertilizers this season
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Consider stocking drought-resistant seed varieties
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Equipment rental opportunities for upcoming harvest season
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}