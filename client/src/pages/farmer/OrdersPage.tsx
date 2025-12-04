import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrderTrackingCard } from "@/components/orders/OrderTrackingCard";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Package, Search, User, Store, Loader2 } from "lucide-react";

interface OrderItem {
  id: number;
  listingId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: string;
  listing?: {
    title: string;
    images: string[];
    price: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus: string;
  createdAt: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  items: OrderItem[];
  statusHistory: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
  buyer?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  seller?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("buying");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders using React Query
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders", activeTab],
    queryFn: async () => {
      const role = activeTab === "selling" ? "seller" : "buyer";
      const response = await apiRequest("GET", `/api/orders?role=${role}`);
      return await response.json();
    },
    enabled: !!user,
  });

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <DashboardLayout
        title="Orders"
        description="Manage your purchases and sales"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Orders"
      description={`Manage your ${
        activeTab === "buying" ? "purchases" : "sales"
      }`}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buying" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Purchases
          </TabsTrigger>
          <TabsTrigger value="selling" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            My Sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search orders or items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab === "buying" ? "purchases" : "sales"} found
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === "buying"
                      ? "You haven't made any purchases yet."
                      : "You haven't received any orders yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <OrderTrackingCard
                  key={order.id}
                  order={order}
                  userRole={activeTab === "selling" ? "seller" : "buyer"}
                  onOrderUpdate={() => refetch()}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
