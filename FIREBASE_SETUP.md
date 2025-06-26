# 🔥 Firebase Setup Guide for Greenupp Platform

This guide will help you set up Firebase for push notifications in your Greenupp platform.

## 📋 **Prerequisites**

- Google account
- Node.js project with Firebase Admin SDK installed
- Access to Firebase Console

## 🚀 **Step-by-Step Setup**

### **1. Create Firebase Project**

1. **Go to Firebase Console**

   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter project name: `greenupp-platform` (or your preferred name)
   - Choose whether to enable Google Analytics (recommended)
   - Click "Create project"

### **2. Enable Cloud Messaging (FCM)**

1. **Navigate to Project Settings**

   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Go to Cloud Messaging Tab**
   - Click on "Cloud Messaging" tab
   - This is where you'll get your FCM configuration

### **3. Get Web App Configuration**

1. **Add Web App**

   - In Project Settings, scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Register app with nickname: `Greenupp Web App`
   - Click "Register app"

2. **Copy Configuration**
   - You'll see a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
   };
   ```

### **4. Get Service Account Key (For Server)**

1. **Go to Service Accounts**

   - In Project Settings, click "Service accounts" tab
   - Click "Generate new private key"

2. **Download JSON File**
   - Click "Generate key"
   - Download the JSON file (keep this secure!)
   - The file will contain:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "key-id",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     "client_id": "client-id",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
   }
   ```

### **5. Set Environment Variables**

Add these to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Optional: Firebase Web Config (for client-side)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

### **6. Test Firebase Connection**

Run the server and check the logs:

```bash
npm run dev
```

You should see:

```
✅ Firebase Admin SDK initialized successfully
```

## 🔧 **API Endpoints Available**

Once Firebase is set up, these endpoints will be available:

### **Push Notification Management**

- `POST /api/push-notifications/register` - Register FCM token
- `DELETE /api/push-notifications/unregister` - Remove FCM token
- `PATCH /api/push-notifications/preferences` - Update preferences
- `POST /api/push-notifications/test` - Send test notification

### **Topic Management**

- `POST /api/push-notifications/subscribe` - Subscribe to topic
- `POST /api/push-notifications/unsubscribe` - Unsubscribe from topic

## 📱 **Client-Side Integration**

### **Web Push Notifications**

Add this to your client-side code:

```javascript
// Request notification permission
if ("Notification" in window) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      // Register for push notifications
      registerForPushNotifications();
    }
  });
}

async function registerForPushNotifications() {
  try {
    const response = await fetch("/api/push-notifications/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fcmToken: "your-fcm-token-here",
      }),
    });

    if (response.ok) {
      console.log("Push notifications registered successfully");
    }
  } catch (error) {
    console.error("Failed to register push notifications:", error);
  }
}
```

### **Mobile App Integration**

For React Native or mobile apps, you'll need to:

1. Install Firebase SDK for your platform
2. Get FCM token from the device
3. Send token to your server via the register endpoint

## 🧪 **Testing Push Notifications**

### **Test via API**

```bash
# Send test notification
curl -X POST http://localhost:5000/api/push-notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification"
  }'
```

### **Test via Admin Panel**

Use the performance monitoring endpoint to test:

```bash
curl http://localhost:5000/api/admin/performance
```

## 🔒 **Security Considerations**

1. **Keep Service Account Key Secure**

   - Never commit the JSON file to version control
   - Use environment variables
   - Rotate keys regularly

2. **Validate FCM Tokens**

   - Always validate tokens on the server
   - Remove invalid tokens from database

3. **Rate Limiting**
   - Implement rate limiting for notification endpoints
   - Prevent spam notifications

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Firebase credentials not found"**

   - Check environment variables are set correctly
   - Ensure private key includes `\n` characters

2. **"Failed to initialize Firebase"**

   - Verify project ID matches
   - Check service account permissions

3. **"No FCM token found"**
   - Ensure user has registered for push notifications
   - Check if push notifications are enabled

### **Debug Commands**

```bash
# Check Firebase initialization
npm run dev

# Test notification endpoint
curl -X POST http://localhost:5000/api/push-notifications/test \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test message"}'

# Check environment variables
echo $FIREBASE_PROJECT_ID
```

## 📊 **Monitoring**

### **Firebase Console**

- Monitor message delivery in Firebase Console
- Check analytics and engagement metrics
- View error logs and debugging information

### **Server Logs**

- Check server logs for Firebase errors
- Monitor notification delivery success rates
- Track user engagement with notifications

## 🎯 **Next Steps**

1. **Implement Client-Side FCM Token Registration**
2. **Add Notification Preferences UI**
3. **Create Notification Templates**
4. **Set Up Topic-Based Notifications**
5. **Implement Notification Analytics**

---

**Need Help?** Check the Firebase documentation or contact the development team! 🚀
