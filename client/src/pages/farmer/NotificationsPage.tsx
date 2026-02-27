import { useState } from "react";
import { useLocation } from "wouter";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  BadgeInfo,
  MessageSquare,
  Sprout,
  CheckCheck,
  Trash2,
  Inbox,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  getNotificationTargetPath,
  hasExternalActionUrl,
} from "@/lib/notificationLinks";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { notifications, isLoading, markAsRead, markAsArchived, refetchNotifications } =
    useNotifications();
  const [tab, setTab] = useState("all");
  const unreadList = notifications.filter((n) => n.status === "unread");
  const readList = notifications.filter((n) => n.status === "read");
  const archivedList = notifications.filter((n) => n.status === "archived");

  const handleNotificationClick = async (notification: {
    id: number;
    type: string;
    actionUrl?: string | null;
    data?: Record<string, unknown> | null;
  }) => {
    await markAsRead(notification.id);
    const userId = user?.id?.toString();
    if (userId) {
      const path = getNotificationTargetPath(notification, userId);
      if (path) {
        setLocation(path);
        return;
      }
    }
    if (hasExternalActionUrl(notification)) {
      window.location.href = notification.actionUrl!;
    }
  };

  const getViewDetailsHref = (notification: {
    type: string;
    actionUrl?: string | null;
    data?: Record<string, unknown> | null;
  }) => {
    const userId = user?.id?.toString();
    if (!userId) return notification.actionUrl ?? null;
    const inApp = getNotificationTargetPath(notification, userId);
    if (inApp) return inApp;
    return hasExternalActionUrl(notification) ? notification.actionUrl! : null;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "weather_alert":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "task_reminder":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "market_price_alert":
        return <BadgeInfo className="h-5 w-5 text-purple-500" />;
      case "system_notification":
        return <Bell className="h-5 w-5 text-gray-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "crop_update":
        return <Sprout className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (tab === "all") return true;
    if (tab === "unread") return notification.status === "unread";
    if (tab === "read") return notification.status === "read";
    if (tab === "archived") return notification.status === "archived";
    return false;
  });

  const handleMarkAllAsRead = async () => {
    const toMark = notifications.filter((n) => n.status === "unread");
    if (toMark.length === 0) {
      toast({ title: "No unread notifications", description: "All notifications are already read." });
      return;
    }
    try {
      for (const n of toMark) await markAsRead(n.id);
      refetchNotifications();
      toast({ title: "Marked all as read", description: `${toMark.length} notification(s) marked as read.` });
    } catch {
      toast({ title: "Something went wrong", description: "Could not mark all as read.", variant: "destructive" });
    }
  };

  const handleArchiveAllRead = async () => {
    const toArchive = notifications.filter((n) => n.status === "read");
    if (toArchive.length === 0) {
      toast({ title: "No read notifications", description: "No read notifications to archive." });
      return;
    }
    try {
      for (const n of toArchive) await markAsArchived(n.id);
      refetchNotifications();
      toast({ title: "Archived read notifications", description: `${toArchive.length} notification(s) archived.` });
    } catch {
      toast({ title: "Something went wrong", description: "Could not archive.", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    const toArchive = notifications.filter((n) => n.status === "unread" || n.status === "read");
    if (toArchive.length === 0) {
      toast({ title: "Nothing to clear", description: "All notifications are already archived." });
      return;
    }
    try {
      for (const n of toArchive) await markAsArchived(n.id);
      refetchNotifications();
      toast({ title: "Cleared all", description: `${toArchive.length} notification(s) archived.` });
    } catch {
      toast({ title: "Something went wrong", description: "Could not clear.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout
      title="Notifications"
      description="View and manage all your notifications"
    >
      <div className="container py-6 w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleMarkAllAsRead}
              disabled={unreadList.length === 0}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear / Archive
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleArchiveAllRead} disabled={readList.length === 0}>
                  Archive all read ({readList.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearAll} disabled={unreadList.length === 0 && readList.length === 0}>
                  Archive all (clear list)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" asChild>
              <Link href={user?.id ? `/farmer/${user.id}/notification-settings` : "/farmer/notification-settings"}>
                Notification Settings
              </Link>
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          className="mt-6"
          value={tab}
          onValueChange={setTab}
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="all" className="gap-1">
                <Inbox className="h-4 w-4" />
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadList.length})</TabsTrigger>
              <TabsTrigger value="read">Read ({readList.length})</TabsTrigger>
              <TabsTrigger value="archived">Archived ({archivedList.length})</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="all" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
            onNotificationClick={handleNotificationClick}
            getViewDetailsHref={getViewDetailsHref}
          />
        </TabsContent>
        <TabsContent value="unread" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
            onNotificationClick={handleNotificationClick}
            getViewDetailsHref={getViewDetailsHref}
          />
        </TabsContent>
        <TabsContent value="read" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
            onNotificationClick={handleNotificationClick}
            getViewDetailsHref={getViewDetailsHref}
          />
        </TabsContent>
        <TabsContent value="archived" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
            onNotificationClick={handleNotificationClick}
            getViewDetailsHref={getViewDetailsHref}
          />
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface NotificationListProps {
  notifications: any[];
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAsArchived: (id: number) => Promise<void>;
  getIconForType: (type: string) => JSX.Element;
  onNotificationClick?: (notification: any) => void;
  getViewDetailsHref?: (notification: any) => string | null;
}

function NotificationList({
  notifications,
  isLoading,
  markAsRead,
  markAsArchived,
  getIconForType,
  onNotificationClick,
  getViewDetailsHref,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No notifications</h3>
        <p className="text-muted-foreground">
          You don't have any notifications at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const viewHref = getViewDetailsHref?.(notification) ?? null;
        return (
          <Card
            key={notification.id}
            className={
              notification.status === "unread" ? "border border-primary" : ""
            }
          >
            <CardContent
              className="p-4 cursor-pointer"
              onClick={() => onNotificationClick?.(notification)}
            >
              <div className="flex gap-4">
                <div className="mt-1">{getIconForType(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{notification.title}</h3>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {notification.status === "unread" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsArchived(notification.id)}
                        title="Archive notification"
                      >
                        <span className="text-lg">&times;</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  {viewHref && (
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      {viewHref.startsWith("http") ? (
                        <a href={viewHref} target="_blank" rel="noopener noreferrer">
                          View Details
                        </a>
                      ) : (
                        <Link href={viewHref}>View Details</Link>
                      )}
                    </Button>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
