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
  Shield,
  Eye,
  Edit,
  Send,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

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

  const handleSubmitUpdate = () => {
    if (!selectedOutbreak) {
      console.error("No outbreak selected");
      return;
    }

    if (!selectedOutbreak.id) {
      console.error("Selected outbreak has no ID:", selectedOutbreak);
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
    </div>
  );
}
