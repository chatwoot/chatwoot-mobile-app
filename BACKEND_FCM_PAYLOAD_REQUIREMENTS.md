# BACKEND FCM PAYLOAD - CRITICAL FOR KILLED MODE NOTIFICATIONS

## 🚨 THE PROBLEM

**Your app is configured correctly.** The reason notifications don't work in killed/dead mode is because your **BACKEND is sending DATA-ONLY messages**.

iOS **REQUIRES** the `notification` object in the FCM payload to display notifications when the app is killed. Without it, the notification is silently discarded.

---

## ✅ SOLUTION: Update Your Backend

### **Chatwoot Backend Configuration:**

If you're using Chatwoot, ensure it's configured to send FCM HTTP v1 API format with the `notification` object.

**File to modify:** `app/services/firebase_cloud_messaging/notification_service.rb` (or similar)

### **Required FCM Payload Format:**

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN_HERE",
    "notification": {
      "title": "{{sender_name}}",
      "body": "{{message_content}}"
    },
    "data": {
      "conversationId": "{{conversation_id}}",
      "notificationType": "assigned_conversation_new_message",
      "payload": "{{full_notification_json}}"
    },
    "apns": {
      "payload": {
        "aps": {
          "alert": {
            "title": "{{sender_name}}",
            "body": "{{message_content}}"
          },
          "sound": "default",
          "badge": 1,
          "content-available": 1,
          "mutable-content": 1
        }
      },
      "headers": {
        "apns-priority": "10",
        "apns-push-type": "alert"
      }
    },
    "android": {
      "priority": "high",
      "notification": {
        "channel_id": "aloochat_messages",
        "sound": "default",
        "notification_priority": "PRIORITY_MAX",
        "default_sound": true,
        "default_vibrate_timings": true,
        "notification_count": 1
      }
    }
  }
}
```

---

## 📋 Backend Checklist:

### **What Your Backend MUST Send:**

- [ ] `notification.title` - Sender name or notification title
- [ ] `notification.body` - Message content
- [ ] `data` object - For app navigation
- [ ] `apns.payload.aps.content-available: 1` - iOS background processing
- [ ] `apns.headers.apns-priority: 10` - High priority
- [ ] `apns.headers.apns-push-type: alert` - iOS 13+ requirement
- [ ] `android.priority: high` - Android high priority
- [ ] `android.notification.channel_id: aloochat_messages` - Your channel

---

## ❌ WRONG (Data-Only - Won't Work in Killed Mode):

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "data": {
      "title": "Test",
      "body": "Message",
      "conversationId": "123"
    }
  }
}
```

**This format will:**
- ✅ Work in foreground
- ✅ Work in background
- ❌ **NOT work in killed mode on iOS**

---

## ✅ CORRECT (Works in All Modes):

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Message"
    },
    "data": {
      "conversationId": "123"
    },
    "apns": {
      "payload": {
        "aps": {
          "content-available": 1,
          "sound": "default"
        }
      },
      "headers": {
        "apns-priority": "10"
      }
    }
  }
}
```

**This format will:**
- ✅ Work in foreground
- ✅ Work in background
- ✅ **Work in killed mode on iOS**
- ✅ **Work in killed mode on Android**

---

## 🧪 How to Verify Backend is Sending Correct Format:

### **Method 1: Firebase Console Test**
1. Go to Firebase Console → Cloud Messaging
2. Send test notification with title and body
3. If this works in killed mode, your backend is the problem

### **Method 2: Check Backend Logs**
Look for FCM payload being sent. It should include the `notification` object.

### **Method 3: Device Logs**

**iOS (Xcode Console):**
```
[ExpoBackgroundHandler] Raw message: {
  "notification": { "title": "...", "body": "..." },  ← MUST BE PRESENT
  "data": { ... }
}
```

**Android (Logcat):**
```bash
adb logcat | grep FCM
```

---

## 🔧 Backend Code Example (Node.js):

```javascript
const admin = require('firebase-admin');

async function sendNotification(deviceToken, senderName, messageContent, conversationId) {
  const message = {
    token: deviceToken,
    notification: {  // ← CRITICAL: Must include this
      title: senderName,
      body: messageContent,
    },
    data: {
      conversationId: String(conversationId),
      notificationType: 'assigned_conversation_new_message',
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: senderName,
            body: messageContent,
          },
          sound: 'default',
          badge: 1,
          'content-available': 1,
          'mutable-content': 1,
        },
      },
      headers: {
        'apns-priority': '10',
        'apns-push-type': 'alert',
      },
    },
    android: {
      priority: 'high',
      notification: {
        channel_id: 'aloochat_messages',
        sound: 'default',
        notification_priority: 'PRIORITY_MAX',
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

---

## 🎯 Summary:

**Your App:** ✅ Configured correctly
**Your Backend:** ❌ Must send `notification` object in FCM payload

**Action Required:**
1. Update backend to include `notification` object
2. Rebuild app: `eas build --profile preview --platform android`
3. Test in killed mode

**Without the `notification` object in the FCM payload, iOS will NEVER show notifications in killed mode. This is an iOS limitation, not an app bug.**

---

**Read this document and share it with your backend team!**
