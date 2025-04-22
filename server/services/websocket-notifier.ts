/**
 * A simple module that provides a way to send WebSocket notifications
 * without creating a circular dependency between server and notification service
 */

// The function type for sending WebSocket notifications
type WebSocketNotifier = (userId: number, notification: any) => void;

// The default no-op implementation
let notifier: WebSocketNotifier = () => {};

/**
 * Set the actual WebSocket notification implementation
 * This is called from routes.ts after the WebSocket server is initialized
 */
export function setWebSocketNotifier(fn: WebSocketNotifier) {
  notifier = fn;
}

/**
 * Send a notification to a user via WebSocket
 * This is called from the notification service
 */
export function sendWebSocketNotification(userId: number, notification: any) {
  notifier(userId, notification);
}