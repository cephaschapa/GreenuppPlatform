import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calculator, ArrowLeft, Sprout, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface PlanRow {
  id: number;
  fieldId: number;
  cropName: string;
  seasonName: string;
  varietyName?: string | null;
  varietyCode?: string | null;
  companyName?: string | null;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  targetAreaHa?: string | null;
  managementLevel?: string | null;
}

interface SimulationRun {
  id: number;
  fieldCropPlanId: number;
  runAt: string;
  methodVersion: string;
  outputs?: {
    conservative?: number;
    expected?: number;
    best_case?: number;
    areaHa?: number;
    totalConservative?: number;
    totalExpected?: number;
    totalBestCase?: number;
  };
  explanation?: string | null;
}

function formatDate(s: string | null | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

export default function CropPlanSimsPage() {
  const params = useParams<{ fieldId: string; planId: string }>();
  const [location] = useLocation();
  const { toast } = useToast();
  const { fieldId, planId } = params;
  const userId = location.split("/")[2];
  const planIdNum = planId ? parseInt(planId, 10) : NaN;
  const basePath = userId ? `/farmer/${userId}/fields` : "/farmer";
  const backUrl = `${basePath}?field=${fieldId}`;

  const { data: plan, isLoading: planLoading, error: planError } = useQuery<PlanRow>({
    queryKey: ["/api/crop-plans", planId],
    queryFn: async () => {
      const r = await fetch(`/api/crop-plans/${planId}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch plan");
      return r.json();
    },
    enabled: Boolean(planId) && !Number.isNaN(planIdNum),
  });

  const { data: runs = [], isLoading: runsLoading } = useQuery<SimulationRun[]>({
    queryKey: ["/api/crop-plans", planId, "simulation-runs"],
    queryFn: async () => {
      const r = await fetch(`/api/crop-plans/${planId}/simulation-runs`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch runs");
      return r.json();
    },
    enabled: Boolean(planId) && !Number.isNaN(planIdNum),
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/crop-plans/${planId}/simulate-yield`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : "Simulation failed");
      }
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crop-plans", planId, "simulation-runs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${fieldId}/crop-plans`] });
      toast({ title: "Yield simulation complete", description: "New run added to the list below." });
    },
    onError: (e: Error) => {
      toast({ title: "Yield simulation failed", description: e.message, variant: "destructive" });
    },
  });

  const deleteRunMutation = useMutation({
    mutationFn: async (runId: number) => {
      const r = await fetch(`/api/crop-plans/${planId}/simulation-runs/${runId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Failed to delete run");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crop-plans", planId, "simulation-runs"] });
      toast({ title: "Simulation run deleted" });
    },
    onError: (e: Error) => {
      toast({ title: "Could not delete run", description: e.message, variant: "destructive" });
    },
  });

  if (!userId || !fieldId || !planId || Number.isNaN(planIdNum)) {
    return (
      <DashboardLayout title="Yield simulations">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Invalid plan. <Link href={basePath}><a className="text-primary underline">Back to Fields</a></Link></p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (planError || (plan === undefined && !planLoading)) {
    return (
      <DashboardLayout title="Yield simulations">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Could not load this crop plan. <Link href={basePath}><a className="text-primary underline">Back to Fields</a></Link></p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={plan ? `Yield simulations – ${plan.cropName}, ${plan.seasonName}` : "Yield simulations"}
      description="Run and view yield simulations for this crop plan"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href={backUrl}>
            <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to field
            </a>
          </Link>
        </div>

        {planLoading || !plan ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{plan.cropName} · {plan.seasonName}</CardTitle>
                    <CardDescription>
                      {plan.varietyName ? (
                        <span>
                          {plan.varietyName}
                          {plan.varietyCode && ` (${plan.varietyCode})`}
                          {plan.companyName && ` · ${plan.companyName}`}
                        </span>
                      ) : (
                        "No variety selected"
                      )}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      Plant: {formatDate(plan.plantingDate)} · Harvest: {formatDate(plan.expectedHarvestDate)}
                      {plan.targetAreaHa && ` · ${plan.targetAreaHa} ha`}
                    </p>
                  </div>
                  <Button
                    onClick={() => simulateMutation.mutate()}
                    disabled={simulateMutation.isPending}
                    className="gap-2"
                  >
                    {simulateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4" />
                    )}
                    Simulate yield
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">All runs</CardTitle>
                <CardDescription>
                  Simulation history for this plan. New runs appear at the top.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {runsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : runs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sprout className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No simulation runs yet</p>
                    <p className="text-sm">Click &quot;Simulate yield&quot; above to run your first simulation.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {runs.map((run) => (
                      <li
                        key={run.id}
                        className="rounded-lg border bg-muted/30 p-4 text-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-muted-foreground text-xs font-medium">
                            {formatDate(run.runAt)} · {run.methodVersion}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 gap-1 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (window.confirm("Delete this simulation run? This cannot be undone.")) {
                                deleteRunMutation.mutate(run.id);
                              }
                            }}
                            disabled={deleteRunMutation.isPending}
                            title="Delete run"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                        {run.outputs && (
                          <>
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div className="rounded border bg-background p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Conservative</p>
                                <p className="font-semibold text-lg">{run.outputs.conservative ?? "—"} t/ha</p>
                                {run.outputs.totalConservative != null && run.outputs.areaHa != null && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{run.outputs.totalConservative} t total</p>
                                )}
                              </div>
                              <div className="rounded border bg-primary/5 p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Expected</p>
                                <p className="font-semibold text-lg">{run.outputs.expected ?? "—"} t/ha</p>
                                {run.outputs.totalExpected != null && run.outputs.areaHa != null && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{run.outputs.totalExpected} t total</p>
                                )}
                              </div>
                              <div className="rounded border bg-background p-3">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Best case</p>
                                <p className="font-semibold text-lg">{run.outputs.best_case ?? "—"} t/ha</p>
                                {run.outputs.totalBestCase != null && run.outputs.areaHa != null && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{run.outputs.totalBestCase} t total</p>
                                )}
                              </div>
                            </div>
                            {run.outputs.areaHa != null && (
                              <p className="text-muted-foreground text-xs">
                                Based on {run.outputs.areaHa} ha (plan or field area).
                              </p>
                            )}
                          </>
                        )}
                        {run.explanation && (
                          <p className="text-muted-foreground text-xs border-t pt-2">{run.explanation}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
