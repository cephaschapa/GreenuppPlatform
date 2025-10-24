import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Loader2,
  Droplets,
  Bug,
  Leaf,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface QuickObservationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCropId?: number;
}

interface Crop {
  id: number;
  name: string;
  variety?: string;
  status: string;
  fieldId?: number;
  field?: { name: string };
}

export function QuickObservationDialog({
  isOpen,
  onOpenChange,
  preselectedCropId,
}: QuickObservationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCropId, setSelectedCropId] = useState<number | undefined>(
    preselectedCropId
  );
  const [observationType, setObservationType] = useState("general");
  const [notes, setNotes] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [waterAmount, setWaterAmount] = useState("");
  const [pestDetected, setPestDetected] = useState(false);
  const [pestType, setPestType] = useState("");
  const [diseaseDetected, setDiseaseDetected] = useState(false);
  const [diseaseType, setDiseaseType] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  // Fetch crops
  const { data: crops } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    queryFn: async () => {
      const response = await fetch("/api/crops");
      if (!response.ok) throw new Error("Failed to fetch crops");
      return await response.json();
    },
  });

  // Get active crops only
  const activeCrops =
    crops?.filter((crop) =>
      ["planted", "growing", "planning"].includes(crop.status)
    ) || [];

  // Create observation mutation
  const createObservation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/crop-observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create observation");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crop-observations"] });
      toast({
        title: "✅ Observation Logged",
        description: "Your crop observation has been saved successfully",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save observation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedCropId) {
      toast({
        title: "Please select a crop",
        variant: "destructive",
      });
      return;
    }

    const selectedCrop = crops?.find((c) => c.id === selectedCropId);

    createObservation.mutate({
      cropId: selectedCropId,
      fieldId: selectedCrop?.fieldId,
      observationType,
      notes,
      healthStatus: healthStatus || undefined,
      pestDetected,
      pestType: pestDetected ? pestType : undefined,
      diseaseDetected,
      diseaseType: diseaseDetected ? diseaseType : undefined,
      actionTaken: actionTaken || undefined,
      waterAmountLiters: waterAmount ? parseFloat(waterAmount) : undefined,
    });
  };

  const handleClose = () => {
    setSelectedCropId(preselectedCropId);
    setObservationType("general");
    setNotes("");
    setHealthStatus("");
    setWaterAmount("");
    setPestDetected(false);
    setPestType("");
    setDiseaseDetected(false);
    setDiseaseType("");
    setActionTaken("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Quick Observation
          </DialogTitle>
          <DialogDescription>
            Log what you see in the field today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Crop Selection */}
          <div className="space-y-2">
            <Label htmlFor="crop">Crop *</Label>
            <Select
              value={selectedCropId?.toString()}
              onValueChange={(value) => setSelectedCropId(parseInt(value))}
            >
              <SelectTrigger id="crop">
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {activeCrops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id.toString()}>
                    {crop.name} {crop.variety && `(${crop.variety})`}
                    {crop.field && ` - ${crop.field.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observation Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Observation Type *</Label>
            <Select value={observationType} onValueChange={setObservationType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Check</SelectItem>
                <SelectItem value="watering">Watering</SelectItem>
                <SelectItem value="fertilizing">Fertilizing</SelectItem>
                <SelectItem value="pest_check">Pest Check</SelectItem>
                <SelectItem value="disease_check">Disease Check</SelectItem>
                <SelectItem value="growth_measurement">
                  Growth Measurement
                </SelectItem>
                <SelectItem value="harvest_check">Harvest Readiness</SelectItem>
                <SelectItem value="weather_impact">Weather Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Health Status */}
          <div className="space-y-2">
            <Label htmlFor="health">Health Status</Label>
            <Select value={healthStatus} onValueChange={setHealthStatus}>
              <SelectTrigger id="health">
                <SelectValue placeholder="How does the crop look?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                    Excellent
                  </div>
                </SelectItem>
                <SelectItem value="good">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    Good
                  </div>
                </SelectItem>
                <SelectItem value="fair">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Fair
                  </div>
                </SelectItem>
                <SelectItem value="poor">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    Poor
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-600" />
                    Critical
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <Label htmlFor="pest" className="text-sm cursor-pointer">
                  Pest Detected
                </Label>
              </div>
              <Switch
                id="pest"
                checked={pestDetected}
                onCheckedChange={setPestDetected}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <Label htmlFor="disease" className="text-sm cursor-pointer">
                  Disease Detected
                </Label>
              </div>
              <Switch
                id="disease"
                checked={diseaseDetected}
                onCheckedChange={setDiseaseDetected}
              />
            </div>
          </div>

          {/* Conditional Fields */}
          {pestDetected && (
            <div className="space-y-2">
              <Label htmlFor="pest-type">Pest Type</Label>
              <Input
                id="pest-type"
                placeholder="e.g., Aphids, Fall armyworm"
                value={pestType}
                onChange={(e) => setPestType(e.target.value)}
              />
            </div>
          )}

          {diseaseDetected && (
            <div className="space-y-2">
              <Label htmlFor="disease-type">Disease/Issue</Label>
              <Input
                id="disease-type"
                placeholder="e.g., Leaf blight, Wilt"
                value={diseaseType}
                onChange={(e) => setDiseaseType(e.target.value)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="What did you observe? Any concerns or actions taken?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Taken */}
          {(pestDetected ||
            diseaseDetected ||
            observationType === "watering") && (
            <div className="space-y-2">
              <Label htmlFor="action">Action Taken</Label>
              <Input
                id="action"
                placeholder="What did you do? (e.g., Applied pesticide, Watered plants)"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              />
            </div>
          )}

          {/* Water Amount */}
          {observationType === "watering" && (
            <div className="space-y-2">
              <Label htmlFor="water">Water Amount (liters)</Label>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <Input
                  id="water"
                  type="number"
                  placeholder="0"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createObservation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createObservation.isPending}>
            {createObservation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Observation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
