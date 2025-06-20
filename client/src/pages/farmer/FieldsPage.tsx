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
import { AddCropDialog } from "@/components/farmer/AddCropDialog";

export default function FieldsPage() {
  const { toast } = useToast();
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);

  // Field form schema with validation
  const fieldFormSchema = insertFieldSchema.extend({
    // Handle size - convert to string before submission since server expects string
    size: z.union([z.string(), z.number().transform((val) => val.toString())]),
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

  // Fetch crops
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

  // Create field mutation
  const createFieldMutation = useMutation({
    mutationFn: async (data: z.infer<typeof fieldFormSchema>) => {
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create field");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field created successfully",
        description: `${fieldForm.getValues(
          "name"
        )} has been added to your fields`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      setShowNewFieldDialog(false);
      fieldForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitField = (data: z.infer<typeof fieldFormSchema>) => {
    createFieldMutation.mutate(data);
  };

  const handleFieldSelect = (field: Field) => {
    setSelectedField(field);
    setSelectedCrop(null);
  };

  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop);
  };

  const getFieldCrops = (fieldId: number) => {
    return crops?.filter((crop) => crop.fieldId === fieldId) || [];
  };

  const formatDate = (dateStr: string | null | Date | undefined) => {
    if (!dateStr) return "Not set";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <DashboardLayout
      title="Field Management"
      description="Manage your agricultural fields and crops"
    >
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Field Management</h1>
            <p className="text-muted-foreground">
              Manage your agricultural fields and crops
            </p>
          </div>
        </div>

        <Tabs defaultValue="fields" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="crops">Crops</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Field Card */}
              <Card className="border-dashed border-2 border-gray-300 hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Dialog
                    open={showNewFieldDialog}
                    onOpenChange={setShowNewFieldDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-32">
                        <div className="flex flex-col items-center gap-2">
                          <PlusCircle className="h-8 w-8" />
                          <span>Add New Field</span>
                        </div>
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
                                  <Input
                                    placeholder="E.g., North Field, Main Plot"
                                    {...field}
                                  />
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
                                  <Input
                                    placeholder="E.g., Lusaka, Zambia"
                                    {...field}
                                    value={field.value || ""}
                                  />
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
                                      placeholder="Field size"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
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
                                    defaultValue={field.value || "hectares"}
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
                                      <SelectItem value="acres">
                                        Acres
                                      </SelectItem>
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
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select soil type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="clay">Clay</SelectItem>
                                    <SelectItem value="loam">Loam</SelectItem>
                                    <SelectItem value="sandy">Sandy</SelectItem>
                                    <SelectItem value="silt">Silt</SelectItem>
                                    <SelectItem value="chalky">
                                      Chalky
                                    </SelectItem>
                                    <SelectItem value="peaty">Peaty</SelectItem>
                                  </SelectContent>
                                </Select>
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
                                    placeholder="Additional notes about this field"
                                    {...field}
                                    value={field.value || ""}
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
                </CardContent>
              </Card>

              {/* Existing Fields */}
              {fieldsLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                fields?.map((field) => (
                  <Card
                    key={field.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedField?.id === field.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleFieldSelect(field)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                      <CardDescription>{field.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Size:</span>
                        <span>
                          {field.size} {field.sizeUnit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Soil Type:
                        </span>
                        <span className="capitalize">{field.soilType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Crops:</span>
                        <span>{getFieldCrops(field.id).length} active</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="crops" className="space-y-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">
                    {selectedField ? `${selectedField.name} Crops` : "Crops"}
                  </CardTitle>
                  <CardDescription>
                    {selectedField
                      ? `Manage crops planted in ${selectedField.name}`
                      : "Select a field to manage its crops"}
                  </CardDescription>
                </div>
                {selectedField && <AddCropDialog field={selectedField} />}
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
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No crops found in {selectedField.name}</p>
                    <p className="text-sm">
                      Add your first crop to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFieldCrops(selectedField.id).map((crop) => (
                      <Card
                        key={crop.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedCrop?.id === crop.id
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => handleCropSelect(crop)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {crop.name}
                              </CardTitle>
                              <CardDescription>
                                {crop.variety && `${crop.variety} • `}
                                {crop.fieldSize} {crop.sizeUnit}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full capitalize ${
                                  crop.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : crop.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : crop.status === "harvesting"
                                    ? "bg-orange-100 text-orange-800"
                                    : crop.status === "growing"
                                    ? "bg-blue-100 text-blue-800"
                                    : crop.status === "planted"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {crop.status}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Planting Date:
                              </span>
                              <br />
                              <span>{formatDate(crop.plantingDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Expected Harvest:
                              </span>
                              <br />
                              <span>
                                {formatDate(crop.expectedHarvestDate)}
                              </span>
                            </div>
                          </div>
                          {crop.notes && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Notes:
                              </span>
                              <br />
                              <span className="line-clamp-2">{crop.notes}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Crop Details */}
            {selectedCrop && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CropActivityManager
                  crop={selectedCrop}
                  onClose={() => setSelectedCrop(null)}
                />
                <CropDateManager
                  crop={selectedCrop}
                  onClose={() => setSelectedCrop(null)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
