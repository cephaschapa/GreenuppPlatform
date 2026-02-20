import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Sprout, Edit, PlusCircle, ChevronRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
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
  const [location] = useLocation();
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const basePath = location.split("?")[0];
  const simsPath = (planId: number) => `${basePath}/${field.id}/plans/${planId}/sims`;

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const r = await fetch(`/api/fields/${field.id}/crop-plans/${planId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Failed to delete plan");
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${field.id}/crop-plans`] });
      toast({ title: "Crop plan deleted" });
    },
    onError: (e: Error) => {
      toast({ title: "Could not delete plan", description: e.message, variant: "destructive" });
    },
  });

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
                Plan crops and varieties per season; click a plan to run and view yield simulations
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Link href={simsPath(plan.id)} className="min-w-0 flex-1 block">
                    <a className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
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
                      <span className="shrink-0 text-muted-foreground flex items-center gap-1 text-sm">
                        View sims
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </a>
                  </Link>
                  <div className="shrink-0 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
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
                      className="gap-1 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(`Delete this crop plan (${plan.cropName}, ${plan.seasonName})? This cannot be undone.`)) {
                          deletePlanMutation.mutate(plan.id);
                        }
                      }}
                      disabled={deletePlanMutation.isPending}
                      title="Delete plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
