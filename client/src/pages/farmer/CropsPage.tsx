import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Field, Crop } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Trash2,
  Loader2,
  Leaf,
  // MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Sprout,
  ShoppingBag,
  X,
  TractorIcon,
  Camera,
} from "lucide-react";
import { CropDetailsDialog } from "@/components/farmer/CropDetailsDialog";
import { QuickObservationDialog } from "@/components/farmer/QuickObservationDialog";
import React from "react";

export default function CropsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [selectedCrops, setSelectedCrops] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isCropDetailsOpen, setIsCropDetailsOpen] = useState(false);
  const [isQuickObservationOpen, setIsQuickObservationOpen] = useState(false);
  const [quickObsCropId, setQuickObsCropId] = useState<number | undefined>();

  // Fetch fields
  const { data: fields } = useQuery<Field[]>({
    queryKey: ["/api/fields"],
    queryFn: async () => {
      const response = await fetch("/api/fields");
      if (!response.ok) {
        throw new Error("Failed to fetch fields");
      }
      return await response.json();
    },
    enabled: Boolean(user?.id),
  });

  // Fetch crops
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    queryFn: async () => {
      const response = await fetch("/api/crops");
      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }
      return await response.json();
    },
    enabled: Boolean(user?.id),
  });

  // Update crop status mutation
  const updateCropStatusMutation = useMutation({
    mutationFn: async ({
      cropId,
      status,
    }: {
      cropId: number;
      status: string;
    }) => {
      const response = await fetch(`/api/crops/${cropId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update crop status");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop status updated",
        description: "The crop status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update crop status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete crop mutation
  const deleteCropMutation = useMutation({
    mutationFn: async (cropId: number) => {
      const response = await fetch(`/api/crops/${cropId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete crop");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop deleted",
        description: "The crop has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete crop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsCropDetailsOpen(true);
  };

  const handleCropStatusChange = (cropId: number, status: string) => {
    updateCropStatusMutation.mutate({ cropId, status });
  };

  const handleDeleteCrop = (cropId: number) => {
    if (confirm("Are you sure you want to delete this crop?")) {
      deleteCropMutation.mutate(cropId);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    selectedCrops.forEach((cropId) => {
      updateCropStatusMutation.mutate({ cropId, status });
    });
    setSelectedCrops(new Set());
  };

  const handleBulkDelete = () => {
    if (
      confirm(`Are you sure you want to delete ${selectedCrops.size} crops?`)
    ) {
      selectedCrops.forEach((cropId) => {
        deleteCropMutation.mutate(cropId);
      });
      setSelectedCrops(new Set());
    }
  };

  const toggleCropSelection = (cropId: number) => {
    const newSelection = new Set(selectedCrops);
    if (newSelection.has(cropId)) {
      newSelection.delete(cropId);
    } else {
      newSelection.add(cropId);
    }
    setSelectedCrops(newSelection);
  };

  const getFilteredCrops = () => {
    if (!crops) return [];

    return crops.filter((crop) => {
      const matchesSearch =
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.variety?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || crop.status === statusFilter;
      const matchesField =
        fieldFilter === "all" || crop.fieldId.toString() === fieldFilter;
      return matchesSearch && matchesStatus && matchesField;
    });
  };

  const getCropProgress = (crop: Crop) => {
    if (!crop.plantingDate || !crop.expectedHarvestDate) return 0;

    const plantingDate = new Date(crop.plantingDate);
    const harvestDate = new Date(crop.expectedHarvestDate);
    const currentDate = new Date();

    const totalDays = harvestDate.getTime() - plantingDate.getTime();
    const elapsedDays = currentDate.getTime() - plantingDate.getTime();

    const progress = Math.min(
      Math.max((elapsedDays / totalDays) * 100, 0),
      100
    );
    return Math.round(progress);
  };

  const getCropHealthStatus = (crop: Crop) => {
    const progress = getCropProgress(crop);
    const status = crop.status;

    if (status === "failed")
      return { color: "text-red-500", icon: AlertCircle, label: "Failed" };
    if (status === "completed" || status === "harvested")
      return { color: "text-green-500", icon: CheckCircle, label: "Completed" };
    if (status === "harvesting")
      return {
        color: "text-orange-500",
        icon: ShoppingBag,
        label: "Harvesting",
      };
    if (progress > 75)
      return { color: "text-blue-500", icon: Sprout, label: "Mature" };
    if (progress > 25)
      return { color: "text-green-500", icon: Leaf, label: "Growing" };
    return { color: "text-gray-500", icon: Clock, label: "Young" };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "harvested":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "harvesting":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      case "growing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "planted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const formatDate = (dateStr: string | null | Date | undefined) => {
    if (!dateStr) return "Not set";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const getFieldName = (fieldId: number) => {
    const field = fields?.find((f) => f.id === fieldId);
    return field?.name || `Field ${fieldId}`;
  };

  const filteredCrops = getFilteredCrops();

  // Don't render if user is not authenticated
  if (!user) {
    return (
      <DashboardLayout title="Crop Management">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Please log in to manage your crops.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Crop Management"
      description="Manage all your crops across all fields"
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Crop Management</h1>
            <p className="text-muted-foreground">
              Manage all your crops across all fields
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedCrops.size > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-muted-foreground">
                  {selectedCrops.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Status Changes</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange("growing")}
                    >
                      Mark as Growing
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange("harvesting")}
                    >
                      Mark as Harvesting
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange("completed")}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      className="text-red-600"
                    >
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCrops(new Set())}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="planted">Planted</SelectItem>
                    <SelectItem value="growing">Growing</SelectItem>
                    <SelectItem value="harvesting">Harvesting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Field:</label>
                <Select value={fieldFilter} onValueChange={setFieldFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    {fields?.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setFieldFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Crops Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              All Crops ({filteredCrops.length})
            </h2>
          </div>

          {cropsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredCrops.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchTerm || statusFilter !== "all" || fieldFilter !== "all"
                  ? "No crops found matching your filters"
                  : "No crops found"}
              </p>
              <p className="text-sm">
                {searchTerm || statusFilter !== "all" || fieldFilter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "Add crops to your fields to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCrops.map((crop) => {
                const progress = getCropProgress(crop);
                const healthStatus = getCropHealthStatus(crop);
                const isSelected = selectedCrops.has(crop.id);

                return (
                  <Card
                    key={crop.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleCropSelect(crop)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleCropSelection(crop.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center gap-2">
                            <healthStatus.icon
                              className={`h-4 w-4 ${healthStatus.color}`}
                            />
                            <CardTitle className="text-base">
                              {crop.name}
                            </CardTitle>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleCropSelect(crop)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleCropStatusChange(crop.id, "growing")
                              }
                            >
                              Mark as Growing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleCropStatusChange(crop.id, "harvesting")
                              }
                            >
                              Mark as Harvesting
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleCropStatusChange(crop.id, "completed")
                              }
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteCrop(crop.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Crop
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
                            crop.status
                          )}`}
                        >
                          {crop.status}
                        </span>
                        <span
                          className={`text-xs ${healthStatus.color} font-medium`}
                        >
                          {healthStatus.label}
                        </span>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <TractorIcon className="h-3 w-3" />
                        {getFieldName(crop.fieldId)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Progress Bar */}
                      {crop.status === "growing" && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Growth Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground space-y-1">
                        {crop.variety && (
                          <p>
                            <span className="font-medium">Variety:</span>{" "}
                            {crop.variety}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Planted:</span>{" "}
                          {formatDate(crop.plantingDate)}
                        </p>
                        <p>
                          <span className="font-medium">Expected Harvest:</span>{" "}
                          {formatDate(crop.expectedHarvestDate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Crop Details Dialog */}
      <CropDetailsDialog
        crop={selectedCrop as any}
        isOpen={isCropDetailsOpen}
        onClose={() => {
          setIsCropDetailsOpen(false);
          setSelectedCrop(null);
        }}
      />

      {/* Quick Observation Dialog */}
      <QuickObservationDialog
        isOpen={isQuickObservationOpen}
        onOpenChange={setIsQuickObservationOpen}
        preselectedCropId={quickObsCropId}
      />

      {/* Floating Action Button - Quick Observation */}
      {filteredCrops.length > 0 && (
        <Button
          onClick={() => {
            setQuickObsCropId(undefined);
            setIsQuickObservationOpen(true);
          }}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          size="icon"
        >
          <Camera className="h-6 w-6" />
        </Button>
      )}
    </DashboardLayout>
  );
}
