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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Stages & Milestones</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Data</TabsTrigger>
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
                ) : traceEvents.length > 0 ? (
                  <div className="space-y-4">
                    {traceEvents.map((event, index) => (
                      <div key={event.id} className="flex items-start gap-4">
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
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No events recorded yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Events will appear here as you track crop activities
                    </p>
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
    </Dialog>
  );
}
