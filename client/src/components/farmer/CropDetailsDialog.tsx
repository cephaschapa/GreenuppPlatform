import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Leaf,
  BarChart3,
  Package,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Plus,
  Zap,
  Database,
  Hash,
  Link,
  FileText,
  Camera,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CropActivityLog } from "@/components/farmer/CropActivityLog";
import { QuickObservationDialog } from "@/components/farmer/QuickObservationDialog";
import { differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";

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

interface CropTraceEvent {
  id: number;
  cropId: number;
  eventType: string;
  description: string;
  eventDate: string;
  performedBy: number;
  blockchainTxId?: string;
  blockchainTxHash?: string;
  metadata?: Record<string, any>;
}

interface CropDetailsDialogProps {
  crop: Crop | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CropDetailsDialog({
  crop,
  isOpen,
  onClose,
}: CropDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isQuickObservationOpen, setIsQuickObservationOpen] = useState(false);

  // Fetch crop trace events
  const { data: traceEvents = [], isLoading: isLoadingEvents } = useQuery<
    CropTraceEvent[]
  >({
    queryKey: ["/api/croptrace", crop?.id, "trace", "events"],
    queryFn: async () => {
      if (!crop) return [];
      const response = await apiRequest(
        "GET",
        `/api/croptrace/crops/${crop.id}/trace/events`
      );
      return await response.json();
    },
    enabled: !!crop,
  });

  // Fetch blockchain history
  const { data: blockchainHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/croptrace", crop?.id, "trace", "history"],
    queryFn: async () => {
      if (!crop) return null;
      const response = await apiRequest(
        "GET",
        `/api/croptrace/crops/${crop.id}/trace/history`
      );
      return await response.json();
    },
    enabled: !!crop,
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: async () => {
      if (!crop) throw new Error("No crop selected");
      const response = await apiRequest(
        "POST",
        `/api/croptrace/crops/${crop.id}/trace/initialize`,
        {
          name: crop.name,
          variety: crop.variety,
          status: crop.status,
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully for this crop.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/croptrace", crop?.id, "trace", "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/croptrace", crop?.id, "trace", "history"],
      });
    },
    onError: (error) => {
      toast({
        title: "QR Generation Failed",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    try {
      await generateQRMutation.mutateAsync();
    } finally {
      setIsGeneratingQR(false);
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

  const shareCrop = () => {
    if (!crop?.batchId) return;

    if (navigator.share) {
      navigator.share({
        title: `${crop.name} Traceability`,
        text: `Verify the authenticity of ${crop.name} using blockchain traceability.`,
        url: `${window.location.origin}/dashboard/verification?batch=${crop.batchId}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/dashboard/verification?batch=${crop.batchId}`
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
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
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
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  if (!crop) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            {crop.name} {crop.variety && `(${crop.variety})`}
          </DialogTitle>
          <DialogDescription>
            Detailed information about crop stages, milestones, and blockchain
            traceability
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Crop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      variant="outline"
                      className={getStatusColor(crop.status)}
                    >
                      {getStatusIcon(crop.status)}
                      <span className="ml-1 capitalize">{crop.status}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variety:</span>
                    <span className="text-sm">
                      {crop.variety || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Field:</span>
                    <span className="text-sm">
                      {crop.field?.name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">
                      {formatDate(crop.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Planting Date:</span>
                    <span className="text-sm">
                      {formatDate(crop.plantingDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Expected Harvest:
                    </span>
                    <span className="text-sm">
                      {formatDate(crop.expectedHarvestDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Actual Harvest:</span>
                    <span className="text-sm">
                      {formatDate(crop.actualHarvestDate)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blockchain Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {crop.batchId ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">
                      {crop.batchId
                        ? "Blockchain Enabled"
                        : "Not on Blockchain"}
                    </span>
                  </div>
                  {!crop.batchId && (
                    <Button
                      onClick={handleGenerateQR}
                      disabled={isGeneratingQR}
                      size="sm"
                    >
                      {isGeneratingQR ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Generate QR Code
                    </Button>
                  )}
                </div>
                {crop.batchId && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Batch ID:</span>
                      <span className="font-mono">{crop.batchId}</span>
                    </div>
                    {crop.blockchainTxId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Transaction ID:
                        </span>
                        <span className="font-mono text-xs truncate">
                          {crop.blockchainTxId}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {/* Crop Progress Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5" />
                  Growth Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Days Since Planting */}
                {crop.plantingDate && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Days Since Planting
                      </span>
                      <Badge variant="secondary">
                        {differenceInDays(
                          new Date(),
                          new Date(crop.plantingDate)
                        )}{" "}
                        days
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Planted on{" "}
                      {new Date(crop.plantingDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Days Until Harvest */}
                {crop.expectedHarvestDate && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Days Until Harvest
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {Math.max(
                          0,
                          differenceInDays(
                            new Date(crop.expectedHarvestDate),
                            new Date()
                          )
                        )}{" "}
                        days
                      </Badge>
                    </div>
                    {crop.plantingDate && (
                      <div className="mt-2">
                        <Progress
                          value={
                            (differenceInDays(
                              new Date(),
                              new Date(crop.plantingDate)
                            ) /
                              differenceInDays(
                                new Date(crop.expectedHarvestDate),
                                new Date(crop.plantingDate)
                              )) *
                            100
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Expected harvest:{" "}
                          {new Date(
                            crop.expectedHarvestDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setIsQuickObservationOpen(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Log Observation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <CropActivityLog cropId={crop.id} limit={10} />
          </TabsContent>

          <TabsContent value="stages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Crop Stages & Milestones
                </CardTitle>
                <CardDescription>
                  Timeline of crop development and key milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading events...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Always show crop lifecycle stages based on crop data */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        Crop Lifecycle Stages
                      </h4>

                      {/* Planning Stage */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Planning Stage</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(crop.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Crop planning and preparation completed
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Completed</span>
                          </div>
                        </div>
                      </div>

                      {/* Planting Stage */}
                      {crop.plantingDate ? (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Planting Stage</h4>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(crop.plantingDate)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Seeds planted and germination initiated
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">Completed</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-500">
                                Planting Stage
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                Not scheduled
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Planting date not set yet
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">Pending</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Growth Stage */}
                      {crop.status === "growing" ||
                      crop.status === "harvesting" ||
                      crop.status === "completed" ? (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Growth Stage</h4>
                              <span className="text-sm text-muted-foreground">
                                {crop.status === "growing"
                                  ? "Active"
                                  : "Completed"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {crop.status === "growing"
                                ? "Crop is actively growing and developing"
                                : "Growth stage completed successfully"}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {crop.status === "growing" ? (
                                <>
                                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                  <span className="text-blue-600">
                                    In Progress
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600">
                                    Completed
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : crop.plantingDate ? (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-500">
                                Growth Stage
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                Upcoming
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Waiting for germination and initial growth
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">Pending</span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Harvest Stage */}
                      {crop.expectedHarvestDate ? (
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              crop.status === "harvesting" ||
                              crop.status === "completed"
                                ? "bg-orange-100"
                                : "bg-gray-100 border-2 border-dashed border-gray-300"
                            }`}
                          >
                            <Package
                              className={`h-4 w-4 ${
                                crop.status === "harvesting" ||
                                crop.status === "completed"
                                  ? "text-orange-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`font-medium ${
                                  crop.status === "harvesting" ||
                                  crop.status === "completed"
                                    ? ""
                                    : "text-gray-500"
                                }`}
                              >
                                Harvest Stage
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {crop.status === "completed"
                                  ? "Completed"
                                  : formatDate(crop.expectedHarvestDate)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {crop.status === "completed"
                                ? "Harvest completed successfully"
                                : crop.status === "harvesting"
                                ? "Currently harvesting the crop"
                                : `Expected harvest: ${formatDate(
                                    crop.expectedHarvestDate
                                  )}`}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {crop.status === "completed" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600">
                                    Completed
                                  </span>
                                </>
                              ) : crop.status === "harvesting" ? (
                                <>
                                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                                  <span className="text-orange-600">
                                    In Progress
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-500">
                                    {(() => {
                                      const today = new Date();
                                      const harvestDate = new Date(
                                        crop.expectedHarvestDate
                                      );
                                      const daysToHarvest = Math.ceil(
                                        (harvestDate.getTime() -
                                          today.getTime()) /
                                          (1000 * 60 * 60 * 24)
                                      );

                                      if (daysToHarvest > 0) {
                                        return `${daysToHarvest} days to go`;
                                      } else if (daysToHarvest === 0) {
                                        return "Due today!";
                                      } else {
                                        return `${Math.abs(
                                          daysToHarvest
                                        )} days overdue`;
                                      }
                                    })()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-500">
                                Harvest Stage
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                Not scheduled
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Expected harvest date not set yet
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">Pending</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Show trace events if they exist */}
                    {traceEvents.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">
                          Recorded Events ({traceEvents.length})
                        </h4>
                        <div className="space-y-4">
                          {traceEvents.map((event, index) => (
                            <div
                              key={event.id}
                              className="flex items-start gap-4"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium capitalize">
                                    {event.eventType.replace(/_/g, " ")}
                                  </h4>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(event.eventDate)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {event.description}
                                </p>
                                {event.blockchainTxId && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Database className="h-3 w-3 text-green-500" />
                                    <span className="text-green-600">
                                      Blockchain Verified
                                    </span>
                                    <span className="font-mono">
                                      {event.blockchainTxId}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show suggestion to record more events */}
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">
                              Track More Activities
                            </h5>
                            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                              Record fertilizing, pest control, irrigation, and
                              other activities to create a complete timeline of
                              your crop's journey.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => {
                                // This could open an activity recording modal
                                toast({
                                  title: "Coming Soon",
                                  description:
                                    "Activity recording feature will be available soon!",
                                });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Record Activity
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Blockchain Verification
                </CardTitle>
                <CardDescription>
                  Detailed blockchain transaction history and verification
                  status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading blockchain data...</span>
                  </div>
                ) : blockchainHistory ? (
                  <div className="space-y-4">
                    <div className="rounded-md border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Verification Status</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All transactions have been verified on the blockchain
                      </p>
                    </div>

                    {blockchainHistory.blockchainHistory &&
                    blockchainHistory.blockchainHistory.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium">Transaction History</h4>
                        {blockchainHistory.blockchainHistory.map(
                          (tx: any, index: number) => (
                            <div
                              key={index}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  {tx.type}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">
                                    Transaction ID:
                                  </span>
                                  <p className="font-mono truncate">
                                    {tx.txId}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Date:
                                  </span>
                                  <p>{formatDate(tx.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No blockchain transactions yet
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Blockchain not initialized
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Generate a QR code to start blockchain tracking
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  QR Code & Verification
                </CardTitle>
                <CardDescription>
                  QR code for public verification and sharing options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {crop.traceabilityQrCode ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="border rounded-md p-4 bg-white">
                      <img
                        src={crop.traceabilityQrCode}
                        alt="QR Code"
                        className="h-64 w-64 object-contain"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium">
                        Scan to verify authenticity
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Anyone can scan this QR code to verify the crop's
                        blockchain traceability
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadQRCode(
                            crop.traceabilityQrCode!,
                            `${crop.name}-qr.png`
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={shareCrop}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No QR code available
                    </p>
                    <Button
                      onClick={handleGenerateQR}
                      disabled={isGeneratingQR}
                    >
                      {isGeneratingQR ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Quick Observation Dialog */}
      {crop && (
        <QuickObservationDialog
          isOpen={isQuickObservationOpen}
          onOpenChange={setIsQuickObservationOpen}
          preselectedCropId={crop.id}
        />
      )}
    </Dialog>
  );
}
