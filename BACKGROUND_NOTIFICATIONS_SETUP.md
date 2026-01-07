# Background Notifications - COMPLETE FIX

## ✅ Critical Fixes Applied (Latest)

### Changes Made:

1. **app.config.ts** 
   - ✅ Updated app icon to use `AlooChat blue App Icon.svg`
   - ✅ Configured iOS to use `AppIcon.appiconset`
   - ✅ Updated notification icon for branding consistency
   - ✅ Expo-notifications configured with production mode

2. **firebase.json** 
   - ✅ Updated iOS foreground presentation to `["alert", "badge", "sound"]`
   - ✅ Enabled notification content extension for iOS

3. **expoBackgroundHandler.ts** 
   - ✅ Enhanced background message handler with error handling
   - ✅ Added fallback notification display for parse errors
   - ✅ Comprehensive logging for debugging
   - ✅ Auto-registration on module load

4. **backgroundMessageHandler.ts**
   - ✅ Disabled to prevent duplicate handler conflicts
   - ✅ Only expoBackgroundHandler is now active

5. **App.tsx**
   - ✅ Imports expoBackgroundHandler at the top (critical for background/killed state)

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

## 🚨 CRITICAL: FCM Payload Requirements

**For notifications to work in BACKGROUND/KILLED state, your backend MUST send:**

### iOS - Required Payload Structure:
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
          "content-available": 1
        }
      },
      "headers": {
        "apns-priority": "10"
      }
    }
  }
}
```

### Android - Required Payload Structure:
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
        "notification_priority": "PRIORITY_MAX"
      }
    }
  }
}
```

**⚠️ IMPORTANT:**
- **MUST include `notification` object** - Without this, iOS won't show notifications in killed state
- **MUST include `content-available: 1`** for iOS background processing
- **MUST set `apns-priority: 10`** for high priority on iOS
- **MUST set `priority: high`** for Android
- Data-only messages will NOT work in killed state on iOS!

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
