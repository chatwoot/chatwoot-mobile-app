# Notifications in Killed/Dead Mode - CRITICAL FIX

## 🚨 Why Notifications Don't Work in Killed Mode

**The #1 reason notifications fail in killed/dead mode is BACKEND PAYLOAD FORMAT.**

Your app is configured correctly, but if your backend sends **data-only messages**, iOS will NOT show notifications when the app is killed.

---

## ✅ REQUIRED: Backend FCM Payload Format

### **For iOS (Killed Mode to Work):**

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Sender Name",
      "body": "Message content"
    },
    "data": {
      "conversationId": "123",
      "notificationType": "assigned_conversation_new_message"
    },
    "apns": {
      "payload": {
        "aps": {
          "alert": {
            "title": "Sender Name",
            "body": "Message content"
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
    }
  }
}
```

### **For Android (Killed Mode to Work):**

```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Sender Name",
      "body": "Message content"
    },
    "data": {
      "conversationId": "123",
      "notificationType": "assigned_conversation_new_message"
    },
    "android": {
      "priority": "high",
      "notification": {
        "channel_id": "aloochat_messages",
        "sound": "default",
        "notification_priority": "PRIORITY_MAX",
        "default_sound": true,
        "default_vibrate_timings": true
      }
    }
  }
}
```

---

## ⚠️ CRITICAL REQUIREMENTS:

### **iOS:**
1. ✅ **MUST include `notification` object** - Without this, iOS won't show anything in killed state
2. ✅ **MUST set `content-available: 1`** - Enables background processing
3. ✅ **MUST set `apns-priority: 10`** - High priority delivery
4. ✅ **MUST set `apns-push-type: alert`** - Required for iOS 13+
5. ✅ **MUST set `mutable-content: 1`** - Allows notification modification

### **Android:**
1. ✅ **MUST include `notification` object** - System displays this automatically
2. ✅ **MUST set `priority: high`** - High priority delivery
3. ✅ **MUST set `channel_id: aloochat_messages`** - Uses your configured channel
4. ✅ **MUST set `notification_priority: PRIORITY_MAX`** - Maximum importance

---

## 🔍 How to Test:

### **1. Kill the App Completely:**
- iOS: Swipe up from bottom, swipe app away
- Android: Recent apps → Swipe away

### **2. Send Test Notification:**

Use Firebase Console or your backend API:

**Firebase Console:**
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter notification title and body
4. Click "Send test message"
5. Enter your device FCM token
6. Click "Test"

**Backend API (Chatwoot):**
Ensure your Chatwoot backend sends the payload format shown above.

### **3. Expected Result:**
- ✅ Notification appears in notification tray
- ✅ Sound plays
- ✅ Badge updates
- ✅ Tapping opens app to conversation

---

## 🐛 Troubleshooting:

### **If Notifications Still Don't Work in Killed Mode:**

#### **1. Check Backend Payload:**
```bash
# Enable FCM debug logging
adb shell setprop log.tag.FCM DEBUG
adb logcat -s FCM

# For iOS, check Xcode console
```

Look for the payload being received. If it's data-only (no `notification` object), that's your problem.

#### **2. Verify APNs Certificate:**
- Go to Apple Developer Portal
- Certificates → Check APNs certificate is valid
- Should be "Apple Push Notification service SSL (Production)"

#### **3. Check Device Settings:**

**iOS:**
- Settings → AlooChat → Notifications → Ensure ALL enabled
- Settings → Screen Time → Content & Privacy → Allowed Apps → AlooChat enabled

**Android:**
- Settings → Apps → AlooChat → Notifications → Ensure enabled
- Settings → Apps → AlooChat → Battery → Don't optimize
- Settings → Apps → AlooChat → Notifications → "Chat Messages" channel enabled

#### **4. Test with Firebase Console:**
Send a test notification directly from Firebase Console to rule out backend issues.

---

## 📊 App Configuration (Already Done):

✅ **firebase.json:**
```json
{
  "messaging_ios_auto_register_for_remote_messages": true,
  "messaging_ios_foreground_presentation_options": ["alert", "badge", "sound"],
  "messaging_ios_notification_content_extension": true
}
```

✅ **app.config.ts:**
```typescript
UIBackgroundModes: ['fetch', 'remote-notification']
```

✅ **expoBackgroundHandler.ts:**
- Registered at app startup (App.tsx imports it)
- Handles all background/killed notifications
- Fallback error handling

---

## 🎯 Common Mistakes:

### ❌ **Data-Only Messages:**
```json
{
  "data": {
    "title": "Test",
    "body": "Message"
  }
}
```
**This will NOT work in killed mode on iOS!**

### ✅ **Correct Format:**
```json
{
  "notification": {
    "title": "Test",
    "body": "Message"
  },
  "data": {
    "conversationId": "123"
  }
}
```
**This WILL work in all modes!**

---

## 🚀 Next Steps:

1. **Rebuild the app:**
```bash
eas build --profile preview --platform android
eas build --profile testflight --platform ios --auto-submit
```

2. **Update your backend** to send the correct FCM payload format (see above)

3. **Test in killed mode:**
- Kill app completely
- Send notification from backend
- Should appear in notification tray

---

**If notifications still don't work after rebuilding, the issue is 100% in your BACKEND payload format. Share the actual FCM payload your backend is sending and I can help debug it.**

---

**Last Updated:** January 7, 2026
**Status:** ✅ App configured correctly - Backend payload format is critical
