# 🔄 Notification System Integration Guide

## Overview

The Greenupp platform now has a **unified notification system** that combines local notifications with Firebase push notifications for maximum reach and user engagement.

## 🏗️ **Architecture**

### **Multi-Channel Notification Delivery**

```
Event Trigger → createNotification() → Multi-Channel Delivery
                                      ├── Database Storage
                                      ├── WebSocket (Real-time)
                                      ├── Email (Optional)
                                      └── Push Notification (Firebase)
```

## 📱 **Integration Points**

### **1. Unified Notification Creation**

All notifications now go through a single `createNotification()` function that handles:

```typescript
// Enhanced notification creation
const notification = await createNotification({
  userId: 123,
  type: "task_reminder",
  title: "Water Your Crops",
  message: "Time to water your corn field",
  data: { fieldId: 456, cropId: 789 },
  actionUrl: "/dashboard/fields/456",
  sendEmail: true, // Optional email
});
```

**What happens automatically:**

- ✅ **Database Storage** - Notification saved to database
- ✅ **WebSocket** - Real-time notification to active users
- ✅ **Push Notification** - Firebase FCM to user's devices
- ✅ **Email** - Optional email notification (if enabled)

### **2. User Preference Management**

Users can control notifications through unified settings:

```typescript
// Notification settings include both local and push preferences
{
  emailEnabled: true,
  pushEnabled: true,        // Controls Firebase push notifications
  weatherAlerts: true,
  taskReminders: true,
  marketPriceAlerts: false,
  systemNotifications: true,
  messageNotifications: true,
  // Social notifications
  socialLikes: true,
  socialComments: true,
  socialFollows: true,
  socialMentions: true,
  socialSaves: true
}
```

## 🔧 **How It Works**

### **Step 1: Event Trigger**

```typescript
// Example: Task reminder system
if (task.isDueSoon()) {
  await createNotification({
    userId: task.userId,
    type: "task_reminder",
    title: "Task Due Soon",
    message: `Task "${task.title}" is due in ${task.timeUntilDue}`,
    data: { taskId: task.id, dueDate: task.dueDate },
    actionUrl: `/dashboard/tasks/${task.id}`,
    sendEmail: true,
  });
}
```

### **Step 2: Multi-Channel Delivery**

The system automatically:

1. **Checks User Preferences** - Respects user's notification settings
2. **Stores in Database** - For notification history and management
3. **Sends WebSocket** - Real-time notification to active web users
4. **Sends Push Notification** - Firebase FCM to user's devices
5. **Sends Email** - Optional email notification

### **Step 3: User Receives Notifications**

- **Web Users**: See real-time notifications via WebSocket
- **Mobile/Desktop**: Receive push notifications via Firebase
- **Email**: Get email notifications (if enabled)
- **Dashboard**: View notification history in the app

## 📊 **Notification Types & Channels**

| Notification Type     | Database | WebSocket | Push | Email |
| --------------------- | -------- | --------- | ---- | ----- |
| `weather_alert`       | ✅       | ✅        | ✅   | ✅    |
| `task_reminder`       | ✅       | ✅        | ✅   | ✅    |
| `market_price_alert`  | ✅       | ✅        | ✅   | ✅    |
| `message`             | ✅       | ✅        | ✅   | ✅    |
| `system_notification` | ✅       | ✅        | ✅   | ✅    |
| `crop_update`         | ✅       | ✅        | ✅   | ✅    |
| `social_like`         | ✅       | ✅        | ✅   | ✅    |
| `social_comment`      | ✅       | ✅        | ✅   | ✅    |
| `social_follow`       | ✅       | ✅        | ✅   | ✅    |
| `social_mention`      | ✅       | ✅        | ✅   | ✅    |
| `social_save`         | ✅       | ✅        | ✅   | ✅    |

## 🎯 **Use Cases**

### **1. Task Management**

```typescript
// When a task is created
await createNotification({
  userId: task.userId,
  type: "task_reminder",
  title: "New Task Assigned",
  message: `You have a new task: ${task.title}`,
  data: { taskId: task.id, priority: task.priority },
  actionUrl: `/dashboard/tasks/${task.id}`,
  sendEmail: task.priority === "high",
});
```

### **2. Weather Alerts**

```typescript
// When severe weather is detected
await createNotification({
  userId: farmerId,
  type: "weather_alert",
  title: "Weather Alert",
  message: "Heavy rain expected in your area",
  data: { severity: "high", location: farmerLocation },
  actionUrl: "/dashboard/weather",
  sendEmail: true, // Always send email for weather alerts
});
```

### **3. Social Interactions**

```typescript
// When someone likes a post
await createNotification({
  userId: post.authorId,
  type: "social_like",
  title: "New Like",
  message: `${user.username} liked your post`,
  data: { postId: post.id, likerId: user.id },
  actionUrl: `/social/posts/${post.id}`,
  sendEmail: false, // Social notifications usually don't need email
});
```

## 🔒 **Privacy & Control**

### **User Control**

- **Granular Settings** - Users can enable/disable specific notification types
- **Channel Control** - Users can disable push, email, or both
- **Frequency Control** - Email digest options (instant, daily, weekly)

### **Data Privacy**

- **Minimal Data** - Only necessary data sent in push notifications
- **Secure Storage** - FCM tokens stored securely in database
- **User Consent** - Push notifications require explicit permission

## 🚀 **Benefits**

### **For Users**

- **Multi-Platform** - Notifications work on web, mobile, and desktop
- **Real-Time** - Instant notifications via WebSocket and push
- **Flexible** - Choose preferred notification channels
- **Reliable** - Fallback mechanisms if one channel fails

### **For Developers**

- **Unified API** - Single function for all notification types
- **Automatic Fallbacks** - System handles delivery failures gracefully
- **Scalable** - Firebase handles high-volume push notifications
- **Maintainable** - Centralized notification logic

## 🧪 **Testing**

### **Test Push Notifications**

```bash
# Send test notification
curl -X POST http://localhost:5000/api/push-notifications/test \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Test Notification",
    "body": "Testing push notification integration"
  }'
```

### **Test Local Notifications**

```bash
# Create a test notification
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "type": "system_notification",
    "title": "Test Notification",
    "message": "Testing notification system",
    "sendEmail": true
  }'
```

## 📈 **Monitoring**

### **Success Metrics**

- **Delivery Rate** - Percentage of notifications delivered
- **Engagement Rate** - Users clicking on notifications
- **Channel Performance** - Which channels work best for different users

### **Error Handling**

- **Graceful Degradation** - System continues if one channel fails
- **Retry Logic** - Automatic retries for failed deliveries
- **Logging** - Comprehensive logging for debugging

## 🔮 **Future Enhancements**

### **Planned Features**

- **Smart Delivery** - AI-powered delivery timing
- **Rich Notifications** - Images and interactive elements
- **Notification Analytics** - Detailed engagement metrics
- **A/B Testing** - Test different notification strategies

### **Integration Opportunities**

- **SMS Notifications** - For critical alerts
- **Slack/Discord** - Team collaboration notifications
- **Calendar Integration** - Task reminders in calendar apps
- **Voice Notifications** - For accessibility

---

## 🎉 **Summary**

The Firebase push notification integration **enhances** the existing local notification system by:

1. **Adding Mobile Reach** - Notifications work on mobile devices
2. **Improving Reliability** - Multiple delivery channels
3. **Enhancing User Experience** - Real-time notifications everywhere
4. **Maintaining Simplicity** - Single API for all notification types

The system is designed to be **backward compatible** - existing notification code continues to work while gaining the benefits of push notifications automatically.
