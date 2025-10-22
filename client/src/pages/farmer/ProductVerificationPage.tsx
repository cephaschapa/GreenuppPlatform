import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  QrCode,
  Scan,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Camera,
  X,
  Loader2,
  ArrowLeft,
  Filter,
  Package,
  Leaf,
  ShoppingBag,
  Calendar,
  MapPin,
  Clock,
  BarChart3,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CropDetailsDialog } from "@/components/farmer/CropDetailsDialog";
import { ProductVerificationGuide } from "@/components/farmer/ProductVerificationGuide";

interface Crop {
  id: number;
  name: string;
  variety?: string;
  status: string;
  batchId?: string;
  blockchainTxId?: string;
  traceabilityQrCode?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  fieldId?: number;
  field?: {
    name: string;
    location?: string;
  };
  createdAt: string;
}

interface MarketplaceListing {
  id: number;
  title: string;
  description?: string;
  category: string;
  price: number;
  priceCurrency: string;
  quantity: number;
  quantityUnit: string;
  sourceCropId?: number;
  traceabilityQrCode?: string;
  traceabilityBatchId?: string;
  blockchainVerified: boolean;
  status: string;
  createdAt: string;
  crop?: Crop;
}

interface VerificationResult {
  crop: Crop;
  blockchainHistory: unknown[];
  verificationResults: unknown[];
  allVerified: boolean;
}

export default function ProductVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Fetch user's crops that have begun production
  const { data: crops, isLoading: isLoadingCrops } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/crops");
      return await response.json();
    },
  });

  // Fetch user's marketplace listings with traceability
  const { data: listings, isLoading: isLoadingListings } = useQuery<
    MarketplaceListing[]
  >({
    queryKey: ["/api/marketplace/listings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/marketplace/listings");
      return await response.json();
    },
  });

  // Filter crops that have begun production (planning, planted, growing, harvesting, completed)
  const productionCrops =
    crops?.filter((crop) =>
      ["planning", "planted", "growing", "harvesting", "completed"].includes(
        crop.status
      )
    ) || [];

  // Filter scannable products (have batch IDs and QR codes)
  const scannableCrops = productionCrops.filter(
    (crop) => crop.batchId && crop.traceabilityQrCode
  );
  const scannableListings =
    listings?.filter(
      (listing) => listing.blockchainVerified && listing.traceabilityQrCode
    ) || [];

  // Filter based on selected filter
  const getFilteredItems = () => {
    switch (selectedFilter) {
      case "crops":
        return productionCrops;
      case "listings":
        return listings || [];
      case "scannable":
        return [...scannableCrops, ...scannableListings];
      default:
        return [...productionCrops, ...(listings || [])];
    }
  };

  const filteredItems = getFilteredItems();

  // Search functionality
  const searchResults = filteredItems.filter((item) => {
    const searchTerm = searchInput.toLowerCase();
    if ("name" in item) {
      // Crop
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.variety?.toLowerCase().includes(searchTerm) ||
        item.batchId?.toLowerCase().includes(searchTerm)
      );
    } else {
      // Marketplace listing
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.traceabilityBatchId?.toLowerCase().includes(searchTerm)
      );
    }
  });

  // Handle QR code scan
  const handleQRScan = (data: string) => {
    setScannedData(data);
    handleVerification(data);
  };

  // Verification mutation (uses internal authenticated endpoint)
  const verificationMutation = useMutation({
    mutationFn: async (batchId: string) => {
      const response = await apiRequest(
        "GET",
        `/api/product-verification/internal/verify/${batchId}`
      );
      return await response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      setIsVerifying(false);
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: "Could not verify the product. Please try again.",
        variant: "destructive",
      });
      setIsVerifying(false);
    },
  });

  const handleVerification = (batchId: string) => {
    setIsVerifying(true);
    verificationMutation.mutate(batchId);
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      handleVerification(searchInput.trim());
    }
  };

  const downloadQRCode = (qrCodeData: string, filename: string) => {
    const link = document.createElement("a");
    link.href = qrCodeData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareProduct = (item: Crop | MarketplaceListing) => {
    const isCrop = "name" in item;
    const batchId = isCrop ? item.batchId : item.traceabilityBatchId;

    if (navigator.share && batchId) {
      navigator.share({
        title: isCrop ? `${item.name} Traceability` : item.title,
        text: `Verify the authenticity of this product using blockchain traceability.`,
        url: `${window.location.origin}/dashboard/verification?batch=${batchId}`,
      });
    } else if (batchId) {
      navigator.clipboard.writeText(
        `${window.location.origin}/dashboard/verification?batch=${batchId}`
      );
      toast({
        title: "Link copied",
        description: "Verification link copied to clipboard",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planning":
        return <Calendar className="h-4 w-4 text-gray-500" />;
      case "planted":
        return <Leaf className="h-4 w-4 text-blue-500" />;
      case "growing":
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case "harvesting":
        return <Package className="h-4 w-4 text-orange-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
      case "planted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "growing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "harvesting":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const handleCardClick = (item: Crop | MarketplaceListing) => {
    const isCrop = "name" in item;
    if (isCrop) {
      setSelectedCrop(item);
      setIsDetailsDialogOpen(true);
    }
  };

  return (
    <DashboardLayout title="Product Verification">
      <div className="container max-w-7xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Product Verification</h1>
            <p className="text-muted-foreground">
              Verify and manage blockchain traceability for your products
            </p>
          </div>
          <Button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2"
          >
            <Scan className="h-4 w-4" />
            Scan QR Code
          </Button>
        </div>

        {/* Workflow Guide */}
        <ProductVerificationGuide />

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Verify
            </CardTitle>
            <CardDescription>
              Search for products by batch ID or scan QR codes to verify
              authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter batch ID (e.g., batch_abc123def456)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={!searchInput.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="crops">Crops Only</SelectItem>
                  <SelectItem value="listings">Marketplace Listings</SelectItem>
                  <SelectItem value="scannable">Scannable Products</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="ml-auto">
                {searchResults.length} products
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verificationResult && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <ShieldCheck className="h-5 w-5" />
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    {verificationResult.allVerified
                      ? "All checks passed"
                      : "Some issues found"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Product Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {verificationResult.crop.name}
                      </p>
                      <p>
                        <span className="font-medium">Variety:</span>{" "}
                        {verificationResult.crop.variety || "Not specified"}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {verificationResult.crop.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Blockchain Status</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Batch ID:</span>{" "}
                        {verificationResult.crop.batchId}
                      </p>
                      <p>
                        <span className="font-medium">Transactions:</span>{" "}
                        {verificationResult.blockchainHistory.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <Tabs defaultValue="grid" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((item) => {
                const isCrop = "name" in item;
                const batchId = isCrop
                  ? item.batchId
                  : item.traceabilityBatchId;
                const qrCode = isCrop
                  ? item.traceabilityQrCode
                  : item.traceabilityQrCode;
                const isScannable = !!(batchId && qrCode);

                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleCardClick(item)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {isCrop ? item.name : item.title}
                          </CardTitle>
                          <CardDescription>
                            {isCrop ? item.variety : item.category}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          {isScannable && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              Scannable
                            </Badge>
                          )}
                          {isCrop && (
                            <Badge
                              variant="outline"
                              className={getStatusColor(item.status)}
                            >
                              {getStatusIcon(item.status)}
                              <span className="ml-1 capitalize">
                                {item.status}
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Batch ID:
                          </span>
                          <p className="font-mono text-xs truncate">
                            {batchId || "Not available"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <p className="text-xs">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isCrop && item.field && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.field.name}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {isScannable && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerification(batchId!);
                              }}
                              className="flex-1"
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <QrCode className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>QR Code</DialogTitle>
                                  <DialogDescription>
                                    Scan this QR code to verify the product
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center space-y-4">
                                  <div className="border rounded-md p-2 bg-white">
                                    <img
                                      src={qrCode}
                                      alt="QR Code"
                                      className="h-48 w-48 object-contain"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        downloadQRCode(
                                          qrCode!,
                                          `${
                                            isCrop ? item.name : item.title
                                          }-qr.png`
                                        )
                                      }
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => shareProduct(item)}
                                    >
                                      <Share2 className="h-3 w-3 mr-1" />
                                      Share
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        {!isScannable && isCrop && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCrop(item);
                              setIsDetailsDialogOpen(true);
                            }}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {searchResults.map((item) => {
                    const isCrop = "name" in item;
                    const batchId = isCrop
                      ? item.batchId
                      : item.traceabilityBatchId;
                    const isScannable = !!batchId;

                    return (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleCardClick(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {isCrop ? item.name : item.title}
                              </h4>
                              {isScannable && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                                >
                                  <QrCode className="h-3 w-3 mr-1" />
                                  Scannable
                                </Badge>
                              )}
                              {isCrop && (
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(item.status)}
                                >
                                  {getStatusIcon(item.status)}
                                  <span className="ml-1 capitalize">
                                    {item.status}
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isCrop ? item.variety : item.category}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Batch ID: {batchId || "Not available"}
                              </span>
                              <span>
                                Created:{" "}
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isScannable && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerification(batchId!);
                                }}
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCrop) {
                                  setSelectedCrop(item);
                                  setIsDetailsDialogOpen(true);
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Scanner Dialog */}
        <QRCodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleQRScan}
          title="Product Verification Scanner"
          description="Scan a QR code to verify product authenticity and traceability"
        />

        {/* Loading State */}
        {isVerifying && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Verifying on blockchain...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingCrops &&
          !isLoadingListings &&
          searchResults.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchInput
                    ? "No products match your search criteria."
                    : "Start by creating crops or marketplace listings with blockchain traceability."}
                </p>
                <Button onClick={() => setLocation("/dashboard/crops")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Crops
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Crop Details Dialog */}
        <CropDetailsDialog
          crop={selectedCrop}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedCrop(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
