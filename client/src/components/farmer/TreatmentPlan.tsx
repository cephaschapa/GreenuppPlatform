import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  FileText,
  Leaf,
  Droplets,
  Shield,
  DollarSign,
  CalendarDays,
  TrendingUp,
  Camera,
  Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  TreatmentStep,
  TreatmentProgress,
  TreatmentProduct,
} from "@shared/schema";
import { TreatmentStepForm } from "./TreatmentStepForm";
import { TreatmentProgressForm } from "./TreatmentProgressForm";

// Form schemas
const treatmentStepSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  treatmentType: z.enum(["chemical", "organic", "cultural", "biological"]),
  productName: z.string().optional(),
  activeIngredient: z.string().optional(),
  dosage: z.string().optional(),
  applicationMethod: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1"),
  safetyNotes: z.string().optional(),
  cost: z.number().optional(),
  costUnit: z.string().optional(),
});

const progressSchema = z.object({
  appliedDosage: z.string().optional(),
  weatherConditions: z.string().optional(),
  observations: z.string().optional(),
  effectiveness: z.number().min(1).max(5),
  notes: z.string().optional(),
});

interface TreatmentPlanProps {
  analysisId: number;
  diseaseDetected?: string;
  plantType?: string;
  onTreatmentComplete?: () => void;
}

export function TreatmentPlan({
  analysisId,
  diseaseDetected,
  plantType,
  onTreatmentComplete,
}: TreatmentPlanProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch treatment plan for this analysis
  const { data: treatmentPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ["treatment-plan", analysisId],
    queryFn: async () => {
      const response = await fetch(
        `/api/treatment-plans/analysis/${analysisId}`
      );
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch treatment plan");
      }
      return response.json();
    },
  });

  // Fetch treatment steps
  const { data: treatmentSteps = [], isLoading: isLoadingSteps } = useQuery({
    queryKey: ["treatment-steps", treatmentPlan?.id],
    queryFn: async () => {
      if (!treatmentPlan?.id) return [];
      const response = await fetch(
        `/api/treatment-plans/${treatmentPlan.id}/steps`
      );
      if (!response.ok) throw new Error("Failed to fetch treatment steps");
      return response.json();
    },
    enabled: !!treatmentPlan?.id,
  });

  // Fetch treatment progress
  const { data: treatmentProgress = [], isLoading: isLoadingProgress } =
    useQuery({
      queryKey: ["treatment-progress", treatmentPlan?.id],
      queryFn: async () => {
        if (!treatmentPlan?.id) return [];
        const response = await fetch(
          `/api/treatment-plans/${treatmentPlan.id}/progress`
        );
        if (!response.ok) throw new Error("Failed to fetch treatment progress");
        return response.json();
      },
      enabled: !!treatmentPlan?.id,
    });

  // Fetch recommended products
  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ["treatment-products", diseaseDetected, plantType],
    queryFn: async () => {
      if (!diseaseDetected || !plantType) return [];
      const response = await fetch(
        `/api/treatment-products?disease=${encodeURIComponent(
          diseaseDetected
        )}&crop=${encodeURIComponent(plantType)}`
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!diseaseDetected && !!plantType,
  });

  // Create treatment plan mutation
  const createTreatmentPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/treatment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create treatment plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treatment-plan", analysisId],
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "Treatment Plan Created",
        description: "Your treatment plan has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create treatment plan",
        variant: "destructive",
      });
    },
  });

  // Add treatment step mutation
  const addTreatmentStepMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `/api/treatment-plans/${treatmentPlan.id}/steps`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to add treatment step");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treatment-steps", treatmentPlan?.id],
      });
      toast({
        title: "Step Added",
        description: "Treatment step has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add treatment step",
        variant: "destructive",
      });
    },
  });

  // Update step completion mutation
  const updateStepCompletionMutation = useMutation({
    mutationFn: async (params: { stepId: number; isCompleted: boolean }) => {
      const { stepId, isCompleted } = params;
      const response = await fetch(`/api/treatment-steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted,
          completedDate: isCompleted ? new Date().toISOString() : null,
        }),
      });
      if (!response.ok) throw new Error("Failed to update step");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treatment-steps", treatmentPlan?.id],
      });
      toast({
        title: "Step Updated",
        description: "Treatment step has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update step",
        variant: "destructive",
      });
    },
  });

  // Add progress entry mutation
  const addProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `/api/treatment-steps/${selectedStepId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to add progress entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["treatment-progress", treatmentPlan?.id],
      });
      setIsProgressDialogOpen(false);
      setSelectedStepId(null);
      toast({
        title: "Progress Added",
        description: "Progress entry has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add progress entry",
        variant: "destructive",
      });
    },
  });

  // Calculate progress
  const completedSteps = treatmentSteps.filter(
    (step: TreatmentStep) => step.isCompleted
  ).length;
  const totalSteps = treatmentSteps.length;
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-yellow-100 text-yellow-800";
      case "moderate":
        return "bg-orange-100 text-orange-800";
      case "severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get treatment type icon
  const getTreatmentTypeIcon = (type: string) => {
    switch (type) {
      case "chemical":
        return <Droplets className="h-4 w-4" />;
      case "organic":
        return <Leaf className="h-4 w-4" />;
      case "cultural":
        return <Shield className="h-4 w-4" />;
      case "biological":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Auto-generate treatment plan
  const generateTreatmentPlan = () => {
    if (!diseaseDetected || !plantType) {
      toast({
        title: "Missing Information",
        description:
          "Disease and plant type are required to generate a treatment plan.",
        variant: "destructive",
      });
      return;
    }

    const estimatedDuration = diseaseDetected.toLowerCase().includes("severe")
      ? 21
      : 14;
    const severity = diseaseDetected.toLowerCase().includes("severe")
      ? "severe"
      : "moderate";

    createTreatmentPlanMutation.mutate({
      analysisId,
      title: `Treatment for ${diseaseDetected} on ${plantType}`,
      description: `Comprehensive treatment plan for ${diseaseDetected} affecting ${plantType}`,
      diseaseType: diseaseDetected,
      severity,
      estimatedDuration,
    });
  };

  if (isLoadingPlan) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading treatment plan...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!treatmentPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Treatment Plan
          </CardTitle>
          <CardDescription>
            Create a comprehensive treatment plan for the diagnosed disease
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Treatment Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {diseaseDetected
                ? `Create a treatment plan for ${diseaseDetected}`
                : "Create a treatment plan based on the diagnosis"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={generateTreatmentPlan}
                disabled={!diseaseDetected}
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate Treatment Plan
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Create Custom Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create Treatment Plan</DialogTitle>
                    <DialogDescription>
                      Create a custom treatment plan for the diagnosed disease
                    </DialogDescription>
                  </DialogHeader>
                  {/* Custom plan form would go here */}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => generateTreatmentPlan()}>
                      Create Plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treatment Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {treatmentPlan.title}
              </CardTitle>
              <CardDescription>{treatmentPlan.description}</CardDescription>
            </div>
            <Badge className={getSeverityColor(treatmentPlan.severity)}>
              {treatmentPlan.severity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-xs text-muted-foreground">
                  {treatmentPlan.estimatedDuration} days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Started</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(treatmentPlan.startDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-xs text-muted-foreground">
                  {completedSteps} of {totalSteps} steps
                </p>
              </div>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progressPercentage)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Treatment Steps */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Treatment Steps</CardTitle>
            {treatmentPlan && (
              <TreatmentStepForm
                planId={treatmentPlan.id}
                onStepAdded={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["treatment-steps", treatmentPlan.id],
                  });
                }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSteps ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : treatmentSteps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Treatment Steps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add treatment steps to your plan
              </p>
              {treatmentPlan && (
                <TreatmentStepForm
                  planId={treatmentPlan.id}
                  onStepAdded={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["treatment-steps", treatmentPlan.id],
                    });
                  }}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {treatmentSteps.map((step: TreatmentStep, index: number) => (
                <div
                  key={step.id}
                  className={cn(
                    "border rounded-lg p-4 transition-colors",
                    step.isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-background border-border"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2 mt-1">
                        {step.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">
                          Step {step.stepNumber}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{step.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getTreatmentTypeIcon(step.treatmentType)}
                            {step.treatmentType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {step.description}
                        </p>
                        {step.productName && (
                          <div className="text-xs text-muted-foreground mb-2">
                            <strong>Product:</strong> {step.productName}
                            {step.dosage && ` • ${step.dosage}`}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {step.frequency && (
                            <span>Frequency: {step.frequency}</span>
                          )}
                          {step.duration && (
                            <span>Duration: {step.duration} applications</span>
                          )}
                          {step.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {step.cost} {step.costUnit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={step.isCompleted || false}
                        onCheckedChange={(checked) => {
                          updateStepCompletionMutation.mutate({
                            stepId: step.id,
                            isCompleted: checked as boolean,
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStepId(step.id);
                          setIsProgressDialogOpen(true);
                        }}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Progress
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {treatmentProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>
              Track the effectiveness of your treatments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentProgress.map((progress: TreatmentProgress) => (
                <div key={progress.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {format(
                          new Date(progress.applicationDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {progress.appliedDosage &&
                          `Dosage: ${progress.appliedDosage}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Effectiveness:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={cn(
                              "w-3 h-3 rounded-full",
                              star <= (progress.effectiveness || 0)
                                ? "bg-green-500"
                                : "bg-gray-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {progress.observations && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {progress.observations}
                    </p>
                  )}
                  {progress.weatherConditions && (
                    <p className="text-xs text-muted-foreground">
                      Weather: {progress.weatherConditions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Products</CardTitle>
            <CardDescription>
              Products that may help with this treatment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedProducts.map((product: TreatmentProduct) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{product.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {product.productType}
                    </Badge>
                  </div>
                  {product.activeIngredient && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Active: {product.activeIngredient}
                    </p>
                  )}
                  {product.applicationRate && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Rate: {product.applicationRate}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.manufacturer}</span>
                    {product.price && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {product.price} {product.priceUnit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Dialog */}
      {selectedStepId && (
        <TreatmentProgressForm
          stepId={selectedStepId}
          isOpen={isProgressDialogOpen}
          onClose={() => {
            setIsProgressDialogOpen(false);
            setSelectedStepId(null);
          }}
          onProgressAdded={() => {
            queryClient.invalidateQueries({
              queryKey: ["treatment-progress", treatmentPlan?.id],
            });
          }}
        />
      )}
    </div>
  );
}
