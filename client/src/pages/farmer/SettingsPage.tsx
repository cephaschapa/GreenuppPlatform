import { useState, useEffect } from "react";
import { useSettingsSimple } from "@/hooks/use-settings-simple";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Save,
  // CheckCircle,
  // AlertCircle,
  // BellRing,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { LiteModeToggle } from "@/components/LiteModeToggle";

// Define settings schemas
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  weatherAlerts: z.boolean().default(true),
  marketPriceAlerts: z.boolean().default(false),
  taskReminders: z.boolean().default(true),
});

const displaySettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.number().min(80).max(120).default(100),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
});

const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z
    .enum(["never", "1hour", "8hours", "24hours"])
    .default("never"),
  loginNotifications: z.boolean().default(true),
});

const privacySettingsSchema = z.object({
  shareData: z.boolean().default(true),
  profileVisibility: z
    .enum(["public", "private", "connections"])
    .default("public"),
  locationSharing: z.boolean().default(true),
});

const unitSettingsSchema = z.object({
  temperatureUnit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  distanceUnit: z.enum(["metric", "imperial"]).default("metric"),
  weightUnit: z.enum(["metric", "imperial"]).default("metric"),
  dateFormat: z.enum(["DMY", "MDY", "YMD"]).default("DMY"),
});

// Combine all settings schemas
const allSettingsSchema = z.object({
  notifications: notificationSettingsSchema,
  display: displaySettingsSchema,
  security: securitySettingsSchema,
  privacy: privacySettingsSchema,
  units: unitSettingsSchema,
});

// Form value types
type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
type DisplaySettings = z.infer<typeof displaySettingsSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;
type PrivacySettings = z.infer<typeof privacySettingsSchema>;
type UnitSettings = z.infer<typeof unitSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Use our settings hook to fetch and update settings
  const {
    settings,
    isLoading: settingsLoading,
    updateDisplaySettings: updateDisplaySettingsApi,
    updateNotificationSettings: updateNotificationSettingsApi,
    updateSecuritySettings: updateSecuritySettingsApi,
    updatePrivacySettings: updatePrivacySettingsApi,
    updateUnitSettings: updateUnitSettingsApi,
    isUpdatingDisplay,
    isUpdatingNotifications,
    isUpdatingSecurity,
    isUpdatingPrivacy,
    isUpdatingUnits,
  } = useSettingsSimple();

  // Set default settings
  const defaultSettings = {
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      weatherAlerts: true,
      marketPriceAlerts: false,
      taskReminders: true,
    },
    display: {
      theme: theme as "light" | "dark" | "system",
      fontSize: 100,
      reducedMotion: false,
      highContrast: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "never" as const,
      loginNotifications: true,
    },
    privacy: {
      shareData: true,
      profileVisibility: "public" as const,
      locationSharing: true,
    },
    units: {
      temperatureUnit: "celsius" as const,
      distanceUnit: "metric" as const,
      weightUnit: "metric" as const,
      dateFormat: "DMY" as const,
    },
  };

  // Notification settings form
  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: settings?.notifications
      ? {
          emailNotifications: settings.notifications.emailNotifications,
          pushNotifications: settings.notifications.pushNotifications,
          smsNotifications: settings.notifications.smsNotifications,
          weatherAlerts: settings.notifications.weatherAlerts,
          marketPriceAlerts: settings.notifications.marketPriceAlerts,
          taskReminders: settings.notifications.taskReminders,
        }
      : defaultSettings.notifications,
  });

  // Display settings form
  const displayForm = useForm<DisplaySettings>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: settings?.display
      ? {
          theme: settings.display.theme as "light" | "dark" | "system",
          fontSize: settings.display.fontSize,
          reducedMotion: settings.display.reducedMotion,
          highContrast: settings.display.highContrast,
        }
      : {
          ...defaultSettings.display,
          theme: theme as "light" | "dark" | "system",
        },
  });

  // Security settings form
  const securityForm = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settings?.security
      ? {
          twoFactorAuth: settings.security.twoFactorAuth,
          sessionTimeout: settings.security.sessionTimeout as
            | "never"
            | "1hour"
            | "8hours"
            | "24hours",
          loginNotifications: settings.security.loginNotifications,
        }
      : defaultSettings.security,
  });

  // Privacy settings form
  const privacyForm = useForm<PrivacySettings>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: settings?.privacy
      ? {
          shareData: settings.privacy.shareData,
          profileVisibility: settings.privacy.profileVisibility as
            | "public"
            | "private"
            | "connections",
          locationSharing: settings.privacy.locationSharing,
        }
      : defaultSettings.privacy,
  });

  // Unit settings form
  const unitForm = useForm<UnitSettings>({
    resolver: zodResolver(unitSettingsSchema),
    defaultValues: settings?.units
      ? {
          temperatureUnit: settings.units.temperatureUnit as
            | "celsius"
            | "fahrenheit",
          distanceUnit: settings.units.distanceUnit as "metric" | "imperial",
          weightUnit: settings.units.weightUnit as "metric" | "imperial",
          dateFormat: settings.units.dateFormat as "DMY" | "MDY" | "YMD",
        }
      : defaultSettings.units,
  });

  // Handle notification settings update
  const updateNotificationSettings = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      // This would be an API call in a real implementation
      // await apiRequest("PATCH", "/api/settings/notifications", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle display settings update
  const updateDisplaySettings = useMutation({
    mutationFn: async (data: DisplaySettings) => {
      // Actually update the theme
      setTheme(data.theme);

      // This would be an API call in a real implementation
      // await apiRequest("PATCH", "/api/settings/display", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Display settings updated",
        description: "Your display preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle security settings update
  const updateSecuritySettings = useMutation({
    mutationFn: async (data: SecuritySettings) => {
      // This would be an API call in a real implementation
      // await apiRequest("PATCH", "/api/settings/security", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle privacy settings update
  const updatePrivacySettings = useMutation({
    mutationFn: async (data: PrivacySettings) => {
      // This would be an API call in a real implementation
      // await apiRequest("PATCH", "/api/settings/privacy", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle unit settings update
  const updateUnitSettings = useMutation({
    mutationFn: async (data: UnitSettings) => {
      // This would be an API call in a real implementation
      // await apiRequest("PATCH", "/api/settings/units", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Unit preferences updated",
        description: "Your unit preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit handlers
  const onNotificationSubmit = (data: NotificationSettings) => {
    updateNotificationSettingsApi(data);
    // Also update the theme in ThemeProvider when changing display settings
    setTheme(displayForm.getValues().theme);
  };

  const onDisplaySubmit = (data: DisplaySettings) => {
    updateDisplaySettingsApi(data);
    // Also update the theme in ThemeProvider when changing display settings
    setTheme(data.theme);
  };

  const onSecuritySubmit = (data: SecuritySettings) => {
    updateSecuritySettingsApi(data);
  };

  const onPrivacySubmit = (data: PrivacySettings) => {
    updatePrivacySettingsApi(data);
  };

  const onUnitSubmit = (data: UnitSettings) => {
    updateUnitSettingsApi(data);
  };

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      if (settings.display) {
        displayForm.reset({
          theme: settings.display.theme as "light" | "dark" | "system",
          fontSize: settings.display.fontSize,
          reducedMotion: settings.display.reducedMotion,
          highContrast: settings.display.highContrast,
        });
      }

      if (settings.notifications) {
        notificationForm.reset({
          emailNotifications: settings.notifications.emailNotifications,
          pushNotifications: settings.notifications.pushNotifications,
          smsNotifications: settings.notifications.smsNotifications,
          weatherAlerts: settings.notifications.weatherAlerts,
          marketPriceAlerts: settings.notifications.marketPriceAlerts,
          taskReminders: settings.notifications.taskReminders,
        });
      }

      if (settings.security) {
        securityForm.reset({
          twoFactorAuth: settings.security.twoFactorAuth,
          sessionTimeout: settings.security.sessionTimeout as
            | "never"
            | "1hour"
            | "8hours"
            | "24hours",
          loginNotifications: settings.security.loginNotifications,
        });
      }

      if (settings.privacy) {
        privacyForm.reset({
          shareData: settings.privacy.shareData,
          profileVisibility: settings.privacy.profileVisibility as
            | "public"
            | "private"
            | "connections",
          locationSharing: settings.privacy.locationSharing,
        });
      }

      if (settings.units) {
        unitForm.reset({
          temperatureUnit: settings.units.temperatureUnit as
            | "celsius"
            | "fahrenheit",
          distanceUnit: settings.units.distanceUnit as "metric" | "imperial",
          weightUnit: settings.units.weightUnit as "metric" | "imperial",
          dateFormat: settings.units.dateFormat as "DMY" | "MDY" | "YMD",
        });
      }
    }
  }, [
    settings,
    displayForm,
    notificationForm,
    securityForm,
    privacyForm,
    unitForm,
  ]);

  if (settingsLoading) {
    return (
      <DashboardLayout
        title="Settings"
        description="Customize your application settings"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Settings"
      description="Customize your application settings"
    >
      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger
            value="display"
            className="px-2 text-xs sm:text-sm line-clamp-1"
          >
            Display
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="px-2 text-xs sm:text-sm line-clamp-1"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="units"
            className="px-2 text-xs sm:text-sm line-clamp-1"
          >
            Units
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="px-2 text-xs sm:text-sm line-clamp-1"
          >
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Display Settings */}
        <TabsContent value="display" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Display Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...displayForm}>
                <form
                  onSubmit={displayForm.handleSubmit(onDisplaySubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={displayForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div
                            className={`flex flex-col items-center justify-center p-2 rounded-md border-2 transition-all cursor-pointer ${
                              field.value === "light"
                                ? "border-primary"
                                : "border-transparent"
                            }`}
                            onClick={() => field.onChange("light")}
                          >
                            <Sun className="h-8 w-8 mb-2" />
                            <span>Light</span>
                          </div>
                          <div
                            className={`flex flex-col items-center justify-center p-2 rounded-md border-2 transition-all cursor-pointer ${
                              field.value === "dark"
                                ? "border-primary"
                                : "border-transparent"
                            }`}
                            onClick={() => field.onChange("dark")}
                          >
                            <Moon className="h-8 w-8 mb-2" />
                            <span>Dark</span>
                          </div>
                          <div
                            className={`flex flex-col items-center justify-center p-2 rounded-md border-2 transition-all cursor-pointer ${
                              field.value === "system"
                                ? "border-primary"
                                : "border-transparent"
                            }`}
                            onClick={() => field.onChange("system")}
                          >
                            <Monitor className="h-8 w-8 mb-2" />
                            <span>System</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={displayForm.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Size ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            min={80}
                            max={120}
                            step={5}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm line-clamp-2">
                          Adjust the text size throughout the application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={displayForm.control}
                      name="reducedMotion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              Reduced Motion
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Minimize animations across the interface
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
                      control={displayForm.control}
                      name="highContrast"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              High Contrast
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Increase contrast for better readability
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

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={isUpdatingDisplay}
                    >
                      {isUpdatingDisplay ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Display Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Lite Mode Toggle */}
          <div className="mt-6">
            <LiteModeToggle />
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              Email Notifications
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Receive important updates via email
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
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              Push Notifications
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Receive alerts directly in your browser
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
                      control={notificationForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              SMS Notifications
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Receive alerts via text message
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
                      control={notificationForm.control}
                      name="weatherAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              Weather Alerts
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Get notified about important weather changes
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
                      control={notificationForm.control}
                      name="marketPriceAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              Market Price Alerts
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Stay informed about significant market price
                              changes
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
                      control={notificationForm.control}
                      name="taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                          <div className="space-y-0.5 max-w-[70%]">
                            <FormLabel className="text-sm sm:text-base line-clamp-1">
                              Task Reminders
                            </FormLabel>
                            <FormDescription className="text-xs sm:text-sm line-clamp-2">
                              Get reminded about upcoming and due tasks
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

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={isUpdatingNotifications}
                    >
                      {isUpdatingNotifications ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Notification Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Settings */}
        <TabsContent value="units" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Units & Formats</CardTitle>
              <CardDescription>
                Choose your preferred measurement units and date formats
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...unitForm}>
                <form
                  onSubmit={unitForm.handleSubmit(onUnitSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={unitForm.control}
                      name="temperatureUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select temperature unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="celsius">
                                Celsius (°C)
                              </SelectItem>
                              <SelectItem value="fahrenheit">
                                Fahrenheit (°F)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs sm:text-sm line-clamp-2">
                            Used for weather and temperature data
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={unitForm.control}
                      name="distanceUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select distance unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="metric">
                                Metric (meters, kilometers)
                              </SelectItem>
                              <SelectItem value="imperial">
                                Imperial (feet, miles)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs sm:text-sm line-clamp-2">
                            Used for field sizes and distances
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={unitForm.control}
                      name="weightUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select weight unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="metric">
                                Metric (kilograms, tonnes)
                              </SelectItem>
                              <SelectItem value="imperial">
                                Imperial (pounds, tons)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs sm:text-sm line-clamp-2">
                            Used for crop yields and input weights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={unitForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DMY">
                                Day/Month/Year (31/12/2024)
                              </SelectItem>
                              <SelectItem value="MDY">
                                Month/Day/Year (12/31/2024)
                              </SelectItem>
                              <SelectItem value="YMD">
                                Year/Month/Day (2024/12/31)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs sm:text-sm line-clamp-2">
                            How dates are displayed throughout the app
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={isUpdatingUnits}
                    >
                      {isUpdatingUnits ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Unit Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Privacy Settings</CardTitle>
              <CardDescription>
                Control how your information is used and shared
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...privacyForm}>
                <form
                  onSubmit={privacyForm.handleSubmit(onPrivacySubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={privacyForm.control}
                    name="shareData"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                        <div className="space-y-0.5 max-w-[70%]">
                          <FormLabel className="text-sm sm:text-base line-clamp-1">
                            Share Agricultural Data
                          </FormLabel>
                          <FormDescription className="text-xs sm:text-sm line-clamp-2">
                            Allow your anonymized farm data to be used for
                            research and improvements
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
                    control={privacyForm.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Who can see your profile" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">
                              Public (Everyone)
                            </SelectItem>
                            <SelectItem value="connections">
                              Connections Only
                            </SelectItem>
                            <SelectItem value="private">
                              Private (Only Me)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs sm:text-sm line-clamp-2">
                          Control who can view your farmer profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="locationSharing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                        <div className="space-y-0.5 max-w-[70%]">
                          <FormLabel className="text-sm sm:text-base line-clamp-1">
                            Location Sharing
                          </FormLabel>
                          <FormDescription className="text-xs sm:text-sm line-clamp-2">
                            Share your farm location for improved local services
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

                  <div className="rounded-lg border p-4 bg-muted/30">
                    <h3 className="font-medium mb-2">Data Protection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      At Greenupp, we take your privacy seriously. Your farm
                      data is protected and never sold to third parties. Sharing
                      anonymized data helps improve agricultural practices and
                      services.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-sm">
                      View Privacy Policy
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={isUpdatingPrivacy}
                    >
                      {isUpdatingPrivacy ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Privacy Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
