import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Field, Crop, CropActivity, insertFieldSchema, insertCropSchema } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    // Ensure size is handled as a number
    size: z.number().optional().or(z.string().transform(val => val ? parseFloat(val) : undefined))
  });
  
  // Crop form schema with validation
  const cropFormSchema = insertCropSchema.extend({
    // Ensure fieldSize is handled as a number
    fieldSize: z.number().optional().or(z.string().transform(val => val ? parseFloat(val) : undefined))
  });
  
  // Field form
  const fieldForm = useForm<z.infer<typeof fieldFormSchema>>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      location: "",
      size: 0,
      sizeUnit: "hectares", 
      soilType: "",
      description: ""
    }
  });
  
  // Crop form
  const cropForm = useForm<z.infer<typeof cropFormSchema>>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      name: "",
      variety: "",
      fieldId: selectedField?.id || 0,
      plantingDate: "",
      harvestDate: "",
      fieldSize: 0,
      sizeUnit: "hectares",
      status: "planning",
      notes: ""
    }
  });
  
  // Fetch fields
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
    queryFn: async () => {
      const response = await fetch('/api/fields');
      if (!response.ok) {
        throw new Error("Failed to fetch fields");
      }
      return await response.json();
    }
  });
  
  // Fetch crops for the selected field
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    queryFn: async () => {
      const response = await fetch('/api/crops');
      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }
      return await response.json();
    }
  });
  
  // Fetch activities for the selected crop
  const { data: activities, isLoading: activitiesLoading } = useQuery<CropActivity[]>({
    queryKey: ['/api/crops', selectedCrop?.id, 'activities'],
    enabled: !!selectedCrop,
    queryFn: async () => {
      const response = await fetch(`/api/crops/${selectedCrop?.id}/activities`);
      if (!response.ok) {
        throw new Error("Failed to fetch crop activities");
      }
      return await response.json();
    }
  });
  
  // Create field mutation
  const createFieldMutation = useMutation({
    mutationFn: async (data: z.infer<typeof fieldFormSchema>) => {
      const response = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
      setShowNewFieldDialog(false);
      fieldForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create field",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create crop mutation
  const createCropMutation = useMutation({
    mutationFn: async (data: z.infer<typeof cropFormSchema>) => {
      const response = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fieldId: selectedField?.id
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create crop");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop created",
        description: "Your crop has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      setShowNewCropDialog(false);
      cropForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create crop",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete field mutation
  const deleteFieldMutation = useMutation({
    mutationFn: async (fieldId: number) => {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: 'DELETE'
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
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
      setSelectedField(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete field",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete crop mutation
  const deleteCropMutation = useMutation({
    mutationFn: async (cropId: number) => {
      const response = await fetch(`/api/crops/${cropId}`, {
        method: 'DELETE'
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
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
      setSelectedCrop(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete crop",
        description: error.message,
        variant: "destructive",
      });
    }
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
    return crops?.filter(crop => crop.fieldId === fieldId) || [];
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
            <Dialog open={showNewFieldDialog} onOpenChange={setShowNewFieldDialog}>
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
                  <form onSubmit={fieldForm.handleSubmit(onSubmitField)} className="space-y-4">
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
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                                <SelectItem value="hectares">Hectares</SelectItem>
                                <SelectItem value="acres">Acres</SelectItem>
                                <SelectItem value="sqm">Square Meters</SelectItem>
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
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
                          {field.size} {field.sizeUnit} • {field.soilType || "Unknown soil"}
                        </p>
                      </div>
                      {selectedField?.id === field.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this field?")) {
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
                {selectedField ? `Crops in ${selectedField.name}` : "Crops"}
              </CardTitle>
              <CardDescription>
                {selectedField
                  ? `Manage crops planted in ${selectedField.name}`
                  : "Select a field to manage its crops"}
              </CardDescription>
            </div>
            {selectedField && (
              <Dialog open={showNewCropDialog} onOpenChange={setShowNewCropDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    Add Crop
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Crop</DialogTitle>
                    <DialogDescription>
                      Enter the details for your new crop in {selectedField.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...cropForm}>
                    <form onSubmit={cropForm.handleSubmit(onSubmitCrop)} className="space-y-4">
                      <FormField
                        control={cropForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crop Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., Maize, Wheat, Soybean" {...field} />
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
                              <Input placeholder="E.g., SC 513, Pioneer" {...field} />
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
                          name="harvestDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expected Harvest</FormLabel>
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
                              <FormLabel>Area</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Area used" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                                  <SelectItem value="hectares">Hectares</SelectItem>
                                  <SelectItem value="acres">Acres</SelectItem>
                                  <SelectItem value="sqm">Square Meters</SelectItem>
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
                                <SelectItem value="harvested">Harvested</SelectItem>
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
                              if (confirm("Are you sure you want to delete this crop?")) {
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
                          <p><span className="font-medium">Status:</span> {crop.status}</p>
                          <p><span className="font-medium">Area:</span> {crop.fieldSize} {crop.sizeUnit}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Planted:</span> {formatDate(crop.plantingDate)}</p>
                          <p><span className="font-medium">Harvest:</span> {formatDate(crop.harvestDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedCrop && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Manage {selectedCrop.name} ({selectedCrop.variety})</CardTitle>
                      <CardDescription>Track activities and manage dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="activities">
                        <TabsList className="mb-4">
                          <TabsTrigger value="activities">Activities</TabsTrigger>
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
                              queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
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