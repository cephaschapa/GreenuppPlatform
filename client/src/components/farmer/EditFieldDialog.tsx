import { useState, useEffect } from "react";
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
import { Edit, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FieldLocationPicker, { FieldLocationData } from "./FieldLocationPicker";
import FieldBoundaryPicker, { FieldBoundaryData } from "./FieldBoundaryPicker";

interface Field {
  id: number;
  name: string;
  location: string | null;
  locationId: number | null;
  size: string | null;
  sizeUnit: string | null;
  soilType: string | null;
  notes: string | null;
  boundary?: {
    type: "Polygon";
    coordinates: number[][][];
  } | null;
  calculatedArea?: number | string | null;
  centerLat?: number | string | null;
  centerLng?: number | string | null;
  locationData?: {
    id: number;
    latitude: number;
    longitude: number;
    country: string;
    region: string;
    city: string;
    formattedAddress: string | null;
  } | null;
}

interface EditFieldDialogProps {
  field: Field;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditFieldDialog({
  field,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditFieldDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  // Form state
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

  const queryClient = useQueryClient();

  // Initialize form with field data
  useEffect(() => {
    if (field && open) {
      setName(field.name || "");
      setLocation(field.location || "");
      setSize(field.size || "");
      setSizeUnit(field.sizeUnit || "hectares");
      setSoilType(field.soilType || "");
      setNotes(field.notes || "");

      // Set location data if available
      if (field.locationData) {
        setLocationData({
          latitude: field.locationData.latitude,
          longitude: field.locationData.longitude,
          country: field.locationData.country,
          region: field.locationData.region,
          city: field.locationData.city,
          neighborhood: null,
          postalCode: null,
          formattedAddress: field.locationData.formattedAddress,
          placeId: null,
        });
      } else {
        setLocationData(null);
      }

      // Set boundary data if available
      if (
        field.boundary &&
        field.centerLat &&
        field.centerLng &&
        field.calculatedArea
      ) {
        const centerLat =
          typeof field.centerLat === "string"
            ? parseFloat(field.centerLat)
            : field.centerLat;
        const centerLng =
          typeof field.centerLng === "string"
            ? parseFloat(field.centerLng)
            : field.centerLng;
        const calculatedArea =
          typeof field.calculatedArea === "string"
            ? parseFloat(field.calculatedArea)
            : field.calculatedArea;

        setBoundaryData({
          centerLat,
          centerLng,
          boundary: field.boundary,
          calculatedArea,
          country: field.locationData?.country || "",
          region: field.locationData?.region || "",
          city: field.locationData?.city || "",
          neighborhood: null,
          postalCode: null,
          formattedAddress: field.locationData?.formattedAddress || null,
          placeId: null,
        });
      } else {
        setBoundaryData(null);
      }
    }
  }, [field, open]);

  const updateFieldMutation = useMutation({
    mutationFn: async (fieldData: {
      name: string;
      location?: string;
      locationId?: number;
      size?: string;
      sizeUnit: string;
      soilType?: string;
      notes?: string;
    }) => {
      // Handle location creation/update if we have location data
      let locationId: number | undefined = field.locationId || undefined;

      if (locationData) {
        if (field.locationId) {
          // Update existing location
          const locationResponse = await fetch(
            `/api/locations/${field.locationId}`,
            {
              method: "PATCH",
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
            }
          );

          if (locationResponse.ok) {
            const locationResult = await locationResponse.json();
            locationId = locationResult.id;
          }
        } else {
          // Create new location
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

      // Update the field
      const response = await fetch(`/api/fields/${field.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(fieldPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update field");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      queryClient.invalidateQueries({ queryKey: ["fields-with-locations"] });
      toast({
        title: "Field updated",
        description: "Your field has been updated successfully",
      });
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

    updateFieldMutation.mutate({
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
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Field: {field.name}</DialogTitle>
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
              <Select
                value={soilType || "none"}
                onValueChange={(value) =>
                  setSoilType(value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
              disabled={updateFieldMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateFieldMutation.isPending}>
              {updateFieldMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Field"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
