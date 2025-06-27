import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, Plus, X, MapPin, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import LocationSelector, {
  LocationData,
} from "@/components/marketplace/LocationSelector";
import { useAuth } from "@/hooks/use-auth";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Marketplace category list
const MARKETPLACE_CATEGORIES = [
  { id: "pesticides", name: "Pesticides & Herbicides", icon: "🦠" },
  { id: "fertilizers", name: "Fertilizers & Soil Amendments", icon: "🌱" },
  { id: "seeds", name: "Seeds & Plants", icon: "🌾" },
  { id: "equipment", name: "Farm Equipment", icon: "🚜" },
  { id: "tools", name: "Tools & Supplies", icon: "🔧" },
  { id: "livestock", name: "Livestock & Feed", icon: "🐄" },
  { id: "irrigation", name: "Irrigation Systems", icon: "💧" },
  { id: "organic", name: "Organic Products", icon: "🌿" },
  { id: "biocontrol", name: "Biological Control", icon: "🦗" },
  { id: "soil-health", name: "Soil Health Products", icon: "🏞️" },
  { id: "crop-protection", name: "Crop Protection", icon: "🛡️" },
  { id: "precision-ag", name: "Precision Agriculture", icon: "📡" },
  { id: "post-harvest", name: "Post-Harvest Solutions", icon: "📦" },
  { id: "services", name: "Agricultural Services", icon: "👨‍🌾" },
  { id: "produce", name: "Farm Produce", icon: "🥕" },
  { id: "other", name: "Other", icon: "📋" },
];

// Category specific subcategories
const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
  seeds: [
    { id: "maize", name: "Maize" },
    { id: "wheat", name: "Wheat" },
    { id: "rice", name: "Rice" },
    { id: "vegetables", name: "Vegetables" },
    { id: "fruits", name: "Fruits" },
    { id: "other_seeds", name: "Other Seeds" },
  ],
  equipment: [
    { id: "tractors", name: "Tractors" },
    { id: "harvesters", name: "Harvesters" },
    { id: "ploughs", name: "Ploughs" },
    { id: "irrigation", name: "Irrigation Equipment" },
    { id: "other_equipment", name: "Other Equipment" },
  ],
  // Add more subcategories for other categories as needed
};

// Form schema with validation
const listingSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  subcategory: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  priceCurrency: z.string().default("ZMW"),
  priceUnit: z.string().optional(),
  quantity: z.string().optional(),
  quantityUnit: z.string().optional(),
  condition: z.string().optional(),
  contactPhone: z.string().optional(),
  isNegotiable: z.boolean().default(false),
  deliveryAvailable: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  // We'll handle images separately
});

type ListingFormValues = z.infer<typeof listingSchema>;

export default function CreateListingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Create form
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      price: "",
      priceCurrency: "ZMW",
      priceUnit: "",
      quantity: "",
      quantityUnit: "",
      condition: "",
      contactPhone: "",
      isNegotiable: false,
      deliveryAvailable: false,
      tags: [],
    },
  });

  // Log user data when component mounts
  useEffect(() => {
    console.log("Current user data:", user);
  }, [user]);

  // Get the selected category to show relevant subcategories
  const watchCategory = form.watch("category");

  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);

    // Limit to 5 images max
    if (images.length + newFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      });
      return;
    }

    // Create preview URLs for the images
    const newImagePreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviewUrls((prev) => [...prev, ...newImagePreviews]);
  };

  // Remove an image
  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Get user's location
  const detectLocation = () => {
    setLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Use our proxy endpoint instead of calling Nominatim directly
            const response = await fetch(
              `/api/geocode/reverse?lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
              const newLocationData: LocationData = {
                latitude: lat,
                longitude: lng,
                country: data.address.country || "",
                region: data.address.state || data.address.county || "",
                city:
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "",
                neighborhood:
                  data.address.suburb || data.address.neighbourhood || null,
                postalCode: data.address.postcode || null,
                formattedAddress: data.display_name || null,
                placeId: data.place_id?.toString() || null,
              };

              setLocationData(newLocationData);

              toast({
                title: "Location detected",
                description:
                  "Your current location has been added to the listing",
              });
            }
          } catch (error) {
            console.error("Error fetching location data:", error);
            toast({
              title: "Location error",
              description:
                "Could not get location details. Please try setting it manually.",
              variant: "destructive",
            });
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);

          toast({
            title: "Location error",
            description:
              "Could not detect your location. Please try again or enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Creating listing with form data");
      console.log("API endpoint:", "/api/marketplace/listings");

      // Log form data entries in a safer way
      const entries: string[] = [];
      formData.forEach((value, key) => {
        if (key === "images") {
          entries.push(`${key}: [File object]`);
        } else {
          entries.push(`${key}: ${value}`);
        }
      });
      console.log("Form data entries:", entries.join(", "));

      try {
        // Back to using real endpoint with debug middleware active
        console.log("USING REAL ENDPOINT WITH DEBUG MIDDLEWARE");
        const response = await apiRequest(
          "POST",
          "/api/marketplace/listings",
          formData,
          {
            isFormData: true,
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Error in createListingMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the listings query to refetch the updated list
      queryClient.invalidateQueries({
        queryKey: ["/api/marketplace/listings"],
      });

      toast({
        title: "Listing created",
        description: "Your listing has been successfully created",
      });

      // Navigate back to marketplace
      setLocation("/dashboard/marketplace");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating listing",
        description:
          error.message || "There was an error creating your listing",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (values: ListingFormValues) => {
    // Check if images are uploaded
    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image for your listing",
        variant: "destructive",
      });
      return;
    }

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add form values - ensure all field names match backend schema
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays like tags
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add location data if available
    if (locationData) {
      formData.append("latitude", locationData.latitude.toString());
      formData.append("longitude", locationData.longitude.toString());
      formData.append("country", locationData.country);
      formData.append("region", locationData.region);
      formData.append("city", locationData.city);

      if (locationData.neighborhood) {
        formData.append("neighborhood", locationData.neighborhood);
      }

      if (locationData.postalCode) {
        formData.append("postalCode", locationData.postalCode);
      }

      if (locationData.formattedAddress) {
        formData.append("formattedAddress", locationData.formattedAddress);
      }
    }

    // Add images
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    // Log the form data for debugging
    console.log("Form values being sent:", values);
    console.log("FormData entries:");
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Submit the form
    createListingMutation.mutate(formData);
  };

  const navigateBack = () => {
    setLocation("/dashboard/marketplace");
  };

  return (
    <DashboardLayout
      title="Create Listing"
      description="Create a new marketplace listing"
    >
      <div className="container mx-auto px-4 py-6">
        <Button variant="link" onClick={navigateBack} className="p-0 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-6">
          Create New Listing
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. High-yield Maize Seeds (10kg)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A clear, descriptive title will attract more buyers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your item in detail, including quality, specifications, and any other relevant information"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MARKETPLACE_CATEGORIES.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchCategory && SUBCATEGORIES[watchCategory] && (
                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SUBCATEGORIES[watchCategory].map(
                                (subcategory) => (
                                  <SelectItem
                                    key={subcategory.id}
                                    value={subcategory.id}
                                  >
                                    {subcategory.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ZMW">
                              ZMW (Zambian Kwacha)
                            </SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Additional Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10" {...field} />
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
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="g">Grams (g)</SelectItem>
                            <SelectItem value="lb">Pounds (lb)</SelectItem>
                            <SelectItem value="ton">Tons</SelectItem>
                            <SelectItem value="piece">Pieces</SelectItem>
                            <SelectItem value="bag">Bags</SelectItem>
                            <SelectItem value="box">Boxes</SelectItem>
                            <SelectItem value="crate">Crates</SelectItem>
                            <SelectItem value="acre">Acres</SelectItem>
                            <SelectItem value="hectare">Hectares</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="like_new">Like New</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                            <SelectItem value="for_parts">For Parts</SelectItem>
                            <SelectItem value="not_applicable">
                              Not Applicable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +1234567890" {...field} />
                        </FormControl>
                        <FormDescription>
                          If not provided, buyers will contact you through the
                          platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <div className="flex flex-col md:flex-row gap-6">
                      <FormField
                        control={form.control}
                        name="isNegotiable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0 gap-2">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Price Negotiable
                              </FormLabel>
                              <FormDescription>
                                Let buyers know if the price is negotiable
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
                        name="deliveryAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0 gap-2">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Delivery Available
                              </FormLabel>
                              <FormDescription>
                                Indicate if you can deliver the item
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>

                <div className="flex items-center space-x-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={detectLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Use Current Location
                      </>
                    )}
                  </Button>

                  {locationData && (
                    <div className="text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {locationData.formattedAddress ||
                        `${locationData.city}${
                          locationData.region ? `, ${locationData.region}` : ""
                        }, ${locationData.country}`}
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Map-based location selector */}
                <div className="mt-4 mb-6">
                  <LocationSelector
                    initialLocation={locationData}
                    onLocationSelect={(location) => setLocationData(location)}
                  />
                </div>

                <div className="text-sm text-muted-foreground mt-4">
                  <p>
                    Your approximate location will be shown to potential buyers.
                    Exact address will not be shared.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Upload Images{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    (max 5)
                  </span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-muted rounded-md overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="flex flex-col items-center justify-center aspect-square bg-muted hover:bg-muted/80 rounded-md cursor-pointer border-2 border-dashed border-muted-foreground/25">
                      <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Clear, high-quality images from multiple angles will help
                    your listing sell faster. First image will be the main
                    image.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={navigateBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createListingMutation.isPending}
              >
                {createListingMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
