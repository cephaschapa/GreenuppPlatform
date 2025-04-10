import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  insertFarmerProfileSchema,
  insertUserSchema,
  type InsertFarmerProfile,
  type User,
} from "@shared/schema";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, UserCircle, Edit, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define form schemas with additional validation
const profileUserSchema = insertUserSchema
  .pick({
    firstName: true,
    lastName: true,
    email: true,
  })
  .extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
  });

const extendedFarmerProfileSchema = insertFarmerProfileSchema.extend({
  farmName: z.string().min(1, "Farm name is required"),
  farmLocation: z.string().min(1, "Farm location is required"),
  farmSize: z.string().min(1, "Farm size is required"),
  cropsInput: z.string().optional(),
});

// Type for the main form that combines both schemas
type ProfileFormValues = z.infer<typeof profileUserSchema> &
  Omit<z.infer<typeof extendedFarmerProfileSchema>, "mainCrops"> & {
    cropsInput: string;
  };

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);

  // Fetch farmer profile data
  const { data: farmerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/farmer-profile"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/farmer-profile");
        if (!response.ok) {
          throw new Error("Failed to fetch farmer profile");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching farmer profile:", error);
        return null;
      }
    },
  });

  // Setup form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(
      z.object({
        ...profileUserSchema.shape,
        ...extendedFarmerProfileSchema.omit({ mainCrops: true }).shape,
      }),
    ),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      farmName: farmerProfile?.farmName || "",
      farmLocation: farmerProfile?.farmLocation || "",
      farmSize: farmerProfile?.farmSize || "",
      farmType: farmerProfile?.farmType || "",
      bio: farmerProfile?.bio || "",
      contactPhone: farmerProfile?.contactPhone || "",
      cropsInput: farmerProfile?.mainCrops?.join(", ") || "",
      establishedYear: farmerProfile?.establishedYear?.toString() || "",
    },
  });

  // Update the form when data is loaded
  useState(() => {
    if (user && farmerProfile) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        farmName: farmerProfile.farmName || "",
        farmLocation: farmerProfile.farmLocation || "",
        farmSize: farmerProfile.farmSize || "",
        farmType: farmerProfile.farmType || "",
        bio: farmerProfile.bio || "",
        contactPhone: farmerProfile.contactPhone || "",
        cropsInput: farmerProfile.mainCrops?.join(", ") || "",
        establishedYear: farmerProfile.establishedYear?.toString() || "",
      });
    }
  });

  // Handle profile update
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Update user info
      const userUpdateResponse = await apiRequest("PATCH", "/api/user", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });

      if (!userUpdateResponse.ok) {
        throw new Error("Failed to update user information");
      }

      // Process crops input to array
      const mainCrops = data.cropsInput
        ? data.cropsInput
            .split(",")
            .map((crop) => crop.trim())
            .filter(Boolean)
        : [];

      // Update farmer profile
      const profileUpdateResponse = await apiRequest(
        "PATCH",
        "/api/farmer-profile",
        {
          farmName: data.farmName,
          farmLocation: data.farmLocation,
          farmSize: data.farmSize,
          farmType: data.farmType,
          bio: data.bio,
          contactPhone: data.contactPhone,
          mainCrops,
          establishedYear: data.establishedYear
            ? parseInt(data.establishedYear)
            : null,
        },
      );

      if (!profileUpdateResponse.ok) {
        throw new Error("Failed to update farmer profile");
      }

      return {
        user: await userUpdateResponse.json(),
        profile: await profileUpdateResponse.json(),
      };
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/farmer-profile"] });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate(data);
  }

  if (profileLoading) {
    return (
      <DashboardLayout
        title="Profile"
        description="View and edit your profile information"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!farmerProfile) {
    return (
      <DashboardLayout
        title="Profile"
        description="View and edit your profile information"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-center text-lg text-gray-500">
            You haven't created a farmer profile yet.
          </p>
          <Button asChild>
            <a href="/profile-creation">Create Profile</a>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Profile"
      description="View and edit your profile information"
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="relative">
              <CardTitle className="text-2xl">Farmer Profile</CardTitle>
              <CardDescription>
                View and update your farmer profile information
              </CardDescription>

              <div className="absolute right-6 top-4 md:top-6">
                {!editMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" /> Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(false);
                      form.reset();
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="md:grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your farm name"
                              disabled={!editMode}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="establishedYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Established Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Year your farm was established"
                              disabled={!editMode}
                              {...field}
                            />
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
                            <Input
                              placeholder="Location of your farm"
                              disabled={!editMode}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="farmSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Size</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Size"
                                disabled={!editMode}
                                {...field}
                              />
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
                              disabled={!editMode}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="crop">Crop Farm</SelectItem>
                                <SelectItem value="livestock">
                                  Livestock Farm
                                </SelectItem>
                                <SelectItem value="mixed">
                                  Mixed Farm
                                </SelectItem>
                                <SelectItem value="dairy">
                                  Dairy Farm
                                </SelectItem>
                                <SelectItem value="organic">
                                  Organic Farm
                                </SelectItem>
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
                      name="cropsInput"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Crops</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter crops separated by commas"
                              disabled={!editMode}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List your main crops separated by commas (e.g.,
                            Maize, Wheat, Soybeans)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your phone number"
                              disabled={!editMode}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your farm and your agricultural experience"
                              className="min-h-[120px]"
                              disabled={!editMode}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {editMode && (
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="gap-2"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Account Information</CardTitle>
              <CardDescription>
                View and update your personal account information
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                <div className="flex flex-col items-center mx-auto md:mx- space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                      {user?.firstName?.[0] || user?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <Badge variant="outline" className="bg-primary/10">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>

                  <p className="text-xs text-muted-foreground">
                    Member since{" "}
                    {new Date(user?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>

                <div className="flex-1">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="md:grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your first name"
                                  disabled={!editMode}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your last name"
                                  disabled={!editMode}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Your email address"
                                  disabled={!editMode}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {editMode && (
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="gap-2"
                            disabled={updateProfile.isPending}
                          >
                            {updateProfile.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </Form>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your account security options and password settings
                    </p>

                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description:
                            "Password change functionality will be available soon.",
                        });
                      }}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
