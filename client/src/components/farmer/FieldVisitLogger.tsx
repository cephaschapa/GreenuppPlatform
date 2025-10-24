import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, ClipboardCheck } from "lucide-react";

interface FieldVisitLoggerProps {
  fieldId?: number;
  trigger?: React.ReactNode;
}

interface Field {
  id: number;
  name: string;
  location?: string;
}

export function FieldVisitLogger({ fieldId, trigger }: FieldVisitLoggerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<number | undefined>(
    fieldId
  );
  const [purpose, setPurpose] = useState("routine_inspection");
  const [notes, setNotes] = useState("");
  const [overallCondition, setOverallCondition] = useState("");

  // Fetch fields
  const { data: fields } = useQuery<Field[]>({
    queryKey: ["/api/fields"],
    queryFn: async () => {
      const response = await fetch("/api/fields");
      if (!response.ok) throw new Error("Failed to fetch fields");
      return await response.json();
    },
  });

  // Create field visit mutation
  const createFieldVisit = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/crop-observations/field-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create field visit");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      toast({
        title: "✅ Field Visit Logged",
        description: "Your field inspection has been saved",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save visit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedFieldId) {
      toast({
        title: "Please select a field",
        variant: "destructive",
      });
      return;
    }

    createFieldVisit.mutate({
      fieldId: selectedFieldId,
      purpose,
      notes,
      overallCondition: overallCondition || undefined,
    });
  };

  const handleClose = () => {
    setSelectedFieldId(fieldId);
    setPurpose("routine_inspection");
    setNotes("");
    setOverallCondition("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            Log Field Visit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Field Visit Log
          </DialogTitle>
          <DialogDescription>
            Record your field inspection and observations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Field Selection */}
          <div className="space-y-2">
            <Label htmlFor="field">Field *</Label>
            <Select
              value={selectedFieldId?.toString()}
              onValueChange={(value) => setSelectedFieldId(parseInt(value))}
            >
              <SelectTrigger id="field">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                {fields?.map((field) => (
                  <SelectItem key={field.id} value={field.id.toString()}>
                    {field.name}
                    {field.location && ` - ${field.location}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Visit Purpose *</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger id="purpose">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine_inspection">
                  Routine Inspection
                </SelectItem>
                <SelectItem value="pest_monitoring">Pest Monitoring</SelectItem>
                <SelectItem value="harvest">Harvest</SelectItem>
                <SelectItem value="planting">Planting</SelectItem>
                <SelectItem value="irrigation">Irrigation</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="soil_testing">Soil Testing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overall Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Overall Field Condition</Label>
            <Select
              value={overallCondition}
              onValueChange={setOverallCondition}
            >
              <SelectTrigger id="condition">
                <SelectValue placeholder="How does the field look?" />
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
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Poor
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Visit Notes</Label>
            <Textarea
              id="notes"
              placeholder="What did you observe? Any issues or actions taken?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createFieldVisit.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createFieldVisit.isPending}>
            {createFieldVisit.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Visit Log"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
