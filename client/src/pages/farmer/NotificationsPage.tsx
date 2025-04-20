import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, Clock, AlertTriangle, BadgeInfo, MessageSquare, Sprout } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAsArchived } = useNotifications();
  const [tab, setTab] = useState("all");

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
    return false;
  });

  const handleMarkAllAsRead = async () => {
    for (const notification of filteredNotifications) {
      if (notification.status === "unread") {
        await markAsRead(notification.id);
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <PageHeader heading="Notifications" text="View and manage your notifications" />
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" asChild className="mr-2">
            <Link href="/farmer/notification-settings">Notification Settings</Link>
          </Button>
          <Button onClick={handleMarkAllAsRead} disabled={!filteredNotifications.some(n => n.status === "unread")}>
            Mark All as Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-6" value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Switch id="auto-mark-read" />
            <Label htmlFor="auto-mark-read">Auto-mark as read</Label>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <NotificationList 
            notifications={filteredNotifications} 
            isLoading={isLoading} 
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
          />
        </TabsContent>
        <TabsContent value="unread" className="mt-0">
          <NotificationList 
            notifications={filteredNotifications} 
            isLoading={isLoading} 
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
          />
        </TabsContent>
        <TabsContent value="read" className="mt-0">
          <NotificationList 
            notifications={filteredNotifications} 
            isLoading={isLoading} 
            markAsRead={markAsRead}
            markAsArchived={markAsArchived}
            getIconForType={getIconForType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationListProps {
  notifications: any[];
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAsArchived: (id: number) => Promise<void>;
  getIconForType: (type: string) => JSX.Element;
}

function NotificationList({ 
  notifications, 
  isLoading, 
  markAsRead, 
  markAsArchived,
  getIconForType 
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
        <p className="text-muted-foreground">You don't have any notifications at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.status === "unread" ? "border-primary border-l-4" : ""}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="mt-1">
                {getIconForType(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{notification.title}</h3>
                  <div className="flex items-center space-x-2">
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
                <p className="text-muted-foreground mt-1">{notification.message}</p>
                {notification.actionUrl && (
                  <Button variant="link" className="p-0 h-auto mt-2" asChild>
                    <a href={notification.actionUrl}>View Details</a>
                  </Button>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}