import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FieldLocationPicker, { FieldLocationData } from "./FieldLocationPicker";
import FieldBoundaryPicker, { FieldBoundaryData } from "./FieldBoundaryPicker";
import GoogleLocationDetector, { type DetectedLocation } from "@/components/GoogleLocationDetector";

interface AddFieldDialogProps {
  trigger?: React.ReactNode;
}

export default function AddFieldDialog({ trigger }: AddFieldDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<FieldLocationData | null>(
    null
  );
  const [boundaryData, setBoundaryData] = useState<FieldBoundaryData | null>(
    null
  );
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState("hectares");
  const [soilType, setSoilType] = useState("");
  const [notes, setNotes] = useState("");
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);

  const queryClient = useQueryClient();

  const handleLocationDetected = (location: DetectedLocation) => {
    setDetectedLocation(location);

    // Auto-fill the location text field
    if (location.address) {
      setLocation(location.address);
    } else if (location.city && location.country) {
      setLocation(`${location.city}, ${location.country}`);
    }

    // Also set the location data for the map
    if (location.latitude && location.longitude) {
      const fieldLocationData: FieldLocationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country || "",
        region: location.state || "",
        city: location.city || "",
        neighborhood: null,
        postalCode: location.postalCode || null,
        formattedAddress: location.address || null,
        placeId: location.placeId || null,
      };
      setLocationData(fieldLocationData);
    }
  };

  const createFieldMutation = useMutation({
    mutationFn: async (fieldData: {
      name: string;
      location?: string;
      locationId?: number;
      size?: string;
      sizeUnit: string;
      soilType?: string;
      notes?: string;
    }) => {
      // First, create location if we have location data
      let locationId: number | undefined;

      if (locationData) {
        const locationResponse = await fetch("/api/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            country: locationData.country,
            region: locationData.region,
            city: locationData.city,
            neighborhood: locationData.neighborhood,
            postalCode: locationData.postalCode,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            formattedAddress: locationData.formattedAddress,
            placeId: locationData.placeId,
          }),
        });

        if (locationResponse.ok) {
          const locationResult = await locationResponse.json();
          locationId = locationResult.id;
        }
      }

      // Prepare field data with boundary information
      const fieldPayload = {
        ...fieldData,
        locationId,
        // Add boundary data if available
        boundary: boundaryData?.boundary || null,
        calculatedArea: boundaryData?.calculatedArea || null,
        centerLat: boundaryData?.centerLat || null,
        centerLng: boundaryData?.centerLng || null,
      };

      // Create the field
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(fieldPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create field");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      queryClient.invalidateQueries({ queryKey: ["fields-with-locations"] });
      toast({
        title: "Field created",
        description: "Your field has been created successfully",
      });

      // Reset form
      setName("");
      setLocation("");
      setLocationData(null);
      setBoundaryData(null);
      setSize("");
      setSizeUnit("hectares");
      setSoilType("");
      setNotes("");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Field name is required",
        variant: "destructive",
      });
      return;
    }

    createFieldMutation.mutate({
      name: name.trim(),
      location: location.trim() || undefined,
      size: size.trim() || undefined,
      sizeUnit,
      soilType: soilType.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleLocationSelect = (location: FieldLocationData) => {
    setLocationData(location);
    // Also set the text location field for backward compatibility
    setLocation(
      location.formattedAddress || `${location.city}, ${location.region}`
    );
  };

  const handleLocationClear = () => {
    setLocationData(null);
    setLocation("");
  };

  const handleBoundarySelect = (boundary: FieldBoundaryData) => {
    setBoundaryData(boundary);
    // Auto-fill location if not already set
    if (!locationData) {
      setLocation(
        boundary.formattedAddress || `${boundary.city}, ${boundary.region}`
      );
    }
    // Auto-fill size if calculated from boundary
    if (boundary.calculatedArea) {
      const hectares = boundary.calculatedArea / 10000;
      setSize(hectares.toFixed(2));
      setSizeUnit("hectares");
    }
  };

  const handleBoundaryClear = () => {
    setBoundaryData(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Field Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter field name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <Label htmlFor="sizeUnit">Unit</Label>
                <Select value={sizeUnit} onValueChange={setSizeUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hectares">Hectares</SelectItem>
                    <SelectItem value="acres">Acres</SelectItem>
                    <SelectItem value="square_meters">Square Meters</SelectItem>
                    <SelectItem value="square_feet">Square Feet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="soilType">Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="loam">Loam</SelectItem>
                  <SelectItem value="silt">Silt</SelectItem>
                  <SelectItem value="peat">Peat</SelectItem>
                  <SelectItem value="chalk">Chalk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location (Text)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location description"
              />
              <div className="mt-2">
                <GoogleLocationDetector
                  onLocationDetected={handleLocationDetected}
                  buttonText="Auto-Detect Field Location"
                  showDetails={true}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Location & Boundary Picker */}
          <div>
            <Tabs defaultValue="location" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="location">Point Location</TabsTrigger>
                <TabsTrigger value="boundary">Field Boundary</TabsTrigger>
              </TabsList>

              <TabsContent value="location" className="mt-4">
                <FieldLocationPicker
                  initialLocation={locationData}
                  onLocationSelect={handleLocationSelect}
                  onLocationClear={handleLocationClear}
                />
              </TabsContent>

              <TabsContent value="boundary" className="mt-4">
                <FieldBoundaryPicker
                  initialBoundary={boundaryData}
                  onBoundarySelect={handleBoundarySelect}
                  onBoundaryClear={handleBoundaryClear}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this field..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createFieldMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFieldMutation.isPending}>
              {createFieldMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Field"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
