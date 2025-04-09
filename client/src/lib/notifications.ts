// Notifications API for Greenupp
// This module handles push notification subscriptions and permissions

const PUBLIC_VAPID_KEY = 'BF6NJ0LeFQEr3-Rx8i45Dqwz7ZGAzGODgtgbE6wkcKP29qp_TBATkq3OqUgQupqHIFTOgXRUZXiWzWp7SbVV5oQ';

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    console.error('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }
    
    // Subscribe the user
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });
    
    console.log('Subscribed to push notifications:', subscription);
    
    // Send the subscription to the server
    await saveSubscription(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return true;
    }
    
    // Unsubscribe
    const result = await subscription.unsubscribe();
    
    if (result) {
      // Remove the subscription from the server
      await deleteSubscription(subscription);
    }
    
    return result;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Get current subscription status
export async function getSubscriptionStatus(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

// Send the subscription to the server
async function saveSubscription(subscription: PushSubscription): Promise<Response> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
      credentials: 'include' // Important for authentication cookies
    });
    
    if (!response.ok) {
      console.error('Failed to save subscription', response.status, await response.text());
      throw new Error(`Failed to save subscription: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
}

// Remove the subscription from the server
async function deleteSubscription(subscription: PushSubscription): Promise<Response> {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
      credentials: 'include' // Important for authentication cookies
    });
    
    if (!response.ok) {
      console.error('Failed to delete subscription', response.status, await response.text());
      throw new Error(`Failed to delete subscription: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

// Test notification - triggers a test push notification
export async function sendTestNotification(): Promise<boolean> {
  try {
    console.log('Sending test notification request...');
    const response = await fetch('/api/push/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Important for authentication cookies
    });
    
    if (!response.ok) {
      console.error('Failed to send test notification', response.status, await response.text());
      return false;
    }
    
    console.log('Test notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

// Utility function to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}