import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  Edit,
  Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

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

interface OrderTrackingCardProps {
  order: Order;
  userRole: "buyer" | "seller";
  onOrderUpdate?: () => void;
}

export function OrderTrackingCard({
  order,
  userRole,
  onOrderUpdate,
}: OrderTrackingCardProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [statusNotes, setStatusNotes] = useState("");
  const queryClient = useQueryClient();

  // Update order status mutation (for sellers)
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      status,
      notes,
    }: {
      status: string;
      notes?: string;
    }) => {
      const response = await apiRequest(
        "PUT",
        `/api/orders/${order.id}/status`,
        {
          status,
          notes,
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsUpdateDialogOpen(false);
      setStatusNotes("");
      onOrderUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return 10;
      case "confirmed":
        return 25;
      case "processing":
        return 50;
      case "shipped":
        return 75;
      case "delivered":
        return 100;
      case "cancelled":
      case "refunded":
        return 0;
      default:
        return 10;
    }
  };

  const handleStatusUpdate = () => {
    updateOrderMutation.mutate({
      status: newStatus,
      notes: statusNotes.trim() || undefined,
    });
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Order #{order.orderNumber}
            </CardTitle>
            <CardDescription>
              Placed{" "}
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.status)} variant="secondary">
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
            {userRole === "seller" &&
              order.status !== "delivered" &&
              order.status !== "cancelled" && (
                <Dialog
                  open={isUpdateDialogOpen}
                  onOpenChange={setIsUpdateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Order Status</DialogTitle>
                      <DialogDescription>
                        Update the status of order #{order.orderNumber}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status">New Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about this status update..."
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsUpdateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStatusUpdate}
                        disabled={updateOrderMutation.isPending}
                      >
                        {updateOrderMutation.isPending
                          ? "Updating..."
                          : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Order Progress</span>
            <span>{getProgressPercentage(order.status)}%</span>
          </div>
          <Progress
            value={getProgressPercentage(order.status)}
            className="h-2"
          />
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Details
            </h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Total:</span>{" "}
                {order.currency} {order.totalAmount}
              </p>
              <p>
                <span className="text-muted-foreground">Payment:</span>{" "}
                {order.paymentMethod || "Not specified"}
              </p>
              <p>
                <span className="text-muted-foreground">Payment Status:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {order.paymentStatus}
                </Badge>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Delivery Information
            </h4>
            <div className="text-sm space-y-1">
              {order.estimatedDeliveryDate && (
                <p>
                  <span className="text-muted-foreground">Estimated:</span>{" "}
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </p>
              )}
              {order.actualDeliveryDate && (
                <p>
                  <span className="text-muted-foreground">Delivered:</span>{" "}
                  {new Date(order.actualDeliveryDate).toLocaleDateString()}
                </p>
              )}
              {order.shippingAddress && (
                <p className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">{order.shippingAddress}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(order.buyer || order.seller) && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {userRole === "seller" && order.buyer && (
                <div>
                  <p className="text-muted-foreground">Buyer:</p>
                  <p>
                    {order.buyer.firstName} {order.buyer.lastName}
                  </p>
                  {order.buyer.phone && (
                    <p className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      {order.buyer.phone}
                    </p>
                  )}
                </div>
              )}
              {userRole === "buyer" && order.seller && (
                <div>
                  <p className="text-muted-foreground">Seller:</p>
                  <p>
                    {order.seller.firstName} {order.seller.lastName}
                  </p>
                  {order.seller.phone && (
                    <p className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      {order.seller.phone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium">Items ({order.items.length})</h4>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {item.listing?.images?.[0] && (
                    <img
                      src={item.listing.images[0]}
                      alt={item.listing.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {item.listing?.title || "Product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity} × {item.currency}{" "}
                      {item.unitPrice}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {item.currency} {item.totalPrice}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Order History</h4>
            <div className="space-y-2">
              {order.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3 p-2 text-sm">
                  <div className="mt-1">{getStatusIcon(history.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {history.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(history.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {history.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {history.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

