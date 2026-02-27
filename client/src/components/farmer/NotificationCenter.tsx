import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Info,
  ChevronRight,
  Trash2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  getNotificationTargetPath,
  hasExternalActionUrl,
} from "@/lib/notificationLinks";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notifications count
  const {
    data: unreadCount,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useQuery({
    queryKey: ["/api/notifications/unread/count"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/api/notifications/unread/count"
      );
      const data = await response.json();
      return data.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["/api/notifications", activeTab],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/notifications?status=${activeTab}&limit=${activeTab === "all" ? 100 : 50}`
      );
      return await response.json();
    },
    enabled: open, // Only fetch when popover is open
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/notifications/${notificationId}/read`
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread/count"],
      });
    },
  });

  // Mark notification as archived
  const markAsArchivedMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/notifications/${notificationId}/archive`
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread/count"],
      });
    },
  });

  // Refetch when popover opens
  useEffect(() => {
    if (open) {
      refetchNotifications();
      refetchCount();
    }
  }, [open, refetchNotifications, refetchCount]);

  const getViewDetailsHref = (notification: Notification): string | null => {
    const userId = user?.id?.toString();
    if (!userId) return notification.actionUrl ?? null;
    const inApp = getNotificationTargetPath(notification, userId);
    if (inApp) return inApp;
    return hasExternalActionUrl(notification) ? notification.actionUrl! : null;
  };

  // Mark as read and navigate to the linked screen (weather, tasks, etc.)
  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === "unread") {
      markAsReadMutation.mutate(notification.id);
    }
    setOpen(false);
    const userId = user?.id?.toString();
    if (userId) {
      const inAppPath = getNotificationTargetPath(notification, userId);
      if (inAppPath) {
        setLocation(inAppPath);
        return;
      }
    }
    if (hasExternalActionUrl(notification)) {
      window.location.href = notification.actionUrl!;
    }
  };

  // Helper function to get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "weather_alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "task_reminder":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "market_price_alert":
        return <Bell className="h-4 w-4 text-green-500" />;
      case "security_alert":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "system_notification":
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format notification date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!isCountLoading && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-1">
            {notifications.some((n: Notification) => n.status === "unread") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={async () => {
                  const unreadIds = notifications
                    .filter((n: Notification) => n.status === "unread")
                    .map((n: Notification) => n.id);
                  try {
                    await Promise.all(unreadIds.map((id) => markAsReadMutation.mutateAsync(id)));
                    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
                    toast({ title: "Marked all as read", description: `${unreadIds.length} notification(s).` });
                  } catch {
                    toast({ title: "Could not mark all as read", variant: "destructive" });
                  }
                }}
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="unread" className="relative">
              Unread
              {!isCountLoading && unreadCount > 0 && (
                <Badge className="ml-1 bg-primary text-[10px] h-4 absolute -top-1 -right-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={notifications.filter(
                (n: Notification) => n.status === "unread"
              )}
              isLoading={isNotificationsLoading}
              isError={isNotificationsError}
              onNotificationClick={handleNotificationClick}
              onArchive={markAsArchivedMutation.mutate}
              formatDate={formatDate}
              getNotificationIcon={getNotificationIcon}
              emptyMessage="No unread notifications"
              refetch={refetchNotifications}
              getViewDetailsHref={getViewDetailsHref}
            />
          </TabsContent>

          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={notifications}
              isLoading={isNotificationsLoading}
              isError={isNotificationsError}
              onNotificationClick={handleNotificationClick}
              onArchive={markAsArchivedMutation.mutate}
              formatDate={formatDate}
              getNotificationIcon={getNotificationIcon}
              emptyMessage="No notifications"
              refetch={refetchNotifications}
              getViewDetailsHref={getViewDetailsHref}
            />
          </TabsContent>
        </Tabs>

        <div className="border-t p-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-between"
          >
            <Link href={user?.id ? `/farmer/${user.id}/notifications` : "/notifications"}>
              View All Notifications
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  onNotificationClick: (notification: Notification) => void;
  onArchive: (id: number) => void;
  formatDate: (date: string) => string;
  getNotificationIcon: (type: string) => JSX.Element;
  emptyMessage: string;
  refetch: () => void;
  /** Resolved in-app path or external URL for "View Details"; null if no target */
  getViewDetailsHref?: (notification: Notification) => string | null;
}

function NotificationList({
  notifications,
  isLoading,
  isError,
  onNotificationClick,
  onArchive,
  formatDate,
  getNotificationIcon,
  emptyMessage,
  refetch,
  getViewDetailsHref,
}: NotificationListProps) {
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2 p-4">
        {[1, 2, 3].map((_, i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <h4 className="font-medium">Failed to load notifications</h4>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error fetching your notifications.
        </p>
        <Button onClick={refetch} size="sm" variant="outline" className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="py-8 text-center">
        <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="">
      <div className="flex flex-col w-full">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex p-3 border-b last:border-b-0 transition-colors hover:bg-muted/40",
              notification.status === "unread" ? "bg-muted/20" : ""
            )}
          >
            <div className="mr-3 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div
              className="flex-1 cursor-pointer"
              onClick={() => onNotificationClick(notification)}
            >
              <div className="flex justify-between">
                <h5
                  className={cn(
                    "text-sm",
                    notification.status === "unread"
                      ? "font-medium"
                      : "font-normal"
                  )}
                >
                  {notification.title}
                </h5>
                <span className="text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              {getViewDetailsHref?.(notification) && (
                <Link href={getViewDetailsHref(notification)!}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 mt-1 text-xs text-primary hover:text-primary"
                  >
                    View Details
                  </Button>
                </Link>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mt-1 hover:bg-transparent hover:text-red-500 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(notification.id);
                toast({
                  description: "Notification archived",
                });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
