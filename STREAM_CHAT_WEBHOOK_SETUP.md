# Stream Chat Webhook Setup Guide

This guide explains how to configure Stream Chat webhooks to enable message notifications in your GreenUpp platform.

## 🎯 **What We've Implemented**

✅ **Webhook Endpoints**: Created endpoints to receive Stream Chat events  
✅ **Notification Integration**: Connected webhooks to your existing notification system  
✅ **Frontend Handling**: Updated chat component to handle notification clicks  
✅ **Channel Events**: Support for member added/removed notifications

## 🔧 **Webhook Endpoints**

Your application now has these webhook endpoints:

- **Message Events**: `POST /api/stream-chat/webhooks/message`
- **Channel Events**: `POST /api/stream-chat/webhooks/channel`
- **Health Check**: `GET /api/stream-chat/webhooks/health`

## 📋 **Stream Chat Dashboard Configuration**

### **Step 1: Access Stream Chat Dashboard**

1. Go to [Stream Chat Dashboard](https://dashboard.getstream.io/)
2. Select your app
3. Navigate to **Webhooks** in the left sidebar

### **Step 2: Configure Message Webhook**

1. Click **"Add Webhook"**
2. Configure the webhook:
   - **URL**: `https://your-domain.com/api/stream-chat/webhooks/message`
   - **Events**: Select `message.new`
   - **Status**: Enable
   - **Description**: "Message notifications for GreenUpp"

### **Step 3: Configure Channel Webhook**

1. Click **"Add Webhook"** again
2. Configure the webhook:
   - **URL**: `https://your-domain.com/api/stream-chat/webhooks/channel`
   - **Events**: Select `channel.member_added` and `channel.member_removed`
   - **Status**: Enable
   - **Description**: "Channel member notifications for GreenUpp"

### **Step 4: Test Webhooks**

1. In the Stream Chat dashboard, find your webhook
2. Click **"Test"** to send a test payload
3. Check your application logs to verify the webhook is received

## 🔍 **Testing the Integration**

### **Test Message Notifications**

1. Open your GreenUpp application
2. Navigate to the chat page
3. Send a message in a direct chat or group chat
4. Check that the recipient receives a notification
5. Click the notification to verify it opens the correct chat

### **Test Channel Notifications**

1. Add a user to a group chat
2. Verify they receive an "Added to chat" notification
3. Remove a user from a group chat
4. Verify they receive a "Removed from chat" notification

## 📊 **Notification Types**

The webhook system creates these notification types:

| Event                    | Notification Title        | Description                      |
| ------------------------ | ------------------------- | -------------------------------- |
| `message.new`            | "New message from [User]" | Shows truncated message content  |
| `channel.member_added`   | "Added to chat"           | Notifies when added to group     |
| `channel.member_removed` | "Removed from chat"       | Notifies when removed from group |

## 🔧 **Configuration Options**

### **Environment Variables**

Make sure these are set in your environment:

```bash
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
VITE_STREAM_API_KEY=your_stream_public_key
```

### **Notification Settings**

Users can control message notifications in their settings:

```typescript
// User notification preferences
{
  messageNotifications: true, // Controls chat message notifications
  // ... other notification types
}
```

## 🐛 **Troubleshooting**

### **Webhook Not Receiving Events**

1. **Check URL**: Ensure the webhook URL is correct and accessible
2. **Check Logs**: Look for webhook requests in your application logs
3. **Test Endpoint**: Use the health check endpoint to verify the route is working
4. **Stream Dashboard**: Check the webhook status in Stream Chat dashboard

### **Notifications Not Appearing**

1. **User Settings**: Check if the user has `messageNotifications` enabled
2. **WebSocket**: Ensure WebSocket connections are working for real-time notifications
3. **Database**: Check if notifications are being created in the database
4. **Frontend**: Verify the notification bell is showing unread counts

### **Common Error Messages**

```
"Stream Chat client is not initialized"
```

- Check that `STREAM_API_KEY` and `STREAM_API_SECRET` are set

```
"Invalid webhook data"
```

- Verify the webhook payload format from Stream Chat

```
"Failed to send notification"
```

- Check user notification settings and database connectivity

## 📝 **Webhook Payload Examples**

### **Message Event Payload**

```json
{
  "message": {
    "id": "message-id",
    "text": "Hello, how are you?",
    "user": {
      "id": "user-id",
      "name": "John Doe"
    }
  },
  "channel": {
    "id": "channel-id",
    "type": "messaging",
    "name": "Direct Message",
    "members": {
      "user1": { "user_id": "user1" },
      "user2": { "user_id": "user2" }
    }
  },
  "user": {
    "id": "user1",
    "name": "John Doe"
  }
}
```

### **Channel Event Payload**

```json
{
  "channel": {
    "id": "channel-id",
    "type": "messaging",
    "name": "Group Chat"
  },
  "user": {
    "id": "user-id",
    "name": "John Doe"
  },
  "event": "member.added"
}
```

## 🚀 **Deployment Notes**

### **Production Setup**

1. **HTTPS Required**: Stream Chat requires HTTPS for webhook URLs
2. **Domain Configuration**: Update webhook URLs with your production domain
3. **Environment Variables**: Set production Stream Chat credentials
4. **Monitoring**: Set up logging to monitor webhook performance

### **Security Considerations**

- Webhook endpoints don't require authentication (Stream Chat handles this)
- Validate webhook payloads before processing
- Implement rate limiting if needed
- Monitor for webhook abuse

## 📞 **Support**

If you encounter issues:

1. Check the application logs for error messages
2. Verify Stream Chat dashboard webhook configuration
3. Test webhook endpoints manually
4. Check user notification preferences

The webhook integration is now fully functional and will provide real-time message notifications to your users!
