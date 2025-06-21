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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Stethoscope,
  CheckCircle,
  Circle,
  Droplets,
  Leaf,
  Shield,
  TrendingUp,
  Camera,
  DollarSign,
  Loader2,
  AlertTriangle,
  Sparkles,
  Brain,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TreatmentPlanMarketplace } from "./TreatmentPlanMarketplace";

interface CollapsibleTreatmentPlanProps {
  analysisId: number;
  diseaseDetected?: string;
  plantType?: string;
}

export function CollapsibleTreatmentPlan({
  analysisId,
  diseaseDetected,
  plantType,
}: CollapsibleTreatmentPlanProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [useAI, setUseAI] = useState(true);
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
  const { data: treatmentProgress = [] } = useQuery({
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

  // Generate treatment plan mutation
  const { mutate: generateTreatmentPlan, isPending: isGenerating } =
    useMutation({
      mutationFn: async ({
        analysisId,
        useAI,
      }: {
        analysisId: number;
        useAI: boolean;
      }) => {
        const response = await fetch("/api/treatment-plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId, useAI }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to generate treatment plan");
        }
        return response.json();
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["treatment-plan", analysisId],
        });
        const method = data.aiGenerated ? "AI-powered" : "rule-based";
        toast({
          title: "Treatment Plan Generated",
          description: `Your ${method} treatment plan has been created successfully.`,
        });
        setIsExpanded(true);
      },
      onError: (error: any) => {
        if (error.message.includes("already exists")) {
          toast({
            title: "Treatment Plan Exists",
            description: "A treatment plan already exists for this analysis.",
          });
          queryClient.invalidateQueries({
            queryKey: ["treatment-plan", analysisId],
          });
          setIsExpanded(true);
        } else {
          toast({
            title: "Generation Failed",
            description: error.message || "Failed to generate treatment plan",
            variant: "destructive",
          });
        }
      },
    });

  // Update step completion mutation
  const updateStepCompletionMutation = useMutation({
    mutationFn: async ({
      stepId,
      isCompleted,
    }: {
      stepId: number;
      isCompleted: boolean;
    }) => {
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
    },
  });

  // Calculate progress
  const completedSteps = treatmentSteps.filter((step: any) => step.isCompleted);
  const progressPercentage =
    treatmentSteps.length > 0
      ? (completedSteps.length / treatmentSteps.length) * 100
      : 0;

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

  if (isLoadingPlan) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!treatmentPlan) {
    return (
      <div className="mt-4 space-y-3">
        {/* AI Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <Label htmlFor="ai-toggle" className="text-sm font-medium">
              Use AI Generation
            </Label>
          </div>
          <Switch id="ai-toggle" checked={useAI} onCheckedChange={setUseAI} />
        </div>

        <Button
          variant="outline"
          onClick={() => generateTreatmentPlan({ analysisId, useAI })}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating {useAI ? "AI" : "Rule-based"} Treatment Plan...
            </>
          ) : (
            <>
              {useAI ? (
                <Sparkles className="mr-2 h-4 w-4" />
              ) : (
                <Stethoscope className="mr-2 h-4 w-4" />
              )}
              Get {useAI ? "AI-Powered" : "Rule-based"} Treatment Plan
            </>
          )}
        </Button>

        {useAI && (
          <p className="text-xs text-muted-foreground text-center">
            AI-powered plans provide personalized recommendations based on your
            specific conditions
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Treatment Plan Header */}
      <div
        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {treatmentPlan.aiGenerated ? (
            <Sparkles className="h-5 w-5 text-primary" />
          ) : (
            <Stethoscope className="h-5 w-5 text-primary" />
          )}
          <div>
            <h4 className="font-medium text-sm">Treatment Plan</h4>
            <p className="text-xs text-muted-foreground">
              {treatmentPlan.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {treatmentPlan.severity}
          </Badge>
          {treatmentPlan.aiGenerated && (
            <Badge
              variant="secondary"
              className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Plan Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Plan Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {treatmentPlan.status}
                  </Badge>
                  {treatmentPlan.aiGenerated && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium">Disease:</p>
                  <p className="text-muted-foreground">
                    {treatmentPlan.diseaseType}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Duration:</p>
                  <p className="text-muted-foreground">
                    {treatmentPlan.estimatedDuration} days
                  </p>
                </div>
              </div>
              {treatmentPlan.description && (
                <p className="text-xs text-muted-foreground mt-2">
                  {treatmentPlan.description}
                </p>
              )}

              {/* AI-specific information */}
              {treatmentPlan.aiGenerated && treatmentPlan.recommendations && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-2">
                    AI Recommendations:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {treatmentPlan.recommendations.map(
                      (rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {treatmentPlan.aiGenerated && treatmentPlan.warnings && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-2 text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Important Warnings:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {treatmentPlan.warnings.map(
                      (warning: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          {warning}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Estimate (AI only) */}
          {treatmentPlan.aiGenerated && treatmentPlan.costEstimate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Estimate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Estimated Cost:
                    </span>
                    <span className="text-sm font-bold">
                      {treatmentPlan.costEstimate.currency}{" "}
                      {treatmentPlan.costEstimate.total}
                    </span>
                  </div>
                  {treatmentPlan.costEstimate.breakdown && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Breakdown:</p>
                      <ul className="space-y-1">
                        {treatmentPlan.costEstimate.breakdown.map(
                          (item: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Completed Steps</span>
                  <span>
                    {completedSteps.length} / {treatmentSteps.length}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(progressPercentage)}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Treatment Steps</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingSteps ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : treatmentSteps.length === 0 ? (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No treatment steps
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {treatmentSteps.map((step: any) => (
                    <div
                      key={step.id}
                      className={cn(
                        "border rounded-lg p-3 transition-colors",
                        step.isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-background border-border"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="flex items-center gap-1 mt-0.5">
                            {step.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs font-medium text-muted-foreground">
                              Step {step.stepNumber}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm">
                                {step.title}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {getTreatmentTypeIcon(step.treatmentType)}
                                {step.treatmentType}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {step.description}
                            </p>
                            {step.productName && (
                              <div className="text-xs text-muted-foreground mb-1">
                                <strong>Product:</strong> {step.productName}
                                {step.dosage && ` • ${step.dosage}`}
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {step.frequency && (
                                <span>Freq: {step.frequency}</span>
                              )}
                              {step.duration && (
                                <span>Dur: {step.duration} apps</span>
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
                        <Checkbox
                          checked={step.isCompleted || false}
                          onCheckedChange={(checked) => {
                            updateStepCompletionMutation.mutate({
                              stepId: step.id,
                              isCompleted: checked as boolean,
                            });
                          }}
                        />
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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {treatmentProgress.slice(0, 3).map((progress: any) => (
                    <div key={progress.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-xs">
                            {format(
                              new Date(progress.applicationDate),
                              "MMM dd"
                            )}
                          </p>
                          {progress.appliedDosage && (
                            <p className="text-xs text-muted-foreground">
                              Dosage: {progress.appliedDosage}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">Effect:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={cn(
                                  "w-2 h-2 rounded-full",
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
                        <p className="text-xs text-muted-foreground">
                          {progress.observations}
                        </p>
                      )}
                    </div>
                  ))}
                  {treatmentProgress.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{treatmentProgress.length - 3} more entries
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Marketplace Integration */}
          {treatmentPlan.marketplaceLinks && (
            <TreatmentPlanMarketplace
              marketplaceLinks={treatmentPlan.marketplaceLinks}
              diseaseName={diseaseDetected}
            />
          )}
        </div>
      )}
    </div>
  );
}
