/**
 * A simple service to handle WebSocket notifications
 * This avoids circular dependencies between route setup and notification services
 */

// Define the notifier function type
type WebSocketNotifier = (userId: number, notification: any) => void;

// Default no-op implementation
let notifierFunction: WebSocketNotifier = () => {};

/**
 * Set the WebSocket notifier function
 * This is called from routes.ts once the WebSocket server is set up
 */
export function setWebSocketNotifier(fn: WebSocketNotifier): void {
  notifierFunction = fn;
}

/**
 * Send a notification via WebSocket
 * This is called from the notification service
 */
export function sendWebSocketNotification(userId: number, notification: any): void {
  notifierFunction(userId, notification);
}