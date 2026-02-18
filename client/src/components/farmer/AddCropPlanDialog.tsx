import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Field } from "@shared/schema";

export interface RefCrop {
  id: number;
  name: string;
  category: string | null;
}

export interface RefSeason {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SeedVarietyOption {
  id: number;
  name: string;
  code: string | null;
  maturityClass: string;
  daysToMaturityMin: number | null;
  daysToMaturityMax: number | null;
  yieldPotentialThaMin: number | null;
  yieldPotentialThaMax: number | null;
  companyName: string | null;
  recommended?: boolean;
  recommendationScore?: number;
  recommendationReasons?: string[];
}

export interface FieldCropPlanRow {
  id: number;
  fieldId: number;
  seasonId: number;
  cropId: number;
  seedVarietyId: number | null;
  targetAreaHa: string | null;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  managementLevel: string | null;
  cropName: string;
  seasonName: string;
  varietyName: string | null;
  varietyCode: string | null;
  companyName: string | null;
}

interface AddCropPlanDialogProps {
  field: Field;
  plan?: FieldCropPlanRow | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddCropPlanDialog({
  field,
  plan,
  trigger,
  onSuccess,
}: AddCropPlanDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [seasonId, setSeasonId] = useState<number | "">("");
  const [cropId, setCropId] = useState<number | "">("");
  const [seedVarietyId, setSeedVarietyId] = useState<number | "">("");
  const [plantingDate, setPlantingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [targetAreaHa, setTargetAreaHa] = useState("");
  const [managementLevel, setManagementLevel] = useState<"low" | "medium" | "high">("medium");

  const isEdit = Boolean(plan?.id);

  const { data: refCrops = [] } = useQuery<RefCrop[]>({
    queryKey: ["/api/reference/crops"],
    queryFn: async () => {
      const r = await fetch("/api/reference/crops", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch crops");
      return r.json();
    },
    enabled: open,
  });

  const { data: refSeasons = [] } = useQuery<RefSeason[]>({
    queryKey: ["/api/reference/seasons"],
    queryFn: async () => {
      const r = await fetch("/api/reference/seasons", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch seasons");
      return r.json();
    },
    enabled: open,
  });

  const { data: varieties = [], isLoading: varietiesLoading } = useQuery<SeedVarietyOption[]>({
    queryKey: ["/api/seed-varieties", field.id, cropId],
    queryFn: async () => {
      const params = new URLSearchParams({ fieldId: String(field.id), cropId: String(cropId) });
      const r = await fetch(`/api/seed-varieties?${params}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch varieties");
      return r.json();
    },
    enabled: open && Number.isInteger(cropId) && cropId > 0,
  });

  useEffect(() => {
    if (open && plan) {
      setSeasonId(plan.seasonId);
      setCropId(plan.cropId);
      setSeedVarietyId(plan.seedVarietyId ?? "");
      setPlantingDate(plan.plantingDate?.slice(0, 10) ?? "");
      setExpectedHarvestDate(plan.expectedHarvestDate?.slice(0, 10) ?? "");
      setTargetAreaHa(plan.targetAreaHa ?? "");
      setManagementLevel((plan.managementLevel as "low" | "medium" | "high") || "medium");
    } else if (!open) {
      setSeasonId("");
      setCropId("");
      setSeedVarietyId("");
      setPlantingDate("");
      setExpectedHarvestDate("");
      setTargetAreaHa("");
      setManagementLevel("medium");
    }
  }, [open, plan]);

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch(`/api/fields/${field.id}/crop-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error ?? "Failed to create plan");
      }
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Crop plan created" });
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${field.id}/crop-plans`] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast({ title: "Failed to create plan", description: e.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch(`/api/crop-plans/${plan!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error ?? "Failed to update plan");
      }
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Crop plan updated" });
      queryClient.invalidateQueries({ queryKey: [`/api/fields/${field.id}/crop-plans`] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast({ title: "Failed to update plan", description: e.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonId || !cropId) {
      toast({ title: "Select season and crop", variant: "destructive" });
      return;
    }
    const body: Record<string, unknown> = {
      seasonId: Number(seasonId),
      cropId: Number(cropId),
      seedVarietyId: seedVarietyId === "" ? (isEdit ? null : undefined) : Number(seedVarietyId),
      plantingDate: plantingDate || undefined,
      expectedHarvestDate: expectedHarvestDate || undefined,
      targetAreaHa: targetAreaHa || undefined,
      managementLevel,
    };
    if (isEdit) {
      updateMutation.mutate(body);
    } else {
      createMutation.mutate(body);
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  const openDialog = () => setOpen(true);
  const triggerButton =
    trigger !== undefined ? (
      React.isValidElement(trigger) ? (
        React.cloneElement(trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
          onClick: (e: React.MouseEvent) => {
            (trigger as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props?.onClick?.(e);
            openDialog();
          },
        })
      ) : (
        <span role="button" tabIndex={0} onClick={openDialog} onKeyDown={(e) => e.key === "Enter" && openDialog()}>
          {trigger}
        </span>
      )
    ) : (
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add crop plan
        </Button>
      </DialogTrigger>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit crop plan" : "Add crop plan"}</DialogTitle>
          <DialogDescription>
            Plan a crop and optional seed variety for {field.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Season</Label>
            <Select
              value={seasonId === "" ? undefined : String(seasonId)}
              onValueChange={(v) => setSeasonId(v === "" ? "" : Number(v))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {refSeasons.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Crop</Label>
            <Select
              value={cropId === "" ? undefined : String(cropId)}
              onValueChange={(v) => {
                setCropId(v === "" ? "" : Number(v));
                setSeedVarietyId("");
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {refCrops.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {cropId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Seed variety (optional)
              </Label>
              {varietiesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading recommendations…
                </div>
              ) : (
                <Select
                  value={seedVarietyId === "" ? "none" : String(seedVarietyId)}
                  onValueChange={(v) => setSeedVarietyId(v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None or pick recommended" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific variety</SelectItem>
                    {varieties.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        <span className="flex items-center gap-2">
                          {v.name}
                          {v.code && (
                            <span className="text-muted-foreground">({v.code})</span>
                          )}
                          {v.recommended && (
                            <span className="text-xs text-green-600">Recommended</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {varieties.some((v) => v.recommendationReasons?.length) && (
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 mt-1">
                  {varieties
                    .filter((v) => v.recommendationReasons?.length)
                    .slice(0, 2)
                    .map((v) => (
                      <li key={v.id}>
                        {v.name}: {v.recommendationReasons![0]}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Planting date</Label>
              <Input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected harvest</Label>
              <Input
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Target area (ha)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 2.5"
              value={targetAreaHa}
              onChange={(e) => setTargetAreaHa(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Management level</Label>
            <Select
              value={managementLevel}
              onValueChange={(v: "low" | "medium" | "high") => setManagementLevel(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
