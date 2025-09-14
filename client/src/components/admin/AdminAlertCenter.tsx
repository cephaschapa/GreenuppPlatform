import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  // AlertTriangle,
  CloudRain,
  Bug,
  Megaphone,
  Zap,
  Users,
  Mail,
  Smartphone,
  Bell,
  Eye,
  Send,
  // Template,
  Target,
  // Clock,
  // MapPin,
  // UserCheck,
} from "lucide-react";

interface AlertTemplate {
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  actionUrl?: string;
}

interface AlertFormData {
  type:
    | "pest_infestation"
    | "weather_alert"
    | "general_announcement"
    | "emergency";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  targeting: {
    sendToAll: boolean;
    roles: string[];
    locations: string[];
    specificUsers: number[];
  };
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  actionUrl: string;
  expiresAt: string;
}

const alertTypeConfig = {
  pest_infestation: {
    label: "Pest Infestation",
    icon: Bug,
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "Alert farmers about pest outbreaks and infestations",
  },
  weather_alert: {
    label: "Weather Alert",
    icon: CloudRain,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Send weather warnings and advisories",
  },
  general_announcement: {
    label: "General Announcement",
    icon: Megaphone,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Share updates, news, and general information",
  },
  emergency: {
    label: "Emergency Alert",
    icon: Zap,
    color: "text-red-700",
    bgColor: "bg-red-100",
    description: "Critical emergency notifications",
  },
};

const severityConfig = {
  low: { label: "Low", color: "bg-green-100 text-green-800", priority: "📗" },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
    priority: "📙",
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-800",
    priority: "📕",
  },
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-800",
    priority: "🚨",
  },
};

export function AdminAlertCenter() {
  const [formData, setFormData] = useState<AlertFormData>({
    type: "general_announcement",
    title: "",
    message: "",
    severity: "medium",
    targeting: {
      sendToAll: true,
      roles: [],
      locations: [],
      specificUsers: [],
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
    },
    actionUrl: "",
    expiresAt: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Fetch alert templates
  const { data: templates } = useQuery({
    queryKey: ["/api/admin/alerts/templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/alerts/templates");
      return response.json();
    },
  });

  // Send alert mutation
  const sendAlertMutation = useMutation({
    mutationFn: async (alertData: AlertFormData) => {
      const response = await apiRequest(
        "POST",
        "/api/admin/alerts/send",
        alertData
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Alert Sent Successfully! 🎉",
        description: data.message,
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Alert",
        description:
          error.message || "An error occurred while sending the alert",
        variant: "destructive",
      });
    },
  });

  // Preview targets mutation
  const previewTargetsMutation = useMutation({
    mutationFn: async (targeting: AlertFormData["targeting"]) => {
      const response = await apiRequest(
        "POST",
        "/api/admin/alerts/preview-targets",
        { targeting }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewData(data.preview);
      setShowPreview(true);
    },
  });

  const resetForm = () => {
    setFormData({
      type: "general_announcement",
      title: "",
      message: "",
      severity: "medium",
      targeting: {
        sendToAll: true,
        roles: [],
        locations: [],
        specificUsers: [],
      },
      channels: {
        inApp: true,
        email: true,
        sms: false,
      },
      actionUrl: "",
      expiresAt: "",
    });
  };

  const handleTemplateSelect = (template: AlertTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      severity: template.severity,
      actionUrl: template.actionUrl || "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.channels.inApp &&
      !formData.channels.email &&
      !formData.channels.sms
    ) {
      toast({
        title: "No Delivery Channels Selected",
        description: "Please select at least one delivery channel",
        variant: "destructive",
      });
      return;
    }

    sendAlertMutation.mutate(formData);
  };

  const currentTypeConfig = alertTypeConfig[formData.type];
  const TypeIcon = currentTypeConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Center</h2>
          <p className="text-muted-foreground">
            Send targeted alerts and announcements to your users
          </p>
        </div>
        <Button variant="outline" onClick={resetForm}>
          Reset Form
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose Alert</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            {/* Alert Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TypeIcon className={`h-5 w-5 ${currentTypeConfig.color}`} />
                  Alert Type & Severity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(alertTypeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.type === key
                            ? `border-primary ${config.bgColor}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, type: key as any }))
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-6 w-6 ${config.color}`} />
                          <div>
                            <h3 className="font-medium">{config.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {config.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{config.priority}</span>
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Alert Content */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Alert Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter alert title..."
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Alert Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Enter your alert message..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.message.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                  <Input
                    id="actionUrl"
                    value={formData.actionUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actionUrl: e.target.value,
                      }))
                    }
                    placeholder="/farmer/{USER_ID}/dashboard"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{USER_ID}"} placeholder for dynamic user URLs
                  </p>
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Delivery Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inApp"
                      checked={formData.channels.inApp}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          channels: { ...prev.channels, inApp: !!checked },
                        }))
                      }
                    />
                    <Bell className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="inApp" className="flex-1">
                      In-App Notification
                      <span className="text-xs text-muted-foreground block">
                        Show in user's notification center
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={formData.channels.email}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          channels: { ...prev.channels, email: !!checked },
                        }))
                      }
                    />
                    <Mail className="h-4 w-4 text-green-600" />
                    <Label htmlFor="email" className="flex-1">
                      Email Notification
                      <span className="text-xs text-muted-foreground block">
                        Send professional email with alert details
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={formData.channels.sms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          channels: { ...prev.channels, sms: !!checked },
                        }))
                      }
                    />
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <Label htmlFor="sms" className="flex-1">
                      SMS Notification
                      <span className="text-xs text-muted-foreground block">
                        Send text message (users must have SMS enabled)
                      </span>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target Audience
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      previewTargetsMutation.mutate(formData.targeting)
                    }
                    disabled={previewTargetsMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Targets
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendToAll"
                    checked={formData.targeting.sendToAll}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        targeting: { ...prev.targeting, sendToAll: !!checked },
                      }))
                    }
                  />
                  <Users className="h-4 w-4 text-blue-600" />
                  <Label htmlFor="sendToAll">Send to All Users</Label>
                </div>

                {!formData.targeting.sendToAll && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div>
                        <Label>Target by User Role</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {["farmer", "buyer", "seller"].map((role) => (
                            <div
                              key={role}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`role-${role}`}
                                checked={formData.targeting.roles.includes(
                                  role
                                )}
                                onCheckedChange={(checked) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    targeting: {
                                      ...prev.targeting,
                                      roles: checked
                                        ? [...prev.targeting.roles, role]
                                        : prev.targeting.roles.filter(
                                            (r) => r !== role
                                          ),
                                    },
                                  }));
                                }}
                              />
                              <Label
                                htmlFor={`role-${role}`}
                                className="capitalize"
                              >
                                {role}s
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="locations">Target by Location</Label>
                        <Input
                          id="locations"
                          placeholder="Enter locations separated by commas"
                          value={formData.targeting.locations.join(", ")}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              targeting: {
                                ...prev.targeting,
                                locations: e.target.value
                                  .split(",")
                                  .map((l) => l.trim())
                                  .filter(Boolean),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {templates &&
              Object.entries(templates.templates).map(
                ([type, typeTemplates]: [string, any]) => {
                  const config =
                    alertTypeConfig[type as keyof typeof alertTypeConfig];
                  if (!config) return null;

                  const Icon = config.icon;

                  return (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${config.color}`} />
                          {config.label} Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {typeTemplates.map(
                            (template: AlertTemplate, index: number) => (
                              <div
                                key={index}
                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    type: type as any,
                                  }));
                                  handleTemplateSelect(template);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">
                                    {template.title}
                                  </h4>
                                  <Badge
                                    className={
                                      severityConfig[template.severity].color
                                    }
                                  >
                                    {severityConfig[template.severity].priority}{" "}
                                    {severityConfig[template.severity].label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {template.message}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
          </TabsContent>
        </Tabs>

        {/* Send Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => previewTargetsMutation.mutate(formData.targeting)}
            disabled={previewTargetsMutation.isPending}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Recipients
          </Button>
          <Button
            type="submit"
            disabled={sendAlertMutation.isPending}
            className="min-w-32"
          >
            {sendAlertMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Alert
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Target Preview</DialogTitle>
            <DialogDescription>
              Here's who will receive this alert
            </DialogDescription>
          </DialogHeader>
          {previewData && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {previewData.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Recipients
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Breakdown by Role:</h4>
                {Object.entries(previewData.roleBreakdown).map(
                  ([role, count]: [string, any]) => (
                    <div key={role} className="flex justify-between text-sm">
                      <span className="capitalize">{role}s:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                )}
              </div>

              {previewData.sampleUsers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Sample Recipients:</h4>
                  <div className="space-y-1">
                    {previewData.sampleUsers.map((user: any) => (
                      <div
                        key={user.id}
                        className="text-xs text-muted-foreground"
                      >
                        {user.email} ({user.role})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
