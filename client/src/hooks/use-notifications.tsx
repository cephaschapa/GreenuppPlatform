import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth"; 
import { useToast } from "./use-toast";
import { useWebSocket } from "./use-websocket";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  actionUrl?: string;
  data?: Record<string, any>;
};

type NotificationSettings = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  weatherAlerts: boolean;
  taskReminders: boolean;
  marketPriceAlerts: boolean;
  systemNotifications: boolean;
  messageNotifications: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
  emailDigestDay?: number;
  emailDigestTime?: number;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  settings: NotificationSettings | null;
  settingsLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAsArchived: (id: number) => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refetchNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { connected } = useWebSocket();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;
  
  // Listen for WebSocket connection changes
  useEffect(() => {
    if (connected && isAuthenticated) {
      // Once connected, we can rely on real-time notifications
      // We'll still do initial fetching to get existing notifications
      console.log('WebSocket connected - real-time notifications active');
    }
  }, [connected, isAuthenticated]);

  // Get all notifications
  const { 
    data: notifications = [], 
    isLoading, 
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await apiRequest('GET', '/api/notifications');
      return await res.json();
    },
    enabled: isAuthenticated,
  });

  // Get unread count
  const { 
    data: unreadCountData = { count: 0 }
  } = useQuery({
    queryKey: ['/api/notifications/unread/count'],
    queryFn: async () => {
      if (!isAuthenticated) return { count: 0 };
      const res = await apiRequest('GET', '/api/notifications/unread/count');
      return await res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refetch every minute
  });

  // Get notification settings
  const { 
    data: settings = null,
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: ['/api/notifications/settings'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const res = await apiRequest('GET', '/api/notifications/settings');
      return await res.json();
    },
    enabled: isAuthenticated,
  });

  // Mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/notifications/${id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark notification as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark a notification as archived
  const markAsArchivedMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PATCH', `/api/notifications/${id}/archive`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to archive notification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update notification settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      const res = await apiRequest('PATCH', '/api/notifications/settings', newSettings);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
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

  const markAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync(id);
  };

  const markAsArchived = async (id: number) => {
    await markAsArchivedMutation.mutateAsync(id);
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    await updateSettingsMutation.mutateAsync(newSettings);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: unreadCountData.count,
        isLoading,
        settings,
        settingsLoading,
        markAsRead,
        markAsArchived,
        updateSettings,
        refetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export type { Notification, NotificationSettings };