import { useState, useEffect } from "react";
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
import {
  Loader2,
  Save,
  // UserCircle,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  // Calendar,
  // Phone,
  // Mail,
  Crop,
  TrendingUp,
  Award,
  Shield,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

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
  contactPhone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  establishedYear: z
    .union([
      z.number(),
      z.string().transform((val) => (val ? parseInt(val, 10) : undefined)),
      z.null(),
    ])
    .optional(),
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
  const {
    data: farmerProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["/api/farmer-profile"],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching farmer profile...");
        const response = await fetch("/api/farmer-profile");
        if (!response.ok) {
          console.log(
            "❌ Failed to fetch farmer profile:",
            response.status,
            response.statusText
          );
          throw new Error("Failed to fetch farmer profile");
        }
        const data = await response.json();
        console.log("✅ Farmer profile fetched:", data);
        return data;
      } catch (error) {
        console.error("Error fetching farmer profile:", error);
        return null;
      }
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });

  // Fetch statistics for the profile
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      try {
        const [fieldsRes, cropsRes, tasksRes] = await Promise.all([
          fetch("/api/fields"),
          fetch("/api/crops"),
          fetch("/api/tasks"),
        ]);

        const fields = fieldsRes.ok ? await fieldsRes.json() : [];
        const crops = cropsRes.ok ? await cropsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];

        return {
          totalFields: fields.length,
          totalCrops: crops.length,
          activeTasks: tasks.filter((task: any) => !task.completed).length,
          completedTasks: tasks.filter((task: any) => task.completed).length,
        };
      } catch (error) {
        // console.error("Error fetching stats:", error);
        return {
          totalFields: 0,
          totalCrops: 0,
          activeTasks: 0,
          completedTasks: 0,
        };
      }
    },
  });

  // Calculate profile enhancement suggestions
  const getProfileEnhancements = () => {
    if (!farmerProfile || !user) return { suggestions: [], isComplete: false };

    const optionalFields = [
      { field: farmerProfile.establishedYear, label: "Established Year" },
      { field: farmerProfile.bio, label: "Farm Bio" },
      { field: farmerProfile.contactPhone, label: "Contact Phone" },
      { field: farmerProfile.mainCrops?.length, label: "Main Crops" },
    ];

    const missingSuggestions = optionalFields
      .filter(
        ({ field }) =>
          !field || (typeof field === "string" && field.trim() === "")
      )
      .map(({ label }) => label);

    return {
      suggestions: missingSuggestions,
      isComplete: missingSuggestions.length === 0,
      completionPercentage: Math.round(
        ((optionalFields.length - missingSuggestions.length) /
          optionalFields.length) *
          100
      ),
    };
  };

  const profileEnhancements = getProfileEnhancements();

  // Setup form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(
      z.object({
        ...profileUserSchema.shape,
        ...extendedFarmerProfileSchema.omit({ mainCrops: true }).shape,
      })
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
  useEffect(() => {
    if (user && farmerProfile) {
      const formData = {
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
      };

      console.log("📝 Populating form with data:", formData);
      console.log("👤 User data:", user);
      console.log("🚜 Farmer profile data:", farmerProfile);

      form.reset(formData);
    }
  }, [user, farmerProfile, form]);

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
            ? parseInt(data.establishedYear.toString())
            : null,
        }
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
          <div className="text-center space-y-2">
            <p className="text-lg text-gray-500">
              Your farmer profile is being set up.
            </p>
            <p className="text-sm text-gray-400">
              If you're seeing this, there might be an issue with your profile
              creation.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="/profile-creation">Complete Profile Setup</a>
            </Button>
            <Button
              onClick={() => {
                console.log("🔄 Manual refresh requested");
                refetchProfile();
              }}
              variant="default"
            >
              Refresh Profile
            </Button>
            <Button
              onClick={async () => {
                try {
                  console.log("🔍 Checking farmer profile status...");
                  const response = await fetch(
                    "/api/test/check-farmer-profile"
                  );
                  const data = await response.json();
                  console.log("📊 Farmer profile debug data:", data);
                  toast({
                    title: "Debug Info",
                    description:
                      "Check console for detailed farmer profile status",
                    duration: 3000,
                  });
                } catch (error) {
                  console.error("Error checking farmer profile:", error);
                  toast({
                    title: "Debug Error",
                    description: "Failed to fetch debug info",
                    variant: "destructive",
                  });
                }
              }}
              variant="secondary"
              size="sm"
            >
              Debug
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Profile"
      description="View and edit your profile information"
    >
      {/* Profile Enhancement Suggestions */}
      {!profileEnhancements.isComplete && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Enhance Your Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Consider adding these optional details to showcase your
                      farm better
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {profileEnhancements.completionPercentage}% Enhanced
                </Badge>
              </div>
              <Progress
                value={profileEnhancements.completionPercentage}
                className="h-2 mb-3"
              />
              {profileEnhancements.suggestions.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Suggestions: </span>
                  {profileEnhancements.suggestions.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fields</p>
                  <p className="text-2xl font-bold">{stats.totalFields}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Crop className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crops</p>
                  <p className="text-2xl font-bold">{stats.totalCrops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{stats.activeTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="relative">
              <CardTitle className="text-2xl">Farmer Profile</CardTitle>
              <CardDescription>
                View and update your farmer profile information
              </CardDescription>

              <div className="absolute right-6 top-4 md:top-6 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log("🔄 Refreshing profile data...");
                    refetchProfile();
                    toast({
                      title: "Refreshing profile",
                      description: "Fetching latest profile data...",
                      duration: 2000,
                    });
                  }}
                  className="gap-2"
                  title="Refresh profile data"
                >
                  <Settings className="h-4 w-4" />
                </Button>
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
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value ? parseInt(value, 10) : undefined
                                );
                              }}
                              value={field.value?.toString() ?? ""}
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
                              value={field.value || undefined}
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
                              value={field.value ?? ""}
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
                              value={field.value ?? ""}
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
                    {user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "User"}
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

                    <ChangePasswordForm />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Manage how you receive notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description:
                          "Email notification settings will be available soon.",
                      });
                    }}
                  >
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time alerts
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description:
                          "Push notification settings will be available soon.",
                      });
                    }}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      Control who can see your profile
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Privacy settings will be available soon.",
                      });
                    }}
                  >
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description:
                          "Two-factor authentication will be available soon.",
                      });
                    }}
                  >
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export your data or manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description:
                          "Data export functionality will be available soon.",
                      });
                    }}
                  >
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">
                      Delete Account
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Account Deletion",
                        description:
                          "This action cannot be undone. Please contact support for account deletion.",
                        variant: "destructive",
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
