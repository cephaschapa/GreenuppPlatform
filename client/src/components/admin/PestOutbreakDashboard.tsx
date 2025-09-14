import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Bug,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  Activity,
  // Shield,
  Eye,
  Edit,
  Send,
  // BarChart3,
  // Clock,
  CheckCircle,
  XCircle,
  // AlertCircle,
} from "lucide-react";

interface PestReport {
  id: number;
  userId: number;
  pestDiseaseId: number;
  location: string;
  coordinates?: any;
  severity: string;
  confidence: number;
  affectedArea?: number;
  cropType: string;
  growthStage: string;
  weatherConditions?: string;
  images: string[];
  symptoms: string[];
  farmerNotes?: string;
  reportedAt: string;
  farmer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  farmDetails?: {
    farmName?: string;
    farmLocation?: string;
    farmSize?: number;
  };
}

interface PestOutbreak {
  id: number;
  pestDiseaseId: number;
  locationArea: string;
  severity: "isolated" | "localized" | "widespread" | "epidemic";
  status: "active" | "contained" | "resolved" | "monitoring";
  firstReportedAt: string;
  lastUpdatedAt: string;
  affectedFarms: number;
  estimatedLosses?: number;
  containmentMeasures: string[];
  adminNotes?: string;
  alertLevel: "watch" | "advisory" | "warning" | "emergency";
  pestInfo: {
    name: string;
    scientificName?: string;
    category: string;
    riskLevel: string;
    affectedCrops: string[];
    economicImpact: string;
    spreadRate: string;
  };
  recentReports?: PestReport[];
}

interface OutbreakStats {
  activeOutbreaks: number;
  criticalOutbreaks: number;
  reportsThisWeek: number;
}

const severityConfig = {
  isolated: {
    label: "Isolated",
    color: "bg-blue-100 text-blue-800",
    icon: "📍",
  },
  localized: {
    label: "Localized",
    color: "bg-yellow-100 text-yellow-800",
    icon: "🟡",
  },
  widespread: {
    label: "Widespread",
    color: "bg-orange-100 text-orange-800",
    icon: "🟠",
  },
  epidemic: { label: "Epidemic", color: "bg-red-100 text-red-800", icon: "🔴" },
};

const statusConfig = {
  active: { label: "Active", color: "bg-red-100 text-red-800", icon: "🚨" },
  contained: {
    label: "Contained",
    color: "bg-yellow-100 text-yellow-800",
    icon: "⚠️",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
  monitoring: {
    label: "Monitoring",
    color: "bg-blue-100 text-blue-800",
    icon: "👁️",
  },
};

const alertLevelConfig = {
  watch: { label: "Watch", color: "bg-gray-100 text-gray-800", priority: "📗" },
  advisory: {
    label: "Advisory",
    color: "bg-blue-100 text-blue-800",
    priority: "📘",
  },
  warning: {
    label: "Warning",
    color: "bg-orange-100 text-orange-800",
    priority: "📙",
  },
  emergency: {
    label: "Emergency",
    color: "bg-red-100 text-red-800",
    priority: "🚨",
  },
};

export function PestOutbreakDashboard() {
  const [selectedOutbreak, setSelectedOutbreak] = useState<PestOutbreak | null>(
    null
  );
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    containmentMeasures: [] as string[],
  });

  const queryClient = useQueryClient();

  // Fetch outbreak statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/pest-outbreaks/stats"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/api/admin/pest-outbreaks/stats"
      );
      return response.json() as Promise<OutbreakStats>;
    },
  });

  // Fetch active outbreaks
  const { data: outbreaks, isLoading: outbreaksLoading } = useQuery({
    queryKey: ["/api/admin/pest-outbreaks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/pest-outbreaks");
      return response.json() as Promise<PestOutbreak[]>;
    },
  });

  // Update outbreak mutation
  const updateOutbreakMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest(
        "PUT",
        `/api/admin/pest-outbreaks/${id}`,
        updates
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Outbreak Updated",
        description: "Outbreak status has been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pest-outbreaks"],
      });
      setShowUpdateDialog(false);
      setSelectedOutbreak(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update outbreak",
        variant: "destructive",
      });
    },
  });

  // Send alert mutation
  const sendAlertMutation = useMutation({
    mutationFn: async (outbreakId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/pest-outbreaks/${outbreakId}/alert`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert Sent",
        description: "Emergency alert has been sent to affected farmers.",
      });
    },
  });

  const handleUpdateOutbreak = (outbreak: PestOutbreak) => {
    setSelectedOutbreak(outbreak);
    setUpdateForm({
      status: outbreak.status,
      adminNotes: outbreak.adminNotes || "",
      containmentMeasures: outbreak.containmentMeasures || [],
    });
    setShowUpdateDialog(true);
  };

  const handleViewDetails = (outbreak: PestOutbreak) => {
    setSelectedOutbreak(outbreak);
    setShowDetailsDialog(true);
  };

  const handleSubmitUpdate = () => {
    if (!selectedOutbreak) {
      // console.error("No outbreak selected");
      return;
    }

    if (!selectedOutbreak.id) {
      // console.error("Selected outbreak has no ID:", selectedOutbreak);
      toast({
        title: "Update Failed",
        description: "Outbreak ID is missing. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    updateOutbreakMutation.mutate({
      id: selectedOutbreak.id,
      updates: updateForm,
    });
  };

  if (statsLoading || outbreaksLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pest Outbreak Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage pest/disease outbreaks across the platform
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Outbreaks
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeOutbreaks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Outbreaks
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.criticalOutbreaks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reports This Week
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.reportsThisWeek || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              New pest/disease reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Outbreaks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Active Outbreaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pest/Disease</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alert Level</TableHead>
                  <TableHead>Affected Farms</TableHead>
                  <TableHead>First Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outbreaks?.map((outbreak) => (
                  <TableRow key={outbreak.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {outbreak.pestInfo.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {outbreak.pestInfo.category} •{" "}
                          {outbreak.pestInfo.riskLevel} risk
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {outbreak.locationArea}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          severityConfig[outbreak.severity]?.color ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {severityConfig[outbreak.severity]?.icon || "❓"}{" "}
                        {severityConfig[outbreak.severity]?.label ||
                          outbreak.severity ||
                          "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusConfig[outbreak.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {statusConfig[outbreak.status]?.icon || "❓"}{" "}
                        {statusConfig[outbreak.status]?.label ||
                          outbreak.status ||
                          "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          alertLevelConfig[outbreak.alertLevel]?.color ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {alertLevelConfig[outbreak.alertLevel]?.priority ||
                          "❓"}{" "}
                        {alertLevelConfig[outbreak.alertLevel]?.label ||
                          outbreak.alertLevel ||
                          "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {outbreak.affectedFarms}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(
                          outbreak.firstReportedAt
                        ).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(outbreak)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateOutbreak(outbreak)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {(outbreak.alertLevel === "warning" ||
                          outbreak.alertLevel === "emergency") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              sendAlertMutation.mutate(outbreak.id)
                            }
                            disabled={sendAlertMutation.isPending}
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!outbreaks || outbreaks.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>No active outbreaks detected</div>
                        <div className="text-sm">
                          The automated monitoring system is working well!
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update Outbreak Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Outbreak Status</DialogTitle>
            <DialogDescription>
              Update the status and management notes for{" "}
              {selectedOutbreak?.pestInfo.name} outbreak in{" "}
              {selectedOutbreak?.locationArea}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(value) =>
                  setUpdateForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">🚨 Active</SelectItem>
                  <SelectItem value="contained">⚠️ Contained</SelectItem>
                  <SelectItem value="monitoring">👁️ Monitoring</SelectItem>
                  <SelectItem value="resolved">✅ Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={updateForm.adminNotes}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    adminNotes: e.target.value,
                  }))
                }
                placeholder="Add management notes, containment progress, or other relevant information..."
                rows={4}
              />
            </div>

            <div>
              <Label>Containment Measures</Label>
              <div className="space-y-2">
                {updateForm.containmentMeasures.map((measure, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={measure}
                      onChange={(e) => {
                        const newMeasures = [...updateForm.containmentMeasures];
                        newMeasures[index] = e.target.value;
                        setUpdateForm((prev) => ({
                          ...prev,
                          containmentMeasures: newMeasures,
                        }));
                      }}
                      placeholder="Enter containment measure..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newMeasures =
                          updateForm.containmentMeasures.filter(
                            (_, i) => i !== index
                          );
                        setUpdateForm((prev) => ({
                          ...prev,
                          containmentMeasures: newMeasures,
                        }));
                      }}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUpdateForm((prev) => ({
                      ...prev,
                      containmentMeasures: [...prev.containmentMeasures, ""],
                    }));
                  }}
                >
                  Add Measure
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              disabled={updateOutbreakMutation.isPending}
            >
              {updateOutbreakMutation.isPending
                ? "Updating..."
                : "Update Outbreak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outbreak Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              {selectedOutbreak?.pestInfo.name} Outbreak Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this pest outbreak and related reports
            </DialogDescription>
          </DialogHeader>

          {selectedOutbreak && (
            <div className="space-y-6">
              {/* Outbreak Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Outbreak Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Location:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedOutbreak.locationArea}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Severity:
                      </span>
                      <Badge
                        className={
                          severityConfig[selectedOutbreak.severity]?.color ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {severityConfig[selectedOutbreak.severity]?.icon ||
                          "❓"}{" "}
                        {severityConfig[selectedOutbreak.severity]?.label ||
                          selectedOutbreak.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge
                        className={
                          statusConfig[selectedOutbreak.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {statusConfig[selectedOutbreak.status]?.icon || "❓"}{" "}
                        {statusConfig[selectedOutbreak.status]?.label ||
                          selectedOutbreak.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Affected Farms:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedOutbreak.affectedFarms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        First Reported:
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(
                          selectedOutbreak.firstReportedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pest Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Scientific Name:
                      </span>
                      <span className="text-sm font-medium italic">
                        {selectedOutbreak.pestInfo.scientificName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Category:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedOutbreak.pestInfo.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Risk Level:
                      </span>
                      <Badge
                        variant={
                          selectedOutbreak.pestInfo.riskLevel === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {selectedOutbreak.pestInfo.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Economic Impact:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedOutbreak.pestInfo.economicImpact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Spread Rate:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedOutbreak.pestInfo.spreadRate}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reports */}
              {selectedOutbreak.recentReports &&
                selectedOutbreak.recentReports.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Recent Reports ({selectedOutbreak.recentReports.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOutbreak.recentReports.map((report, index) => (
                          <div
                            key={report.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            {/* Report Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">
                                  Report #{report.id} -{" "}
                                  {report.farmer?.firstName}{" "}
                                  {report.farmer?.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(report.reportedAt).toLocaleString()}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {report.confidence}% confidence
                              </Badge>
                            </div>

                            {/* Farm Details */}
                            {report.farmDetails && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                {report.farmDetails.farmName && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Farm:
                                    </span>{" "}
                                    {report.farmDetails.farmName}
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">
                                    Crop:
                                  </span>{" "}
                                  {report.cropType}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Growth Stage:
                                  </span>{" "}
                                  {report.growthStage}
                                </div>
                                {report.farmDetails.farmSize && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Farm Size:
                                    </span>{" "}
                                    {report.farmDetails.farmSize} acres
                                  </div>
                                )}
                                {report.affectedArea && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Affected Area:
                                    </span>{" "}
                                    {report.affectedArea} sq m
                                  </div>
                                )}
                                {report.weatherConditions && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Weather:
                                    </span>{" "}
                                    {report.weatherConditions}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Symptoms */}
                            {report.symptoms && report.symptoms.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Symptoms:
                                </div>
                                <div className="text-xs">
                                  {report.symptoms.join(", ")}
                                </div>
                              </div>
                            )}

                            {/* Farmer Notes */}
                            {report.farmerNotes && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                  Farmer Notes:
                                </div>
                                <div className="text-xs italic">
                                  "{report.farmerNotes}"
                                </div>
                              </div>
                            )}

                            {/* Images */}
                            {report.images && report.images.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                  Images ({report.images.length}):
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {report.images
                                    .slice(0, 4)
                                    .map((image, imgIndex) => (
                                      <div key={imgIndex} className="relative">
                                        <img
                                          src={image}
                                          alt={`Report ${report.id} - Image ${
                                            imgIndex + 1
                                          }`}
                                          className="w-full h-20 object-cover rounded border"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                          }}
                                        />
                                      </div>
                                    ))}
                                  {report.images.length > 4 && (
                                    <div className="w-full h-20 flex items-center justify-center bg-gray-100 rounded border text-xs text-muted-foreground">
                                      +{report.images.length - 4} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Containment Measures */}
              {selectedOutbreak.containmentMeasures &&
                selectedOutbreak.containmentMeasures.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Containment Measures
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {selectedOutbreak.containmentMeasures.map(
                          (measure, index) => (
                            <li
                              key={index}
                              className="text-sm flex items-start gap-2"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {measure}
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Admin Notes */}
              {selectedOutbreak.adminNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOutbreak.adminNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
            {selectedOutbreak && (
              <Button
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleUpdateOutbreak(selectedOutbreak);
                }}
              >
                Update Outbreak
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
