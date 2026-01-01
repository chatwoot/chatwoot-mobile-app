# Push Notifications Setup Guide - AlooChat Mobile App

## ✅ Current Status

Your push notifications are **ALREADY CONFIGURED** and ready to use! Here's what's in place:

### 1. Firebase Configuration ✅

**iOS Configuration:**
- File: `GoogleService-Info.plist`
- Bundle ID: `com.aloochat.app`
- Project ID: `aloochat-7c47c`
- GCM Sender ID: `673459506971`
- GCM Enabled: ✅ YES

**Android Configuration:**
- File: `google-services.json`
- Package Name: `com.aloochat.app`
- Project ID: `aloochat-7c47c`
- Project Number: `673459506971`

### 2. App Configuration ✅

**iOS Settings (`app.config.ts`):**
```typescript
ios: {
  infoPlist: {
    UIBackgroundModes: ['fetch', 'remote-notification'], // ✅ Enabled
  },
  entitlements: { 
    'aps-environment': 'production' // ✅ Production push enabled
  },
}
```

**Android Settings (`app.config.ts`):**
```typescript
android: {
  permissions: [
    'android.permission.CAMERA',
    'android.permission.RECORD_AUDIO'
    // POST_NOTIFICATIONS is requested at runtime
  ],
}
```

**Plugins Configured:**
- ✅ `@react-native-firebase/app`
- ✅ `@react-native-firebase/messaging`

### 3. Code Implementation ✅

**Permission Handling:**
- Location: `src/store/settings/settingsActions.ts`
- Requests notification permissions on both iOS and Android
- Handles Android 13+ (API 33+) POST_NOTIFICATIONS permission

**Background Message Handler:**
- Location: `src/navigation/index.tsx`
- Handles messages when app is in background/quit state

**Notification Listeners:**
- `getInitialNotification()` - App opened from quit state
- `onNotificationOpenedApp()` - App opened from background

## 📱 How Push Notifications Work

### Flow:
1. **User logs in** → App requests notification permission
2. **Permission granted** → Firebase generates FCM token
3. **Token sent to server** → Stored in AlooChat backend
4. **Server sends notification** → Firebase Cloud Messaging delivers
5. **User taps notification** → App opens to specific conversation

### Notification Types:
- **Foreground**: App is open and active
- **Background**: App is running but not active
- **Quit**: App is completely closed

## 🚀 Testing Push Notifications

### Prerequisites:
1. **Development Build Required** - Push notifications don't work in Expo Go
2. **Physical Device Recommended** - iOS simulator has limitations
3. **Server Must Be Running** - `https://cx.aloochat.ai` must be accessible

### Build for Testing:

**iOS (Development Build):**
```bash
# Build locally
eas build --profile development --platform ios --local

# Or build on EAS
eas build --profile development --platform ios
```

**Android (Development Build):**
```bash
# Build locally
eas build --profile development --platform android --local

# Or build on EAS
eas build --profile development --platform android
```

### Testing Steps:

1. **Install Development Build** on your device
2. **Log in** to the app with valid credentials
3. **Grant notification permissions** when prompted
4. **Verify FCM token** is registered (check Settings → Debug Actions)
5. **Send test notification** from Firebase Console or your backend
6. **Verify notification appears** on device
7. **Tap notification** and verify it opens the correct conversation

### Send Test Notification from Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `aloochat-7c47c`
3. Navigate to **Cloud Messaging**
4. Click **Send your first message**
5. Enter notification details:
   - **Title**: "Test Notification"
   - **Text**: "This is a test message"
6. Click **Send test message**
7. Enter your FCM token (from app's Debug Actions)
8. Click **Test**

## 🔧 Troubleshooting

### iOS Issues:

**Problem**: Notifications not appearing
- ✅ Check: Notification permissions granted in Settings
- ✅ Check: `aps-environment` entitlement is set to `production`
- ✅ Check: APNs certificate is valid in Firebase Console
- ✅ Check: Device is not in Do Not Disturb mode

**Problem**: Background notifications not working
- ✅ Check: `UIBackgroundModes` includes `remote-notification`
- ✅ Check: Background App Refresh is enabled

### Android Issues:

**Problem**: Notifications not appearing
- ✅ Check: Notification permissions granted (Android 13+)
- ✅ Check: `google-services.json` is in the correct location
- ✅ Check: Battery optimization is disabled for the app

**Problem**: Notification icon not showing
- ✅ Add notification icon to `android/app/src/main/res/drawable`

### General Issues:

**Problem**: FCM token not generated
- ✅ Check: Firebase is properly initialized
- ✅ Check: Google Services files are valid
- ✅ Check: Internet connection is available
- ✅ Check: Using development build (not Expo Go)

**Problem**: Notifications work but don't open conversation
- ✅ Check: Notification payload includes conversation ID
- ✅ Check: Deep linking is properly configured
- ✅ Check: Navigation handlers are working

## 📊 Monitoring

### Check Notification Status:

**In App:**
1. Open Settings screen
2. Long press on version number at bottom
3. View Debug Actions
4. Check "Push Token" field - should show FCM token

**In Code:**
- FCM Token: `selectPushToken` selector
- Notification Settings: `selectNotificationSettings` selector

### Firebase Console:
- View delivery statistics
- Check error logs
- Monitor token refresh events

## 🔐 Security Notes

1. **FCM Token Security**:
   - Tokens are device-specific
   - Tokens can expire and refresh
   - Never hardcode tokens

2. **Notification Payload**:
   - Don't include sensitive data in notification body
   - Use data payload for conversation IDs
   - Validate all notification data

3. **Permissions**:
   - Always request permissions with context
   - Handle permission denial gracefully
   - Re-prompt only when necessary

## 📝 Environment Variables

Current configuration in `.env`:
```bash
FIREBASE_PROJECT_ID=aloochat-cca67
EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE=./GoogleService-Info.plist
EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE=./google-services.json
```

**Note**: The Firebase project IDs don't match:
- `.env` shows: `aloochat-cca67`
- Google Services files show: `aloochat-7c47c`

This is OK if you're using different Firebase projects for different purposes (e.g., one for backend, one for mobile).

## 🎯 Next Steps

1. **Build Development Build**:
   ```bash
   eas build --profile development --platform ios
   eas build --profile development --platform android
   ```

2. **Test on Physical Device**:
   - Install the development build
   - Log in with valid credentials
   - Grant notification permissions
   - Send test notification

3. **Verify Backend Integration**:
   - Ensure AlooChat backend (`https://cx.aloochat.ai`) is configured to send FCM notifications
   - Verify FCM server key is configured in backend
   - Test notification delivery from backend

4. **Production Build** (when ready):
   ```bash
   eas build --profile production --platform ios
   eas build --profile production --platform android
   ```

## 📚 Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Messaging](https://rnfirebase.io/messaging/usage)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

**Status**: ✅ Push notifications are fully configured and ready for testing with a development build!
