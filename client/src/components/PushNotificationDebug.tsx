import React from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";

export function PushNotificationDebug() {
  const { token, permission, message } = usePushNotifications();
  return (
    <div
      style={{
        background: "#f5f5f5",
        padding: 16,
        borderRadius: 8,
        margin: 16,
        zIndex: 1000,
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "300px",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <h3>Push Notification Debug</h3>
      <div>
        Permission: <b>{permission}</b>
      </div>
      <div style={{ wordBreak: "break-all" }}>
        <div>FCM Token:</div>
        <code style={{ fontSize: 12 }}>{token || "(none)"}</code>
      </div>
      <div>
        <div>Last Message:</div>
        <pre style={{ fontSize: 12 }}>
          {message ? JSON.stringify(message, null, 2) : "(none)"}
        </pre>
      </div>
    </div>
  );
}
