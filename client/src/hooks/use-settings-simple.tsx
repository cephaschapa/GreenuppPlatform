import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from 'zod';

// Define the schemas for our settings
const displaySettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.number().min(80).max(120),
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weatherAlerts: z.boolean(),
  marketPriceAlerts: z.boolean(),
  taskReminders: z.boolean(),
});

const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.enum(["never", "1hour", "8hours", "24hours"]),
  loginNotifications: z.boolean(),
});

const privacySettingsSchema = z.object({
  shareData: z.boolean(),
  profileVisibility: z.enum(["public", "private", "connections"]),
  locationSharing: z.boolean(),
});

const unitSettingsSchema = z.object({
  temperatureUnit: z.enum(["celsius", "fahrenheit"]),
  distanceUnit: z.enum(["metric", "imperial"]),
  weightUnit: z.enum(["metric", "imperial"]),
  dateFormat: z.enum(["DMY", "MDY", "YMD"]),
});

const settingsSchema = z.object({
  notifications: notificationSettingsSchema,
  display: displaySettingsSchema,
  security: securitySettingsSchema,
  privacy: privacySettingsSchema,
  units: unitSettingsSchema,
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type DisplaySettings = z.infer<typeof displaySettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type UnitSettings = z.infer<typeof unitSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;

export function useSettingsSimple() {
  const {
    data: settings,
    error,
    isLoading,
  } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Apply theme from settings
  if (settings?.display.theme) {
    const theme = settings.display.theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  // Display settings mutation
  const updateDisplayMutation = useMutation({
    mutationFn: async (data: DisplaySettings) => {
      const res = await apiRequest("PATCH", "/api/settings", { 
        type: 'display', 
        settings: data 
      });
      return await res.json();
    },
    onSuccess: (data: Settings) => {
      queryClient.setQueryData(["/api/settings"], data);
      
      // Apply theme change immediately
      const theme = data.display.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      toast({
        title: "Display settings updated",
        description: "Your display preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update display settings",
        description: "There was an error updating your display settings.",
        variant: "destructive",
      });
    },
  });

  // Notification settings mutation
  const updateNotificationMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      const res = await apiRequest("PATCH", "/api/settings", { 
        type: 'notifications', 
        settings: data 
      });
      return await res.json();
    },
    onSuccess: (data: Settings) => {
      queryClient.setQueryData(["/api/settings"], data);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update notification settings",
        description: "There was an error updating your notification settings.",
        variant: "destructive",
      });
    },
  });

  // Security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: async (data: SecuritySettings) => {
      const res = await apiRequest("PATCH", "/api/settings", { 
        type: 'security', 
        settings: data 
      });
      return await res.json();
    },
    onSuccess: (data: Settings) => {
      queryClient.setQueryData(["/api/settings"], data);
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update security settings",
        description: "There was an error updating your security settings.",
        variant: "destructive",
      });
    },
  });

  // Privacy settings mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: PrivacySettings) => {
      const res = await apiRequest("PATCH", "/api/settings", { 
        type: 'privacy', 
        settings: data 
      });
      return await res.json();
    },
    onSuccess: (data: Settings) => {
      queryClient.setQueryData(["/api/settings"], data);
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update privacy settings",
        description: "There was an error updating your privacy settings.",
        variant: "destructive",
      });
    },
  });

  // Unit settings mutation
  const updateUnitMutation = useMutation({
    mutationFn: async (data: UnitSettings) => {
      const res = await apiRequest("PATCH", "/api/settings", { 
        type: 'units', 
        settings: data 
      });
      return await res.json();
    },
    onSuccess: (data: Settings) => {
      queryClient.setQueryData(["/api/settings"], data);
      toast({
        title: "Unit settings updated",
        description: "Your unit preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update unit settings",
        description: "There was an error updating your unit settings.",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateDisplaySettings: updateDisplayMutation.mutate,
    updateNotificationSettings: updateNotificationMutation.mutate,
    updateSecuritySettings: updateSecurityMutation.mutate,
    updatePrivacySettings: updatePrivacyMutation.mutate,
    updateUnitSettings: updateUnitMutation.mutate,
    isUpdatingDisplay: updateDisplayMutation.isPending,
    isUpdatingNotifications: updateNotificationMutation.isPending,
    isUpdatingSecurity: updateSecurityMutation.isPending,
    isUpdatingPrivacy: updatePrivacyMutation.isPending,
    isUpdatingUnits: updateUnitMutation.isPending,
  };
}