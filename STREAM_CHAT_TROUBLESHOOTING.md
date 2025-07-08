# Stream Chat Notification Troubleshooting Guide

## 🔍 **Current Status**

✅ **Webhook Endpoint**: Working (tested with curl)  
✅ **Notification Service**: Integrated  
✅ **Database**: Notifications table exists  
❓ **Stream Chat Configuration**: Needs verification  
❓ **Frontend Display**: Needs verification

## 🚨 **Common Issues & Solutions**

### **1. Stream Chat Webhook Not Configured**

**Problem**: Stream Chat isn't sending webhook events to your endpoint.

**Solution**:

1. Go to your Stream Chat Dashboard
2. Navigate to **Webhooks** section
3. Add webhook URL: `https://your-domain.com/api/stream-chat/webhooks/message`
4. Select events: `message.new`, `member.added`, `member.removed`
5. Save configuration

### **2. Webhook URL Not Accessible**

**Problem**: Stream Chat can't reach your webhook endpoint.

**Solution**:

- Ensure your server is publicly accessible
- Check if HTTPS is required (Stream Chat prefers HTTPS)
- Verify firewall settings
- Test with: `curl -X POST https://your-domain.com/api/stream-chat/webhooks/health`

### **3. Environment Variables Missing**

**Problem**: Stream Chat service can't initialize.

**Solution**: Verify these environment variables are set:

```bash
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### **4. Database Connection Issues**

**Problem**: Notifications aren't being saved to database.

**Solution**:

1. Check database connection
2. Verify notifications table exists
3. Check database logs for errors

### **5. Frontend Not Displaying Notifications**

**Problem**: Notifications are created but not showing in UI.

**Solution**:

1. Check WebSocket connection
2. Verify notification hooks are working
3. Check browser console for errors

## 🧪 **Testing Steps**

### **Step 1: Test Webhook Endpoint**

```bash
curl -X POST http://localhost:3000/api/stream-chat/webhooks/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": {"id": "test123", "text": "Hello world"},
    "channel": {
      "id": "test-channel",
      "type": "messaging",
      "members": {
        "user1": {"user_id": "1"},
        "user2": {"user_id": "2"}
      }
    },
    "user": {"id": "1", "name": "Test User"}
  }'
```

### **Step 2: Check Database**

```sql
SELECT * FROM notifications WHERE type = 'message' ORDER BY created_at DESC LIMIT 5;
```

### **Step 3: Test Frontend**

1. Open browser developer tools
2. Go to Network tab
3. Send a message in Stream Chat
4. Check if webhook request is made
5. Check if notification appears in UI

### **Step 4: Check Server Logs**

Look for these log messages:

- "Received message webhook from Stream Chat"
- "Sending notification to user"
- "Notification created successfully"

## 🔧 **Debug Commands**

### **Check Webhook Health**

```bash
curl http://localhost:3000/api/stream-chat/webhooks/health
```

### **Check Stream Chat Connection**

```bash
curl http://localhost:3000/api/stream-chat/test-connection
```

### **Check Notification Count**

```bash
curl http://localhost:3000/api/notifications/count
```

## 📋 **Configuration Checklist**

- [ ] Stream Chat API key configured
- [ ] Stream Chat API secret configured
- [ ] Webhook URL added to Stream Chat dashboard
- [ ] Webhook events selected (message.new, member.added, member.removed)
- [ ] Server is publicly accessible
- [ ] Database connection working
- [ ] WebSocket connection working
- [ ] Frontend notification hooks working

## 🆘 **Still Not Working?**

If notifications still aren't working after following this guide:

1. **Check Server Logs**: Look for error messages in your server console
2. **Check Stream Chat Dashboard**: Verify webhook delivery status
3. **Test with Real Messages**: Send actual messages between users
4. **Check Network Tab**: Monitor webhook requests in browser dev tools
5. **Verify User IDs**: Ensure user IDs match between Stream Chat and your database

## 📞 **Support**

If you need further assistance:

1. Check the server logs for specific error messages
2. Verify your Stream Chat dashboard configuration
3. Test with the provided curl commands
4. Check the browser console for frontend errors
