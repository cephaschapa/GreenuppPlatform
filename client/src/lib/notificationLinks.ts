/**
 * Resolve notification type / actionUrl / deepLink to an in-app path.
 * Used so clicking a notification (e.g. weather alert) opens the right screen (e.g. Weather page).
 */

export interface NotificationForLink {
  type: string;
  actionUrl?: string | null;
  data?: Record<string, unknown> | null;
}

const DEEP_LINK_TO_PATH: Record<string, string> = {
  weather: "weather",
  tasks: "tasks",
  decisions: "dashboard",
  marketplace: "marketplace",
  home: "dashboard",
  alerts: "alerts",
  chat: "chat",
  diagnose: "diagnose",
  security: "security",
  profile: "profile",
  settings: "settings",
  notifications: "notifications",
  "notification-settings": "notification-settings",
};

/**
 * Returns the in-app path to navigate to when the user clicks this notification,
 * or null if no navigation should happen (external link or no target).
 * Caller should use path for client-side navigation; if null but notification.actionUrl
 * is set, caller may use that for window.location (external).
 */
export function getNotificationTargetPath(
  notification: NotificationForLink,
  userId: string
): string | null {
  const base = `/farmer/${userId}`;

  // 1. Explicit relative actionUrl (e.g. /farmer/123/weather or /dashboard)
  const actionUrl = notification.actionUrl?.trim();
  if (actionUrl?.startsWith("/")) {
    // If it contains a placeholder, substitute current user
    const withUser = actionUrl.replace(/\{USER_ID\}/gi, userId);
    return withUser;
  }

  // 2. deepLink in data (e.g. greenupp://weather from server jobs)
  const deepLink = notification.data?.deepLink as string | undefined;
  if (deepLink) {
    const scheme = "greenupp://";
    if (deepLink.startsWith(scheme)) {
      const target = deepLink.slice(scheme.length).replace(/\?.*$/, "").trim();
      const segment = DEEP_LINK_TO_PATH[target] ?? target;
      return `${base}/${segment}`;
    }
  }

  // 3. Map by notification type so existing notifications without actionUrl still open the right screen
  const typeToSegment: Record<string, string> = {
    weather_alert: "weather",
    weather_risk: "weather",
    weather_opportunity: "weather",
    task_due: "tasks",
    task_reminder: "tasks",
    task_overdue: "tasks",
    market_price_alert: "marketplace",
    marketplace_recommendation: "marketplace",
    product_recommendation: "marketplace",
    weekly_outlook: "dashboard",
    farming_insights: "dashboard",
    message: "chat",
    diagnosis_ready: "diagnose",
    plant_diagnosis_ready: "diagnose",
    plant_diagnosis_risk: "diagnose",
    security_alert: "security",
    crop_update: "fields",
    system_notification: "dashboard",
    critical_alert: "alerts",
  };

  const segment = typeToSegment[notification.type];
  if (segment) return `${base}/${segment}`;

  return null;
}

/**
 * Returns true if the notification has an external action URL (full URL)
 * that should be opened via window.location or new tab.
 */
export function hasExternalActionUrl(notification: NotificationForLink): boolean {
  const url = notification.actionUrl?.trim();
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
}
