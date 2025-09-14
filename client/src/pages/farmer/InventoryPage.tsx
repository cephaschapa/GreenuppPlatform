import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  AlertTriangle,
  // Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  Search,
  // Filter,
  RefreshCw,
  Eye,
  // BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InventoryItem {
  id: number;
  listingId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  lastUpdated: string;
  listing?: {
    id: number;
    title: string;
    images: string[];
    price: string;
    priceCurrency: string;
    category: string;
    status: string;
  };
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  currency: string;
}

export default function InventoryPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    currency: "ZMW",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    quantity: "",
    lowStockThreshold: "",
  });

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      // First get user's listings
      const listingsResponse = await apiRequest(
        "GET",
        `/api/marketplace/listings?sellerId=${user?.id}`
      );
      const listings = await listingsResponse.json();

      // Then get inventory for each listing
      const inventoryData: InventoryItem[] = [];
      let totalValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      for (const listing of listings) {
        try {
          const inventoryResponse = await apiRequest(
            "GET",
            `/api/inventory/${listing.id}`
          );
          if (inventoryResponse.ok) {
            const inventoryItem = await inventoryResponse.json();
            if (inventoryItem) {
              const itemWithListing = {
                ...inventoryItem,
                listing,
              };
              inventoryData.push(itemWithListing);

              // Calculate stats
              const value = parseFloat(listing.price) * inventoryItem.quantity;
              totalValue += value;

              if (inventoryItem.availableQuantity <= 0) {
                outOfStockCount++;
              } else if (
                inventoryItem.availableQuantity <=
                inventoryItem.lowStockThreshold
              ) {
                lowStockCount++;
              }
            }
          }
        } catch (error) {
          // console.error(
          //   `Error fetching inventory for listing ${listing.id}:`,
          //   error
          // );
        }
      }

      setInventory(inventoryData);
      setStats({
        totalItems: inventoryData.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        totalValue,
        currency: "ZMW",
      });
    } catch (error) {
      // console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user, fetchInventory]);

  // Filter inventory based on search and status
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.listing?.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "low-stock" &&
        item.availableQuantity <= item.lowStockThreshold) ||
      (filterStatus === "out-of-stock" && item.availableQuantity <= 0) ||
      (filterStatus === "in-stock" &&
        item.availableQuantity > item.lowStockThreshold);

    return matchesSearch && matchesStatus;
  });

  // Handle inventory update
  const handleUpdateInventory = async () => {
    if (!selectedItem) return;

    try {
      const response = await apiRequest(
        "PATCH",
        `/api/inventory/${selectedItem.listingId}`,
        {
          quantity: parseInt(editForm.quantity),
          lowStockThreshold: parseInt(editForm.lowStockThreshold),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Inventory updated successfully",
        });
        setEditDialogOpen(false);
        fetchInventory(); // Refresh data
      } else {
        throw new Error("Failed to update inventory");
      }
    } catch (error) {
      // console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  // Get stock status badge
  const getStockStatus = (item: InventoryItem) => {
    if (item.availableQuantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (item.availableQuantity <= item.lowStockThreshold) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <DashboardLayout
      title="Inventory Management"
      description="Manage your marketplace inventory and stock levels"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <Button onClick={fetchInventory} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.lowStockItems}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.outOfStockItems}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalValue, stats.currency)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading inventory...</span>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No inventory items found
                </p>
                <Button
                  onClick={() => setLocation("/dashboard/marketplace")}
                  className="mt-4"
                >
                  Create Listing
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">Total Stock</th>
                      <th className="text-left p-2">Available</th>
                      <th className="text-left p-2">Reserved</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center space-x-3">
                            {item.listing?.images?.[0] && (
                              <img
                                src={item.listing.images[0]}
                                alt={item.listing.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">
                                {item.listing?.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.listing?.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{item.availableQuantity}</td>
                        <td className="p-2">{item.reservedQuantity}</td>
                        <td className="p-2">{getStockStatus(item)}</td>
                        <td className="p-2">
                          {formatCurrency(
                            parseFloat(item.listing?.price || "0") *
                              item.quantity,
                            item.listing?.priceCurrency || "ZMW"
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setEditForm({
                                  quantity: item.quantity.toString(),
                                  lowStockThreshold:
                                    item.lowStockThreshold.toString(),
                                });
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setLocation(
                                  `/dashboard/marketplace/${item.listingId}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Inventory Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Inventory</DialogTitle>
              <DialogDescription>
                Update stock levels for {selectedItem?.listing?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Total Quantity</label>
                <Input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Low Stock Threshold
                </label>
                <Input
                  type="number"
                  value={editForm.lowStockThreshold}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      lowStockThreshold: e.target.value,
                    })
                  }
                  min="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateInventory}>Update Inventory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
