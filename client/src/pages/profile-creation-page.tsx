import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Redirect, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertFarmerProfileSchema, type InsertFarmerProfile } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extend the farmer profile schema with validation rules
const farmerProfileSchema = insertFarmerProfileSchema.extend({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  farmLocation: z.string().min(2, "Location is required"),
  farmSize: z.string().optional(),
  farmType: z.string().min(1, "Farm type is required"),
  contactPhone: z.string().optional(),
  mainCrops: z.array(z.string()).optional(),
  bio: z.string().optional(),
  establishedYear: z.number().optional().refine(
    (val) => !val || (val > 1800 && val <= new Date().getFullYear()),
    { message: "Please enter a valid year" }
  ),
});

// Add a cropsInput field that will be split into the mainCrops array
type FarmerProfileFormValues = Omit<z.infer<typeof farmerProfileSchema>, "mainCrops"> & {
  cropsInput: string;
};

export default function ProfileCreationPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect if user isn't logged in
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }
  
  // Redirect if user is not a farmer
  if (!isLoading && user && user.role !== 'farmer') {
    return <Redirect to="/dashboard" />;
  }

  // Check if profile already exists
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/farmer-profile'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/farmer-profile');
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch profile');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    },
  });

  // Redirect if profile already exists
  if (!isLoading && !profileLoading && existingProfile) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-green-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-space">Complete Your Farmer Profile</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Let's set up your farm details to get the most out of Greenupp
          </p>
        </div>
        
        <ProfileForm />
      </div>
    </div>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const form = useForm<FarmerProfileFormValues>({
    resolver: zodResolver(farmerProfileSchema.omit({ mainCrops: true })),
    defaultValues: {
      farmName: "",
      farmLocation: "",
      farmSize: "",
      farmType: "",
      bio: "",
      contactPhone: "",
      cropsInput: "",
      establishedYear: undefined,
    },
  });
  
  const createProfile = useMutation({
    mutationFn: async (data: InsertFarmerProfile) => {
      const res = await apiRequest("POST", "/api/farmer-profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile created!",
        description: "Your farmer profile has been set up successfully.",
      });
      // Invalidate profile query and navigate to dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/farmer-profile'] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: FarmerProfileFormValues) {
    // Convert comma-separated crops to array
    const mainCrops = values.cropsInput
      ? values.cropsInput.split(',').map(crop => crop.trim()).filter(Boolean)
      : [];
    
    // Prepare data for API
    const profileData: InsertFarmerProfile = {
      farmName: values.farmName,
      farmLocation: values.farmLocation,
      farmSize: values.farmSize || undefined,
      farmType: values.farmType,
      bio: values.bio || undefined,
      contactPhone: values.contactPhone || undefined,
      mainCrops: mainCrops.length > 0 ? mainCrops : undefined,
      establishedYear: values.establishedYear || undefined,
    };
    
    createProfile.mutate(profileData);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-space">Farm Information</CardTitle>
        <CardDescription>
          Tell us about your farm to help customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="farmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Green Acres Farm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="farmLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State/Province, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="farmType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select farm type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="crop">Crop Farming</SelectItem>
                        <SelectItem value="livestock">Livestock</SelectItem>
                        <SelectItem value="mixed">Mixed Farming</SelectItem>
                        <SelectItem value="organic">Organic Farming</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="plantation">Plantation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="farmSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Size (acres/hectares)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 50 acres" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Include units (acres, hectares)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="establishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Established</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={new Date().getFullYear().toString()}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value, 10) : undefined);
                        }}
                        value={field.value || ''}
                      />
                    </FormControl>
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
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="cropsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Crops or Livestock</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Corn, Wheat, Soybeans" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter crops/livestock separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Bio (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your farm and agricultural practices..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Skip for Now
              </Button>
              <Button 
                type="submit"
                disabled={createProfile.isPending}
              >
                {createProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}