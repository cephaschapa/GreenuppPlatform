import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsArchived,
    refetchNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  // Group notifications by date
  const groupedNotifications = notifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    },
    {} as Record<string, typeof notifications>,
  );

  const getIconForType = (type: string) => {
    switch (type) {
      case "weather_alert":
        return "🌦️";
      case "task_reminder":
        return "📋";
      case "market_price_alert":
        return "📊";
      case "system_notification":
        return "🔔";
      case "message":
        return "✉️";
      case "crop_update":
        return "🌱";
      default:
        return "📣";
    }
  };

  const handleNotificationClick = async (id: number, actionUrl?: string) => {
    await markAsRead(id);
    setOpen(false);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await markAsArchived(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-full w-16 p-0"
          onClick={() => refetchNotifications()}
        >
          <Bell className="h-5 w-5"/>
          {unreadCount > 0 && (
            <span className="absolute -top-0 -right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 font-medium">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const unreadIds = notifications
                    .filter(n => n.status === 'unread')
                    .map(n => n.id);
                  
                  // Mark all unread notifications as read
                  Promise.all(unreadIds.map(id => markAsRead(id)))
                    .then(() => refetchNotifications());
                }}
              >
                Mark all as read
              </Button>
            )}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {Object.keys(groupedNotifications).length > 0 ? (
            Object.entries(groupedNotifications).map(
              ([date, dateNotifications]) => (
                <div key={date} className="mb-2">
                  <div className="sticky top-0 z-10 bg-background p-2 text-xs font-medium text-muted-foreground">
                    {date}
                  </div>
                  {dateNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex cursor-pointer flex-col p-3 hover:bg-accent",
                        notification.status === "unread" &&
                          "border-l-4 border-primary bg-accent/30",
                      )}
                      onClick={() =>
                        handleNotificationClick(
                          notification.id,
                          notification.actionUrl,
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">
                            {getIconForType(notification.type)}
                          </span>
                          <div>
                            <h4 className="font-medium">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            {notification.data?.actions && (
                              <div className="mt-2 flex gap-2">
                                {notification.data.actions.map((action: { label: string; url: string; variant?: string }) => (
                                  <Button
                                    key={action.label}
                                    size="sm"
                                    variant={action.variant as any || "outline"}
                                    className="h-7 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                      window.location.href = action.url;
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleArchive(e, notification.id)}
                        >
                          &times;
                        </button>
                      </div>
                      <div className="mt-1 text-right text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            )
          ) : (
            <div className="flex h-40 flex-col items-center justify-center p-4 text-center text-muted-foreground">
              {isLoading ? (
                <Loader2 className="mb-2 h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Bell className="mb-2 h-8 w-8" />
                  <p>No notifications</p>
                </>
              )}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <a href="/notifications/settings">Manage Notifications</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
