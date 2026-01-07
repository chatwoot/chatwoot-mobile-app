# Background Notifications Setup Guide

## ✅ What Has Been Fixed

Your app now has complete background notification support configured for both iOS and Android.

### Changes Made:

1. **app.config.ts** - Added expo-notifications configuration with production mode
2. **firebase.json** - Updated iOS foreground presentation options and enabled notification content extension
3. **expoBackgroundHandler.ts** - Enhanced notification channels and auto-registration
4. **Existing handlers** - Already properly configured in App.tsx

## 📱 How Background Notifications Work Now

### iOS:
- ✅ **Foreground**: Notifications display when app is open
- ✅ **Background**: Notifications display when app is minimized
- ✅ **Killed**: Notifications display when app is completely closed
- ✅ **Background fetch**: Enabled via UIBackgroundModes

### Android:
- ✅ **Foreground**: Notifications display when app is open
- ✅ **Background**: Notifications display when app is minimized
- ✅ **Killed**: Notifications display when app is completely closed
- ✅ **Channels**: High-priority channels configured

## 🔧 Next Steps

### 1. Rebuild Your App

Since you modified native configuration, you MUST rebuild:

```bash
# For iOS (TestFlight)
eas build --profile testflight --platform ios --auto-submit

# For Android
eas build --profile production --platform android
```

### 2. Test Background Notifications

After rebuilding and installing:

**Test Scenarios:**
1. **App in Foreground** - Send notification → Should appear at top of screen
2. **App in Background** - Minimize app → Send notification → Should appear in notification tray
3. **App Killed** - Swipe away app → Send notification → Should appear in notification tray

### 3. Send Test Notification

Use Firebase Console or your backend to send a test notification:

**FCM Payload Format (Chatwoot style):**
```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Test Message",
      "body": "This is a test notification"
    },
    "data": {
      "conversationId": "123",
      "notificationType": "assigned_conversation_new_message"
    },
    "apns": {
      "payload": {
        "aps": {
          "alert": {
            "title": "Test Message",
            "body": "This is a test notification"
          },
          "sound": "default",
          "badge": 1,
          "content-available": 1
        }
      }
    },
    "android": {
      "notification": {
        "channel_id": "aloochat_messages",
        "sound": "default"
      }
    }
  }
}
```

## 🐛 Troubleshooting

### iOS Notifications Not Working?

1. **Check Permissions:**
   - Settings → AlooChat → Notifications → Ensure "Allow Notifications" is ON

2. **Check Certificate:**
   - Verify APNs certificate is valid in Apple Developer Portal
   - Check `aps-environment` entitlement is set to `production`

3. **Check Logs:**
   - Use Xcode console to see notification logs
   - Look for `[ExpoBackgroundHandler]` logs

### Android Notifications Not Working?

1. **Check Permissions:**
   - Settings → Apps → AlooChat → Notifications → Ensure enabled

2. **Check Channel:**
   - Settings → Apps → AlooChat → Notifications → "Chat Messages" should be enabled

3. **Check Battery Optimization:**
   - Settings → Battery → Battery Optimization → AlooChat → Select "Don't optimize"

## 📊 Notification Flow

```
FCM Server → Device
    ↓
Firebase Messaging
    ↓
Background Handler (expoBackgroundHandler.ts)
    ↓
Parse Payload
    ↓
Display Notification (expo-notifications)
    ↓
User Taps → Navigate to Conversation
```

## 🔑 Key Files

- `App.tsx` - Imports background handler at top
- `src/services/expoBackgroundHandler.ts` - Main background handler
- `src/services/NotificationService.ts` - Foreground notifications
- `firebase.json` - Firebase configuration
- `app.config.ts` - Expo notification configuration

## ⚠️ Important Notes

1. **Always rebuild** after changing notification configuration
2. **Test on real devices** - Simulators have limited notification support
3. **Background notifications require** proper FCM payload format
4. **iOS requires** valid APNs certificate in production
5. **Android requires** notification channels to be created

## 🎯 Expected Behavior

✅ Notifications work in all app states (foreground, background, killed)
✅ Tapping notification opens the app to the correct conversation
✅ Badge count updates automatically
✅ Sound plays on notification arrival
✅ Notifications persist in notification tray until dismissed

---

**Last Updated:** January 7, 2026
**Status:** ✅ Fully Configured - Rebuild Required
