import { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "../firebase";
import { registerFcmToken } from "../api/pushNotifications";

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [message, setMessage] = useState<any>(null);

  useEffect(() => {
    async function setupPush() {
      const t = await requestNotificationPermission();
      setToken(t);
      setPermission(Notification.permission);
      if (t) {
        await registerFcmToken(t);
      }
    }
    setupPush();
    onForegroundMessage((payload) => {
      setMessage(payload);
      // Optionally show a toast or custom UI here
    });
  }, []);

  return { token, permission, message };
}
