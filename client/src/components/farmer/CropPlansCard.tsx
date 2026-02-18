import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Sprout, Calculator, Edit, PlusCircle, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Field } from "@shared/schema";
import {
  AddCropPlanDialog,
  type FieldCropPlanRow,
  type RefSeason,
} from "@/components/farmer/AddCropPlanDialog";

interface CropPlansCardProps {
  field: Field;
}

interface SimulationRun {
  id: number;
  fieldCropPlanId: number;
  runAt: string;
  methodVersion: string;
  outputs?: { conservative?: number; expected?: number; best_case?: number };
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

export function CropPlansCard({ field }: CropPlansCardProps) {
  const { toast } = useToast();
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [simulateResult, setSimulateResult] = useState<{
    conservative: number;
    expected: number;
    best_case: number;
    explanation: string;
  } | null>(null);
  const [runsPlanId, setRunsPlanId] = useState<number | null>(null);

  const { data: refSeasons = [] } = useQuery<RefSeason[]>({
    queryKey: ["/api/reference/seasons"],
    queryFn: async () => {
      const r = await fetch("/api/reference/seasons", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch seasons");
      return r.json();
    },
  });

  const { data: plans = [], isLoading } = useQuery<FieldCropPlanRow[]>({
    queryKey: [`/api/fields/${field.id}/crop-plans`, seasonFilter],
    queryFn: async () => {
      const url =
        seasonFilter === "all" || !seasonFilter
          ? `/api/fields/${field.id}/crop-plans`
          : `/api/fields/${field.id}/crop-plans?seasonId=${seasonFilter}`;
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch crop plans");
      return r.json();
    },
  });

  const { data: simulationRuns = [] } = useQuery<SimulationRun[]>({
    queryKey: [`/api/crop-plans/${runsPlanId}/simulation-runs`],
    queryFn: async () => {
      const r = await fetch(`/api/crop-plans/${runsPlanId}/simulation-runs`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch runs");
      return r.json();
    },
    enabled: runsPlanId != null,
  });

  const simulateMutation = useMutation({
    mutationFn: async (planId: number) => {
      const r = await fetch(`/api/crop-plans/${planId}/simulate-yield`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error ?? "Simulation failed");
      }
      return r.json();
    },
    onSuccess: (data: {
      run?: { fieldCropPlanId: number };
      outputs?: { conservative?: number; expected?: number; best_case?: number };
      explanation?: string;
    }) => {
      setSimulateResult({
        conservative: data.outputs?.conservative ?? 0,
        expected: data.outputs?.expected ?? 0,
        best_case: data.outputs?.best_case ?? 0,
        explanation: data.explanation ?? "",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${field.id}/crop-plans`] as const });
      if (data.run?.fieldCropPlanId != null) {
        queryClient.invalidateQueries({
          queryKey: [`/api/crop-plans/${data.run.fieldCropPlanId}/simulation-runs`],
        });
      }
    },
    onError: (e: Error) => {
      toast({ title: "Yield simulation failed", description: e.message, variant: "destructive" });
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Crop plans
              </CardTitle>
              <CardDescription>
                Plan crops and varieties per season; run yield simulations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All seasons</SelectItem>
                  {refSeasons.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AddCropPlanDialog
                field={field}
                trigger={
                  <Button size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add plan
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sprout className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No crop plans yet</p>
              <p className="text-xs">Add a plan to set crop, variety, and dates for a season</p>
              <AddCropPlanDialog
                field={field}
                trigger={
                  <Button variant="outline" size="sm" className="mt-3">
                    Add crop plan
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {plans.map((plan) => (
                <li
                  key={plan.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{plan.cropName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {plan.seasonName}
                      </Badge>
                      {plan.managementLevel && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {plan.managementLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {plan.varietyName ? (
                        <span>
                          {plan.varietyName}
                          {plan.varietyCode && ` (${plan.varietyCode})`}
                          {plan.companyName && ` · ${plan.companyName}`}
                        </span>
                      ) : (
                        <span>No variety selected</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0">
                      <span>Plant: {formatDate(plan.plantingDate)}</span>
                      <span>Harvest: {formatDate(plan.expectedHarvestDate)}</span>
                      {plan.targetAreaHa && (
                        <span>Area: {plan.targetAreaHa} ha</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AddCropPlanDialog
                      field={field}
                      plan={plan}
                      trigger={
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground"
                      onClick={() => setRunsPlanId(plan.id)}
                    >
                      <History className="h-3.5 w-3.5" />
                      Past runs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => simulateMutation.mutate(plan.id)}
                      disabled={simulateMutation.isPending}
                    >
                      {simulateMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Calculator className="h-3.5 w-3.5" />
                      )}
                      Simulate yield
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!simulateResult} onOpenChange={() => setSimulateResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yield simulation result</DialogTitle>
          </DialogHeader>
          {simulateResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Conservative</p>
                  <p className="text-lg font-semibold">{simulateResult.conservative} t/ha</p>
                </div>
                <div className="rounded-lg border p-3 bg-primary/5">
                  <p className="text-xs text-muted-foreground">Expected</p>
                  <p className="text-lg font-semibold">{simulateResult.expected} t/ha</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Best case</p>
                  <p className="text-lg font-semibold">{simulateResult.best_case} t/ha</p>
                </div>
              </div>
              {simulateResult.explanation && (
                <p className="text-sm text-muted-foreground">{simulateResult.explanation}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={runsPlanId != null} onOpenChange={(open) => !open && setRunsPlanId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Past yield simulations</DialogTitle>
          </DialogHeader>
          {runsPlanId != null && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {simulationRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No simulation runs yet for this plan.</p>
              ) : (
                simulationRuns.map((run) => (
                  <div
                    key={run.id}
                    className="rounded-lg border p-3 text-sm space-y-1"
                  >
                    <p className="text-muted-foreground text-xs">
                      {formatDate(run.runAt)} · {run.methodVersion}
                    </p>
                    {run.outputs && (
                      <p className="font-medium">
                        {run.outputs.conservative ?? "—"} / {run.outputs.expected ?? "—"} / {run.outputs.best_case ?? "—"} t/ha
                        <span className="text-muted-foreground font-normal text-xs ml-1">(conservative / expected / best)</span>
                      </p>
                    )}
                    {run.explanation && (
                      <p className="text-muted-foreground text-xs mt-1">{run.explanation}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
