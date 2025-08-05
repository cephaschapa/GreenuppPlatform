import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Heart,
  TrendingUp,
  Users,
  Star,
  Package,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  Plus,
  ArrowRight,
  ShoppingCart,
  MessageSquare,
  Eye,
  Calendar,
  Truck,
  CheckCircle,
  Zap,
  Leaf,
  Award,
  Bell,
  Filter,
  Search,
} from "lucide-react";
import { Link } from "wouter";

interface BuyerStats {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  followedSellers: number;
  reviewsWritten: number;
  averageOrderValue: number;
  monthlySpending: number;
  savingsThisMonth: number;
}

interface RecentOrder {
  id: number;
  sellerId: number;
  sellerName: string;
  sellerAvatar?: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total: number;
  status: string;
  orderDate: string;
  estimatedDelivery?: string;
}

interface FavoriteSeller {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  isFollowing: boolean;
  newProductsCount: number;
  lastActive: string;
}

interface RecommendedProduct {
  id: number;
  name: string;
  sellerId: number;
  sellerName: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating: number;
  reviewCount: number;
  category: string;
  freshness: string;
  organic: boolean;
  inSeason: boolean;
  reasonForRecommendation: string;
}

interface PurchaseInsight {
  category: string;
  spending: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  seasonalTip?: string;
}

export function BuyerDashboard() {
  const { user } = useAuth();
  const { getUrl } = useRoleNavigation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch buyer statistics
  const { data: stats, isLoading: statsLoading } = useQuery<BuyerStats>({
    queryKey: ["/api/buyer/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/buyer/stats");
      return res.json();
    },
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery<
    RecentOrder[]
  >({
    queryKey: ["/api/buyer/recent-orders"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/buyer/recent-orders?limit=5");
      return res.json();
    },
  });

  // Fetch favorite sellers
  const { data: favoriteSellers, isLoading: sellersLoading } = useQuery<
    FavoriteSeller[]
  >({
    queryKey: ["/api/buyer/favorite-sellers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/buyer/favorite-sellers");
      return res.json();
    },
  });

  // Fetch recommended products
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<
    RecommendedProduct[]
  >({
    queryKey: ["/api/buyer/recommendations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/buyer/recommendations?limit=8");
      return res.json();
    },
  });

  // Fetch purchase insights
  const { data: insights, isLoading: insightsLoading } = useQuery<
    PurchaseInsight[]
  >({
    queryKey: ["/api/buyer/purchase-insights"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/buyer/purchase-insights");
      return res.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Discover fresh produce and connect with local farmers
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href={getUrl("marketplace")}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={getUrl("marketplace/cart")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              K{Number(stats?.totalSpent || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              K{Number(stats?.monthlySpending || 0).toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Followed Sellers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.followedSellers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {favoriteSellers?.filter((s) => s.newProductsCount > 0).length ||
                0}{" "}
              with new products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Savings This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              K{Number(stats?.savingsThisMonth || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From bulk purchases & deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="sellers">Favorite Sellers</TabsTrigger>
          <TabsTrigger value="insights">Purchase Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personalized Recommendations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Recommended for You
                    </CardTitle>
                    <CardDescription>
                      Fresh picks based on your preferences and seasonal
                      availability
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={getUrl("marketplace")}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {recommendations?.slice(0, 4).map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <Link href={getUrl(`marketplace/${product.id}`)}>
                        <div className="space-y-3">
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Leaf className="h-8 w-8 text-green-500" />
                              </div>
                            )}
                            {product.organic && (
                              <Badge className="absolute top-2 left-2 bg-green-500">
                                Organic
                              </Badge>
                            )}
                            {product.inSeason && (
                              <Badge className="absolute top-2 right-2 bg-orange-500">
                                In Season
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              by {product.sellerName}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                K{product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  K{product.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{product.rating}</span>
                              <span className="text-xs text-muted-foreground">
                                ({product.reviewCount})
                              </span>
                            </div>
                            <p className="text-xs text-blue-600">
                              {product.reasonForRecommendation}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentOrders?.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <div
                      className={`p-2 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} items from {order.sellerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">K{order.total}</p>
                      <Badge
                        className={getStatusColor(order.status)}
                        variant="secondary"
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={getUrl("orders")}>
                    View All Orders <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={getUrl("marketplace")}>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Fresh Produce
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={getUrl("social")}>
                    <Users className="h-4 w-4 mr-2" />
                    Follow New Farmers
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={getUrl("orders")}>
                    <Package className="h-4 w-4 mr-2" />
                    Track My Orders
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={getUrl("chat")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Sellers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest purchases and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders?.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={order.sellerAvatar} />
                          <AvatarFallback>
                            {order.sellerName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            from {order.sellerName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">K{order.total}</p>
                        <Badge
                          className={getStatusColor(order.status)}
                          variant="secondary"
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-2 mb-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            K
                            {(
                              Number(item.price) * Number(item.quantity)
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Ordered {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                      {order.estimatedDelivery && (
                        <span>
                          Est. delivery:{" "}
                          {new Date(
                            order.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Sellers</CardTitle>
              <CardDescription>Farmers and sellers you follow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteSellers?.map((seller) => (
                  <div key={seller.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.avatar} />
                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{seller.name}</h4>
                          {seller.newProductsCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {seller.newProductsCount} new
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          @{seller.username}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {seller.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{seller.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({seller.reviewCount} reviews)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {seller.specialties.slice(0, 3).map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="outline"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <Link href={getUrl(`marketplace?seller=${seller.id}`)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Products
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={getUrl(`chat?user=${seller.id}`)}>
                          <MessageSquare className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Where your money goes each month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights?.map((insight) => (
                  <div key={insight.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {insight.category}
                      </span>
                      <span className="text-sm">
                        K{Number(insight.spending || 0).toFixed(2)}
                      </span>
                    </div>
                    <Progress value={insight.percentage} className="h-2" />
                    {insight.seasonalTip && (
                      <p className="text-xs text-blue-600">
                        {insight.seasonalTip}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Tips</CardTitle>
                <CardDescription>
                  Make the most of seasonal produce
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Leaf className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        In Season Now
                      </p>
                      <p className="text-xs text-green-700">
                        Tomatoes, cabbage, and onions are at their peak
                        freshness and best prices this month.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Bulk Buying Opportunity
                      </p>
                      <p className="text-xs text-blue-700">
                        Save 15-20% by buying maize and beans in bulk this
                        season.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Coming Soon
                      </p>
                      <p className="text-xs text-orange-700">
                        Mango season starts next month. Follow your favorite
                        fruit sellers for early access.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
