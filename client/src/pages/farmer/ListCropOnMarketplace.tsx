import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ShieldCheck, ArrowLeft, ExternalLink, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Crop, InsertMarketplaceListing } from '@shared/schema';

// Form schema for creating marketplace listing
const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    "Price must be a positive number"
  ),
  priceCurrency: z.string().default("ZMW"),
  priceUnit: z.string().optional(),
  quantity: z.string().refine(
    (val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
    "Quantity must be a positive number if provided"
  ).optional(),
  quantityUnit: z.string().optional(),
  condition: z.string().optional(),
  contactPhone: z.string().optional(),
  deliveryAvailable: z.boolean().default(false),
  isNegotiable: z.boolean().default(false),
  status: z.string().default("active"),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  cropId: z.number().optional(), // For blockchain traceability
  useBlockchain: z.boolean().default(false), // UI only field for blockchain option
});

type ListingFormValues = z.infer<typeof listingSchema>;

export default function ListCropOnMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [blockchainVerified, setBlockchainVerified] = useState(false);
  
  // Fetch farmer's crops
  const { data: crops, isLoading: isLoadingCrops } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/crops');
      return await response.json();
    },
  });
  
  // Filter crops that can be traced (have a batch ID)
  const traceableCrops = crops?.filter(crop => crop.batchId) || [];
  const nonTraceableCrops = crops?.filter(crop => !crop.batchId) || [];
  
  // Setup form
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      price: "",
      priceCurrency: "ZMW",
      priceUnit: "kg",
      quantity: "",
      quantityUnit: "kg",
      condition: "new",
      contactPhone: user?.phoneNumber || "",
      deliveryAvailable: false,
      isNegotiable: true,
      status: "active",
      tags: [],
      images: [],
      useBlockchain: false,
    },
  });
  
  // Toggle blockchain verification when a crop is selected
  const handleCropSelect = (cropId: string) => {
    const id = parseInt(cropId);
    setSelectedCropId(id);
    
    // If the crop has a batch ID, it can be traced on blockchain
    const crop = crops?.find(c => c.id === id);
    const canTrace = !!crop?.batchId;
    
    if (canTrace) {
      form.setValue('useBlockchain', true);
      setBlockchainVerified(true);
    } else {
      form.setValue('useBlockchain', false);
      setBlockchainVerified(false);
    }
  };
  
  // Create marketplace listing
  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormValues) => {
      // Format the data for API
      const formattedData: any = {
        ...data,
        price: parseFloat(data.price),
        quantity: data.quantity ? parseFloat(data.quantity) : undefined,
        sellerId: user?.id,
        sourceCropId: data.useBlockchain ? selectedCropId : undefined,
      };
      
      // Remove UI-only field
      delete formattedData.useBlockchain;
      
      // Create the listing
      const response = await apiRequest('POST', '/api/marketplace/listings', formattedData);
      return await response.json();
    },
    onSuccess: async (data) => {
      // If we're using blockchain verification, link the listing to the crop
      if (form.getValues('useBlockchain') && selectedCropId) {
        try {
          await apiRequest('POST', `/marketplace/listings/${data.id}/trace`, { cropId: selectedCropId });
        } catch (error) {
          console.error("Error linking listing to crop:", error);
          // We'll show a warning but not fail the whole operation
          toast({
            title: "Listing Created",
            description: "Listing created but blockchain verification failed. You can try again later.",
            variant: "warning",
          });
          return;
        }
      }
      
      toast({
        title: "Listing Created",
        description: "Your crop has been listed on the marketplace successfully.",
      });
      
      // Redirect to the marketplace
      navigate("/marketplace");
    },
    onError: (error) => {
      console.error("Error creating listing:", error);
      toast({
        title: "Listing Failed",
        description: "Could not create marketplace listing. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ListingFormValues) => {
    createListingMutation.mutate(data);
  };
  
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">List Crop on Marketplace</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Traceability</CardTitle>
          <CardDescription>
            Add blockchain verification to your marketplace listing to build trust and transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Verify Product Authenticity</h3>
                <p className="text-sm text-muted-foreground">
                  Link your marketplace listing to a crop's blockchain record to allow buyers to verify its complete history.
                </p>
              </div>
            </div>
            
            {isLoadingCrops ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span>Loading your crops...</span>
              </div>
            ) : crops && crops.length > 0 ? (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="cropId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select a Crop</FormLabel>
                      <Select onValueChange={(value) => handleCropSelect(value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a crop to link" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {traceableCrops.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium text-primary">
                                Blockchain Enabled Crops
                              </div>
                              {traceableCrops.map((crop) => (
                                <SelectItem key={crop.id} value={crop.id.toString()}>
                                  <div className="flex items-center">
                                    <span>{crop.name} {crop.variety ? `(${crop.variety})` : ''}</span>
                                    <Badge variant="outline" size="sm" className="ml-2 bg-green-50 text-green-600 border-green-200">
                                      <Check className="h-3 w-3 mr-1" />
                                      Traceable
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {nonTraceableCrops.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                Standard Crops (No Blockchain)
                              </div>
                              {nonTraceableCrops.map((crop) => (
                                <SelectItem key={crop.id} value={crop.id.toString()}>
                                  {crop.name} {crop.variety ? `(${crop.variety})` : ''}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="useBlockchain"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Blockchain Verification</FormLabel>
                        <FormDescription>
                          {blockchainVerified 
                            ? "This listing will be verified on the blockchain" 
                            : "Select a blockchain-enabled crop to use this feature"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!blockchainVerified}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('useBlockchain') && (
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Blockchain Verification Enabled</AlertTitle>
                    <AlertDescription>
                      Buyers will be able to scan a QR code to verify this product's complete history from planting to harvest.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert variant="warning">
                <AlertTitle>No Crops Found</AlertTitle>
                <AlertDescription>
                  You need to add crops before you can list them on the marketplace.
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/crops/add")}>
                    Add a crop
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>
            Provide information about the product you want to sell
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Organic Maize" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="grains">Grains</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="seeds">Seeds</SelectItem>
                          <SelectItem value="livestock">Livestock</SelectItem>
                          <SelectItem value="dairy">Dairy Products</SelectItem>
                          <SelectItem value="fertilizer">Fertilizer</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="feed">Animal Feed</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product in detail..."
                        className="min-h-24 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priceCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ZMW">ZMW (Zambian Kwacha)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priceUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Price per unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Per Kilogram</SelectItem>
                          <SelectItem value="ton">Per Ton</SelectItem>
                          <SelectItem value="bag">Per Bag</SelectItem>
                          <SelectItem value="unit">Per Unit</SelectItem>
                          <SelectItem value="batch">Per Batch</SelectItem>
                          <SelectItem value="total">Total Price</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Available</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quantityUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="ton">Tons</SelectItem>
                          <SelectItem value="g">Grams</SelectItem>
                          <SelectItem value="lb">Pounds</SelectItem>
                          <SelectItem value="unit">Units</SelectItem>
                          <SelectItem value="bag">Bags</SelectItem>
                          <SelectItem value="box">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +260 9XX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New/Fresh</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <FormField
                  control={form.control}
                  name="deliveryAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Delivery Available</FormLabel>
                        <FormDescription>
                          Can you deliver this product to buyers?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isNegotiable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 flex-1">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Price Negotiable</FormLabel>
                        <FormDescription>
                          Are you open to price negotiations?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <CardFooter className="flex justify-end gap-2 px-0">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createListingMutation.isPending}>
                  {createListingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    "Create Listing"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}