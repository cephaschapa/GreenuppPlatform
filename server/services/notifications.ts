import { db } from "../db";
import { notifications, notificationSettings, users, type Notification, type InsertNotification } from "@shared/schema";
import { eq, and, desc, lt, gte, count, or, isNull } from "drizzle-orm";
import { sendEmail } from "./email";

export interface NotificationOptions {
  userId: number;
  type: string; // Using string type for simplicity
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
  sendEmail?: boolean;
}

/**
 * Create a new notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
  actionUrl,
  expiresAt,
  sendEmail: shouldSendEmail = false
}: NotificationOptions): Promise<Notification> {
  // First, check if user has enabled this type of notification
  const userSettings = await getUserNotificationSettings(userId);
  
  if (!userSettings) {
    // Create default settings if none exist
    await createDefaultNotificationSettings(userId);
  }
  
  // Check if this type of notification is enabled
  const isEnabled = isNotificationTypeEnabled(userSettings, type);
  
  if (!isEnabled) {
    throw new Error(`User has disabled ${type} notifications`);
  }
  
  // Create the notification
  const [notification] = await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    data,
    actionUrl,
    expiresAt,
    sentViaEmail: false
  }).returning();
  
  // Send email if requested and email notifications are enabled
  if (shouldSendEmail && userSettings?.emailEnabled) {
    try {
      // Get user email
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (user && user.email) {
        // Determine if we should send now based on frequency settings
        const shouldSendNow = shouldSendEmailNow(userSettings, type);
        
        if (shouldSendNow) {
          const emailSent = await sendNotificationEmail(user.email, {
            title,
            message,
            type,
            actionUrl
          });
          
          if (emailSent) {
            // Update notification to mark as sent
            await db.update(notifications)
              .set({ 
                sentViaEmail: true,
                emailSentAt: new Date()
              })
              .where(eq(notifications.id, notification.id));
              
            // Update the local notification object to reflect the change
            notification.sentViaEmail = true;
            notification.emailSentAt = new Date();
          }
        }
      }
    } catch (error) {
      console.error("Failed to send notification email:", error);
      // We don't throw here because the notification was created successfully
      // Email sending is a nice-to-have but not required
    }
  }
  
  return notification;
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: number, options?: {
  limit?: number;
  offset?: number;
  status?: 'unread' | 'read' | 'archived' | 'all';
  type?: string;
}) {
  const { limit = 20, offset = 0, status = 'all', type } = options || {};
  
  // Start with the base condition
  let conditions = eq(notifications.userId, userId);
  
  // Add status filter if not 'all'
  if (status !== 'all') {
    conditions = and(conditions, eq(notifications.status, status));
  }
  
  // Add type filter if provided
  if (type) {
    conditions = and(conditions, eq(notifications.type, type));
  }
  
  // Don't include expired notifications
  conditions = and(
    conditions,
    or(
      isNull(notifications.expiresAt),
      gte(notifications.expiresAt, new Date())
    )
  );
  
  // Apply all conditions at once
  const query = db.select()
    .from(notifications)
    .where(conditions)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
  
  return await query;
}

/**
 * Get notification settings for a user
 */
export async function getUserNotificationSettings(userId: number) {
  const settings = await db.select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId));
  
  return settings[0];
}

/**
 * Create default notification settings for a user
 */
export async function createDefaultNotificationSettings(userId: number) {
  const [settings] = await db.insert(notificationSettings)
    .values({
      userId,
      emailEnabled: true,
      pushEnabled: true,
      weatherAlerts: true,
      taskReminders: true,
      marketPriceAlerts: false,
      systemNotifications: true,
      messageNotifications: true,
      emailFrequency: 'instant'
    })
    .returning();
  
  return settings;
}

/**
 * Update notification settings for a user
 */
export async function updateNotificationSettings(userId: number, settings: Partial<typeof notificationSettings.$inferInsert>) {
  const [updatedSettings] = await db.update(notificationSettings)
    .set({
      ...settings,
      updatedAt: new Date()
    })
    .where(eq(notificationSettings.userId, userId))
    .returning();
  
  return updatedSettings;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number, userId: number) {
  const [notification] = await db.update(notifications)
    .set({
      status: 'read',
      updatedAt: new Date()
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning();
  
  return notification;
}

/**
 * Mark a notification as archived
 */
export async function markNotificationAsArchived(notificationId: number, userId: number) {
  const [notification] = await db.update(notifications)
    .set({
      status: 'archived',
      updatedAt: new Date()
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning();
  
  return notification;
}

/**
 * Delete old notifications (maintenance function)
 */
export async function cleanupOldNotifications(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await db.delete(notifications)
    .where(lt(notifications.createdAt, cutoffDate))
    .returning({ deletedId: notifications.id });
  
  return result.length;
}

/**
 * Count unread notifications for a user
 */
export async function countUnreadNotifications(userId: number) {
  const result = await db.select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.status, 'unread'),
        or(
          isNull(notifications.expiresAt),
          gte(notifications.expiresAt, new Date())
        )
      )
    );
  
  return result[0]?.count || 0;
}

/**
 * Helper function to determine if a notification type is enabled for a user
 */
function isNotificationTypeEnabled(
  settings: any, // Using any for now for simplicity
  type: string
) {
  if (!settings) return true; // Default to enabled if no settings
  
  switch (type) {
    case 'weather_alert':
      return settings.weatherAlerts;
    case 'task_reminder':
      return settings.taskReminders;
    case 'market_price_alert':
      return settings.marketPriceAlerts;
    case 'message':
      return settings.messageNotifications;
    case 'system_notification':
      return settings.systemNotifications;
    default:
      return true; // Default to enabled for unknown types
  }
}

/**
 * Helper function to determine if we should send an email now based on user preferences
 */
function shouldSendEmailNow(
  settings: any, // Using any for now for simplicity
  type: string
) {
  if (!settings || !settings.emailEnabled) return false;
  
  // If email frequency is 'instant', always send
  if (settings.emailFrequency === 'instant') {
    return true;
  }
  
  // For daily/weekly digests, we'd normally queue this up instead of sending immediately
  // For now, let's send urgent notifications immediately regardless of digest settings
  if (['weather_alert', 'system_notification'].includes(type)) {
    return true;
  }
  
  // For other notification types, respect the digest setting
  // In a real app, you'd queue these for later sending
  return false;
}

/**
 * Helper to send an email for a notification
 */
async function sendNotificationEmail(
  email: string,
  notification: {
    title: string;
    message: string;
    type: string;
    actionUrl?: string;
  }
): Promise<boolean> {
  try {
    // Determine a good friendly sender name based on notification type
    let fromName = 'Greenupp';
    if (notification.type === 'weather_alert') {
      fromName = 'Greenupp Weather Alerts';
    } else if (notification.type === 'task_reminder') {
      fromName = 'Greenupp Task Reminders';
    } else if (notification.type === 'market_price_alert') {
      fromName = 'Greenupp Market Alerts';
    }
    
    return await sendEmail({
      to: email,
      from: `${fromName} <no-reply@greenupp.app>`,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e293b; padding: 20px; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${notification.title}</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
            <p>${notification.message}</p>
            ${notification.actionUrl ? `
              <div style="margin-top: 20px;">
                <a href="${notification.actionUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Details</a>
              </div>
            ` : ''}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p>This message was sent from Greenupp, the agricultural intelligence platform.</p>
              <p>You received this because you signed up for ${notification.type.replace('_', ' ')} notifications.</p>
              <p>To update your notification preferences, log in to your Greenupp account and visit Settings.</p>
            </div>
          </div>
        </div>
      `,
      text: `${notification.title}\n\n${notification.message}${notification.actionUrl ? `\n\nView more details: ${notification.actionUrl}` : ''}\n\nYou received this because you signed up for ${notification.type.replace('_', ' ')} notifications. To update your preferences, log in to your Greenupp account and visit Settings.`
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

