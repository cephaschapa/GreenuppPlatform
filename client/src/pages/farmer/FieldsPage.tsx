import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Field,
  Crop,
  CropActivity,
  insertFieldSchema,
  insertCropSchema,
} from "@shared/schema";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { CropActivityManager } from "@/components/CropActivityManager";
import { CropDateManager } from "@/components/CropDateManager";

export default function FieldsPage() {
  const { toast } = useToast();
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [showNewCropDialog, setShowNewCropDialog] = useState(false);

  // Field form schema with validation
  const fieldFormSchema = insertFieldSchema.extend({
    // Handle size - convert to string before submission since server expects string
    size: z.union([z.string(), z.number().transform((val) => val.toString())]),
  });

  // Crop form schema with validation
  const cropFormSchema = insertCropSchema.extend({
    // Handle fieldSize - convert to string before submission since server expects string
    fieldSize: z.union([
      z.string(),
      z.number().transform((val) => val.toString()),
    ]),
    // Add sizeUnit field
    sizeUnit: z.string().optional(),
    // Add seed variety fields
    seedVariety: z.string().optional(),
    customVariety: z.string().optional(),
  });

  // Field form
  const fieldForm = useForm<z.infer<typeof fieldFormSchema>>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      userId: 2, // Hard-coded for now - should come from authentication context
      name: "",
      location: "",
      size: "0",
      sizeUnit: "hectares",
      soilType: "",
      notes: "",
    },
  });

  // Crop form
  const cropForm = useForm<z.infer<typeof cropFormSchema>>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      userId: 2, // Hard-coded for now - should come from authentication context
      name: "",
      variety: "",
      fieldId: selectedField?.id || 0,
      plantingDate: "",
      expectedHarvestDate: "",
      fieldSize: "0",
      sizeUnit: "hectares",
      status: "planning",
      notes: "",
      // Traceability fields
      batchId: "",
      seedSource: "",
      seedVariety: "",
      customVariety: "",
      organicCertified: false,
      certificationId: "",
      blockchainTxId: "", 
      traceabilityQrCode: "",
    },
  });

  // Fetch fields
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ["/api/fields"],
    queryFn: async () => {
      const response = await fetch("/api/fields");
      if (!response.ok) {
        throw new Error("Failed to fetch fields");
      }
      return await response.json();
    },
  });

  // Fetch crops for the selected field
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    queryFn: async () => {
      const response = await fetch("/api/crops");
      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }
      return await response.json();
    },
  });

  // Fetch activities for the selected crop
  const { data: activities, isLoading: activitiesLoading } = useQuery<
    CropActivity[]
  >({
    queryKey: ["/api/crops", selectedCrop?.id, "activities"],
    enabled: !!selectedCrop,
    queryFn: async () => {
      const response = await fetch(`/api/crops/${selectedCrop?.id}/activities`);
      if (!response.ok) {
        throw new Error("Failed to fetch crop activities");
      }
      return await response.json();
    },
  });

  // Create field mutation
  const createFieldMutation = useMutation({
    mutationFn: async (data: z.infer<typeof fieldFormSchema>) => {
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create field");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field created",
        description: "Your field has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      setShowNewFieldDialog(false);
      fieldForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create crop mutation
  const createCropMutation = useMutation({
    mutationFn: async (data: z.infer<typeof cropFormSchema>) => {
      // Process variety field based on seed selection
      let varietyToUse = data.variety;
      if (data.seedVariety) {
        if (data.seedVariety === 'custom' && data.customVariety) {
          varietyToUse = data.customVariety;
        } else {
          varietyToUse = data.seedVariety;
        }
      }

      // Generate a batch ID based on location, date, and serial number if not provided
      let batchId = data.batchId;
      if (!batchId) {
        const locationCode = selectedField?.location ? 
          selectedField.location.substring(0, 3).toUpperCase() : 'UNK';
        const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const serialNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        batchId = `${locationCode}-${dateCode}-${serialNum}`;
      }
      
      // Generate blockchain metadata (normally this would be handled by the blockchain service)
      const mockBlockchainId = `bc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      const mockQrCode = `qr_${batchId}`;
      
      // Prepare data to submit to server
      const cropSubmitData = {
        ...data,
        variety: varietyToUse,
        fieldId: selectedField?.id,
        userId: 2, // Hard-coded for now - should use current user ID from authentication context
        batchId: batchId, // Use the generated or provided batch ID
        blockchainTxId: mockBlockchainId,
        traceabilityQrCode: mockQrCode,
        // Keep seedVariety if not using custom, otherwise use undefined
        seedVariety: data.seedVariety !== 'custom' ? data.seedVariety : undefined,
        // Remove custom fields that aren't in the schema
        customVariety: undefined
      };

      const response = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cropSubmitData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create crop");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Crop created",
        description: "Your crop has been registered with the blockchain traceability system",
      });
      // Simulate a blockchain transaction
      setTimeout(() => {
        toast({
          title: "Blockchain Transaction Complete",
          description: `Crop ${data.name} has been successfully registered on the blockchain`,
          variant: "default"
        });
      }, 2000);
      
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      setShowNewCropDialog(false);
      cropForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create crop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete field mutation
  const deleteFieldMutation = useMutation({
    mutationFn: async (fieldId: number) => {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete field");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field deleted",
        description: "Your field has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      setSelectedField(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete crop mutation
  const deleteCropMutation = useMutation({
    mutationFn: async (cropId: number) => {
      const response = await fetch(`/api/crops/${cropId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete crop");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop deleted",
        description: "Your crop has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      setSelectedCrop(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete crop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle field form submission
  const onSubmitField = (data: z.infer<typeof fieldFormSchema>) => {
    createFieldMutation.mutate(data);
  };

  // Handle crop form submission
  const onSubmitCrop = (data: z.infer<typeof cropFormSchema>) => {
    if (!selectedField) {
      toast({
        title: "No field selected",
        description: "Please select a field before creating a crop",
        variant: "destructive",
      });
      return;
    }

    createCropMutation.mutate(data);
  };

  // Handle field selection
  const handleFieldSelect = (field: Field) => {
    setSelectedField(field);
    setSelectedCrop(null);
  };

  // Handle crop selection
  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop);
  };

  // Get field-related crops
  const getFieldCrops = (fieldId: number) => {
    return crops?.filter((crop) => crop.fieldId === fieldId) || [];
  };

  // Formatted date helper
  const formatDate = (dateStr: string | null | Date | undefined) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <DashboardLayout
      title="Fields & Crops"
      description="Manage your farm fields and crops"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Fields Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Fields</CardTitle>
              <CardDescription>Your registered fields</CardDescription>
            </div>
            <Dialog
              open={showNewFieldDialog}
              onOpenChange={setShowNewFieldDialog}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Field</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new field.
                  </DialogDescription>
                </DialogHeader>
                <Form {...fieldForm}>
                  <form
                    onSubmit={fieldForm.handleSubmit(onSubmitField)}
                    className="space-y-4"
                  >
                    <FormField
                      control={fieldForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter field name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={fieldForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Field location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={fieldForm.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Size"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={fieldForm.control}
                        name="sizeUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hectares">
                                  Hectares
                                </SelectItem>
                                <SelectItem value="acres">Acres</SelectItem>
                                <SelectItem value="sqm">
                                  Square Meters
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={fieldForm.control}
                      name="soilType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Soil type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={fieldForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional details about this field"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createFieldMutation.isPending}
                      >
                        {createFieldMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Field
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {fieldsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : fields && fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedField?.id === field.id
                        ? "bg-primary/20 text-primary border-primary/30 border"
                        : "hover:bg-primary/10 border border-border"
                    }`}
                    onClick={() => handleFieldSelect(field)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{field.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {field.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.size} {field.sizeUnit} •{" "}
                          {field.soilType || "Unknown soil"}
                        </p>
                      </div>
                      {selectedField?.id === field.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Are you sure you want to delete this field?",
                              )
                            ) {
                              deleteFieldMutation.mutate(field.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't added any fields yet.</p>
                <p className="text-sm">Click "Add Field" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crops Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">
                {selectedField
                  ? `${selectedField.name} Crops`
                  : "Crops"}
              </CardTitle>
              <CardDescription>
                {selectedField
                  ? `Manage crops planted in ${selectedField.name}`
                  : "Select a field to manage its crops"}
              </CardDescription>
            </div>
            {selectedField && (
              <Dialog
                open={showNewCropDialog}
                onOpenChange={setShowNewCropDialog}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    Add Crop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Add New Crop to {selectedField.name}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the details for your new crop.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...cropForm}>
                    <form
                      onSubmit={cropForm.handleSubmit(onSubmitCrop)}
                      className="space-y-4"
                    >
                      <FormField
                        control={cropForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crop Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="E.g., Maize, Wheat, Soybean"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={cropForm.control}
                        name="variety"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variety</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="E.g., SC 513, Pioneer"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={cropForm.control}
                          name="plantingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planting Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cropForm.control}
                          name="expectedHarvestDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Harvest Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={cropForm.control}
                          name="fieldSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area Under Crop</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Area size"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cropForm.control}
                          name="sizeUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hectares">
                                    Hectares
                                  </SelectItem>
                                  <SelectItem value="acres">Acres</SelectItem>
                                  <SelectItem value="sqm">
                                    Square Meters
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={cropForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="planted">Planted</SelectItem>
                                <SelectItem value="growing">Growing</SelectItem>
                                <SelectItem value="harvesting">
                                  Harvesting
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={cropForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes about this crop"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Traceability Section */}
                      <Separator className="my-4" />
                      <h3 className="text-md font-medium mb-2">Crop Traceability</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={cropForm.control}
                          name="batchId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batch ID</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="Auto-generated on save"
                                    disabled
                                    {...field} 
                                  />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => {
                                    // Generate batch ID based on location, date and serial number
                                    const location = selectedField?.location?.slice(0, 3).toUpperCase() || 'LOC';
                                    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
                                    const serial = Math.floor(1000 + Math.random() * 9000);
                                    field.onChange(`${location}-${date}-${serial}`);
                                  }}
                                  className="h-8 w-8"
                                  title="Generate Batch ID"
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                              <FormDescription className="text-xs">
                                Format: LOCATION-DATE-SERIAL (auto-generated)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cropForm.control}
                          name="seedSource"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seed Source</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select seed provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="seedco">SeedCo</SelectItem>
                                  <SelectItem value="pioneer">Pioneer Seeds</SelectItem>
                                  <SelectItem value="pannar">Pannar Seed</SelectItem>
                                  <SelectItem value="monsanto">Monsanto</SelectItem>
                                  <SelectItem value="klein">Klein Karoo</SelectItem>
                                  <SelectItem value="starke">Starke Ayres</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={cropForm.control}
                          name="seedVariety"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seed Variety</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={!cropForm.watch("seedSource")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select seed variety" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cropForm.watch("seedSource") === "seedco" && (
                                    <>
                                      <SelectItem value="sc513">SC 513</SelectItem>
                                      <SelectItem value="sc633">SC 633</SelectItem>
                                      <SelectItem value="sc719">SC 719</SelectItem>
                                    </>
                                  )}
                                  {cropForm.watch("seedSource") === "pioneer" && (
                                    <>
                                      <SelectItem value="p1615">P1615</SelectItem>
                                      <SelectItem value="p2432">P2432</SelectItem>
                                      <SelectItem value="p1758">P1758</SelectItem>
                                    </>
                                  )}
                                  {cropForm.watch("seedSource") === "pannar" && (
                                    <>
                                      <SelectItem value="pn3r-743">PN3R-743</SelectItem>
                                      <SelectItem value="pn4m-19">PN4M-19</SelectItem>
                                      <SelectItem value="pn53">PN53</SelectItem>
                                    </>
                                  )}
                                  {(cropForm.watch("seedSource") !== "seedco" && 
                                   cropForm.watch("seedSource") !== "pioneer" && 
                                   cropForm.watch("seedSource") !== "pannar" && 
                                   cropForm.watch("seedSource")) && (
                                    <SelectItem value="custom">Custom Variety</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              {cropForm.watch("seedVariety") === "custom" && (
                                <Input 
                                  className="mt-2" 
                                  placeholder="Enter custom variety" 
                                  onChange={(e) => cropForm.setValue("customVariety", e.target.value)}
                                />
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cropForm.control}
                          name="organicCertified"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Organic Certified</FormLabel>
                                <FormDescription>
                                  Request organic certification from Greenupp admins
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={cropForm.control}
                          name="certificationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certification ID</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Will be assigned by admin"
                                  disabled
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Assigned after verification by Greenupp admin
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={cropForm.control}
                          name="blockchainTxId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blockchain Transaction ID</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Auto-generated on save"
                                  disabled
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Generated by Hyperledger Fabric on submission
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex flex-col space-y-1.5">
                        <FormField
                          control={cropForm.control}
                          name="traceabilityQrCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Traceability QR Code</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Auto-generated on blockchain registration"
                                  disabled
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                QR code will be generated after crop registration
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={createCropMutation.isPending}
                        >
                          {createCropMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create Crop
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {!selectedField ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Select a field to view its crops</p>
              </div>
            ) : cropsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : getFieldCrops(selectedField.id).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No crops added to this field yet.</p>
                <p className="text-sm">Click "Add Crop" to plant something.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFieldCrops(selectedField.id).map((crop) => (
                    <div
                      key={crop.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedCrop?.id === crop.id
                          ? "bg-primary/20 text-primary border-primary/30 border"
                          : "hover:bg-primary/10 border border-border"
                      }`}
                      onClick={() => handleCropSelect(crop)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{crop.name}</h3>
                          <p className="text-sm">{crop.variety}</p>
                        </div>
                        {selectedCrop?.id === crop.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Are you sure you want to delete this crop?",
                                )
                              ) {
                                deleteCropMutation.mutate(crop.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 text-xs text-muted-foreground">
                        <div>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            {crop.status}
                          </p>
                          <p>
                            <span className="font-medium">Area:</span>{" "}
                            {crop.fieldSize} {crop.sizeUnit}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">Planted:</span>{" "}
                            {formatDate(crop.plantingDate)}
                          </p>
                          <p>
                            <span className="font-medium">Harvest:</span>{" "}
                            {formatDate(crop.expectedHarvestDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCrop && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>
                        Manage {selectedCrop.name} ({selectedCrop.variety})
                      </CardTitle>
                      <CardDescription>
                        Track activities and manage dates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="activities">
                        <TabsList className="mb-4">
                          <TabsTrigger value="activities">
                            Activities
                          </TabsTrigger>
                          <TabsTrigger value="dates">Key Dates</TabsTrigger>
                        </TabsList>
                        <TabsContent value="activities">
                          <CropActivityManager
                            cropId={selectedCrop.id}
                            activities={activities || []}
                            isLoading={activitiesLoading}
                          />
                        </TabsContent>
                        <TabsContent value="dates">
                          <CropDateManager
                            crop={selectedCrop}
                            onUpdate={() => {
                              queryClient.invalidateQueries({
                                queryKey: ["/api/crops"],
                              });
                            }}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}