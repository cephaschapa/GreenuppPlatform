import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Define types for our settings
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weatherAlerts: boolean;
  marketPriceAlerts: boolean;
  taskReminders: boolean;
}

export interface DisplaySettings {
  theme: "light" | "dark" | "system";
  fontSize: number;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: "never" | "1hour" | "8hours" | "24hours";
  loginNotifications: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  profileVisibility: "public" | "private" | "connections";
  locationSharing: boolean;
}

export interface UnitSettings {
  temperatureUnit: "celsius" | "fahrenheit";
  distanceUnit: "metric" | "imperial";
  weightUnit: "metric" | "imperial";
  dateFormat: "DMY" | "MDY" | "YMD";
}

export interface Settings {
  notifications: NotificationSettings;
  display: DisplaySettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
  units: UnitSettings;
}

export function useSettings() {
  const {
    data: settings,
    error,
    isLoading,
  } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    refetchOnWindowFocus: false,
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (notificationSettings: NotificationSettings) => {
      const res = await apiRequest("PATCH", "/api/settings", {
        type: "notifications",
        settings: notificationSettings,
      });
      return await res.json();
    },
    onSuccess: (updatedSettings: Settings) => {
      queryClient.setQueryData(["/api/settings"], updatedSettings);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update notification settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDisplaySettingsMutation = useMutation({
    mutationFn: async (displaySettings: DisplaySettings) => {
      const res = await apiRequest("PATCH", "/api/settings", {
        type: "display",
        settings: displaySettings,
      });
      return await res.json();
    },
    onSuccess: (updatedSettings: Settings) => {
      queryClient.setQueryData(["/api/settings"], updatedSettings);

      // Apply theme change immediately
      const theme = updatedSettings.display.theme;
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (theme === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }

      toast({
        title: "Display settings updated",
        description: "Your display preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update display settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSecuritySettingsMutation = useMutation({
    mutationFn: async (securitySettings: SecuritySettings) => {
      const res = await apiRequest("PATCH", "/api/settings", {
        type: "security",
        settings: securitySettings,
      });
      return await res.json();
    },
    onSuccess: (updatedSettings: Settings) => {
      queryClient.setQueryData(["/api/settings"], updatedSettings);
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update security settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePrivacySettingsMutation = useMutation({
    mutationFn: async (privacySettings: PrivacySettings) => {
      const res = await apiRequest("PATCH", "/api/settings", {
        type: "privacy",
        settings: privacySettings,
      });
      return await res.json();
    },
    onSuccess: (updatedSettings: Settings) => {
      queryClient.setQueryData(["/api/settings"], updatedSettings);
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update privacy settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUnitSettingsMutation = useMutation({
    mutationFn: async (unitSettings: UnitSettings) => {
      const res = await apiRequest("PATCH", "/api/settings", {
        type: "units",
        settings: unitSettings,
      });
      return await res.json();
    },
    onSuccess: (updatedSettings: Settings) => {
      queryClient.setQueryData(["/api/settings"], updatedSettings);
      toast({
        title: "Unit settings updated",
        description: "Your unit preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update unit settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Apply theme from settings when hook is first loaded
  if (settings?.display.theme) {
    const applyTheme = () => {
      const theme = settings.display.theme;
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (theme === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    applyTheme();

    // Listen for system preference changes if using system theme
    if (settings.display.theme === "system") {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", applyTheme);
    }
  }

  return {
    settings,
    isLoading,
    error,
    updateNotificationSettings: updateNotificationSettingsMutation.mutate,
    updateDisplaySettings: updateDisplaySettingsMutation.mutate,
    updateSecuritySettings: updateSecuritySettingsMutation.mutate,
    updatePrivacySettings: updatePrivacySettingsMutation.mutate,
    updateUnitSettings: updateUnitSettingsMutation.mutate,
    isUpdatingNotifications: updateNotificationSettingsMutation.isPending,
    isUpdatingDisplay: updateDisplaySettingsMutation.isPending,
    isUpdatingSecurity: updateSecuritySettingsMutation.isPending,
    isUpdatingPrivacy: updatePrivacySettingsMutation.isPending,
    isUpdatingUnits: updateUnitSettingsMutation.isPending,
  };
}
