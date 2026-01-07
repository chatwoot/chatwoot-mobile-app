# Test Notifications in Killed Mode - Step by Step

## 🧪 How to Test After Rebuild

### **Step 1: Rebuild the App**
```bash
# Android
eas build --profile preview --platform android

# iOS
eas build --profile testflight --platform ios --auto-submit
```

### **Step 2: Install on Device**
- **Android:** Download APK from EAS build link
- **iOS:** Install via TestFlight

### **Step 3: Get FCM Token**
1. Open the app
2. Go to Settings (if available) or check logs
3. Copy the FCM device token
4. You'll need this to send test notifications

### **Step 4: Kill the App Completely**

**iOS:**
1. Swipe up from bottom of screen
2. Find AlooChat in app switcher
3. Swipe up to close completely
4. Wait 5 seconds

**Android:**
1. Open recent apps (square button)
2. Find AlooChat
3. Swipe away to close
4. Wait 5 seconds

### **Step 5: Send Test Notification**

#### **Option A: Firebase Console (Easiest)**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Cloud Messaging → Send your first message
4. Fill in:
   - **Notification title:** "Test Notification"
   - **Notification text:** "Testing killed mode"
5. Click "Send test message"
6. Paste your FCM token
7. Click "Test"

**Expected Result:** ✅ Notification appears in notification tray

#### **Option B: Using curl (Advanced)**

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "DEVICE_FCM_TOKEN",
      "notification": {
        "title": "Test Notification",
        "body": "Testing killed mode"
      },
      "data": {
        "conversationId": "123"
      },
      "apns": {
        "payload": {
          "aps": {
            "alert": {
              "title": "Test Notification",
              "body": "Testing killed mode"
            },
            "sound": "default",
            "badge": 1,
            "content-available": 1
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
          "sound": "default"
        }
      }
    }
  }'
```

---

## ✅ Success Criteria:

### **Killed Mode Test:**
- [ ] App is completely closed (not in recent apps)
- [ ] Notification appears in notification tray
- [ ] Sound plays
- [ ] Badge updates (iOS)
- [ ] Tapping notification opens app
- [ ] App navigates to correct conversation

### **Background Mode Test:**
- [ ] App is minimized (in recent apps)
- [ ] Notification appears in notification tray
- [ ] Sound plays
- [ ] Tapping opens app

### **Foreground Mode Test:**
- [ ] App is open and active
- [ ] Notification appears at top of screen
- [ ] Sound plays
- [ ] Notification is actionable

---

## 🐛 If Notifications DON'T Work in Killed Mode:

### **1. Check Backend Payload:**

The backend MUST send this format:
```json
{
  "notification": {  ← MUST BE PRESENT
    "title": "...",
    "body": "..."
  }
}
```

**If your backend sends data-only messages, iOS will NEVER show notifications in killed mode.**

### **2. Verify Permissions:**

**iOS:**
- Settings → AlooChat → Notifications → All toggles ON
- Settings → Screen Time → Content & Privacy → Allowed Apps → AlooChat ON

**Android:**
- Settings → Apps → AlooChat → Notifications → Enabled
- Settings → Apps → AlooChat → Battery → Don't optimize
- Settings → Apps → AlooChat → Notifications → "Chat Messages" channel → Enabled

### **3. Check APNs Certificate (iOS):**
- Apple Developer Portal → Certificates
- Verify APNs certificate is valid and not expired
- Should be "Apple Push Notification service SSL (Production)"

### **4. Check Device Logs:**

**iOS (Xcode):**
1. Connect iPhone to Mac
2. Open Xcode → Window → Devices and Simulators
3. Select your device → Open Console
4. Filter for "ExpoBackgroundHandler" or "Firebase"
5. Send notification and watch logs

**Android (adb):**
```bash
adb logcat | grep -E "FCM|Notifee|ExpoBackgroundHandler"
```

---

## 📊 Expected Log Output:

### **When Notification Arrives in Killed Mode:**

**iOS:**
```
[ExpoBackgroundHandler] 🔔 ====== BACKGROUND MESSAGE ======
[ExpoBackgroundHandler] Raw message: { notification: {...}, data: {...} }
[ExpoBackgroundHandler] Parsed: { title: "...", body: "..." }
[ExpoBackgroundHandler] ✅ Background notification displayed
```

**Android:**
```
[BGHandler] ====== BACKGROUND MESSAGE RECEIVED ======
[BGHandler] Message: { notification: {...}, data: {...} }
[BGHandler] ✅ Notification displayed! ID: ...
```

---

## 🎯 Common Issues & Solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| No notification in killed mode | Backend sends data-only | Add `notification` object to FCM payload |
| Notification shows but no sound | Missing `sound: "default"` | Add to FCM payload |
| Notification doesn't open app | Missing `data.conversationId` | Add conversation data to payload |
| iOS notifications work, Android don't | Missing `channel_id` | Add `android.notification.channel_id` |
| Android works, iOS doesn't | Missing `notification` object | Add to FCM payload |

---

## 🚀 Final Checklist:

Before reporting "not working":

- [ ] App rebuilt with latest changes
- [ ] App installed on device via TestFlight/APK
- [ ] App completely killed (not in recent apps)
- [ ] FCM token obtained from device
- [ ] Test notification sent from Firebase Console
- [ ] Device permissions checked
- [ ] Backend payload includes `notification` object

---

**If Firebase Console test works but your backend doesn't, the issue is 100% in your backend FCM payload format.**

**Read `BACKEND_FCM_PAYLOAD_REQUIREMENTS.md` for complete backend configuration!**
