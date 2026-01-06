# FCM Silent Notifications - Complete Fix Guide

## Root Cause Analysis

### Why Notifications Are Silent

1. **Chatwoot Backend**: Sends FCM messages with `notification` + `data` fields
2. **Expo Go Limitation**: Firebase native modules unavailable → `notification` field ignored
3. **Result**: Only `data` arrives → No auto-display → Silent notification

### FCM Payload Types

| Type | Structure | Auto-Display | Expo Go Support |
|------|-----------|--------------|-----------------|
| **Notification-only** | `{ notification: {...} }` | ✅ Yes (background/killed) | ❌ No |
| **Data-only** | `{ data: {...} }` | ❌ No (must handle manually) | ⚠️ Limited |
| **Mixed** | `{ notification: {...}, data: {...} }` | ✅ Yes + custom data | ❌ No |

**Chatwoot uses Mixed type**, but Expo Go only receives the `data` part.

---

## 🔧 Solution 1: Backend Changes (Recommended for Production)

### Option A: Modify Chatwoot to Send Proper Notification Payload

**File**: `app/services/notification/push_notification_service.rb`

**Current Code:**
```ruby
def send_fcm_push(subscription)
  return unless subscription.fcm?
  
  fcm = FCM.new(ENV['FCM_SERVER_KEY'])
  options = {
    "notification": {
      "title": notification.notification_type.titleize,
      "body": notification.push_message_title
    },
    "data": { notification: notification.push_event_data.to_json }
  }
  
  response = fcm.send([subscription.subscription_attributes['push_token']], options)
  subscription.destroy! if JSON.parse(response[:body])['results']&.first&.keys&.include?('error')
end
```

**Fixed Code (Better Notification Display):**
```ruby
def send_fcm_push(subscription)
  return unless subscription.fcm?
  
  fcm = FCM.new(ENV['FCM_SERVER_KEY'])
  
  # Get sender name and message content for better notifications
  sender_name = notification.primary_actor&.meta&.dig('sender', 'name') || 'Someone'
  message_content = notification.primary_actor&.meta&.dig('last_message', 'content') || notification.push_message_title
  
  options = {
    "notification": {
      "title": sender_name,
      "body": message_content,
      "sound": "default",
      "badge": "1"
    },
    "data": { 
      notification: notification.push_event_data.to_json,
      notification_type: notification.notification_type,
      conversation_id: notification.primary_actor&.conversation_id&.to_s || notification.primary_actor&.id&.to_s,
      push_message_title: notification.push_message_title
    },
    "priority": "high",
    "content_available": true
  }
  
  response = fcm.send([subscription.subscription_attributes['push_token']], options)
  subscription.destroy! if JSON.parse(response[:body])['results']&.first&.keys&.include?('error')
end
```

**Key Changes:**
- ✅ Better title (sender name instead of "Assigned Conversation New Message")
- ✅ Better body (actual message content)
- ✅ Added `sound`, `badge`, `priority`, `content_available`
- ✅ Flattened data structure for easier parsing

---

## 🔧 Solution 2: Client-Side Handling (Current Implementation)

Since you can't modify Chatwoot backend immediately, the client must handle data-only messages.

### Current Implementation Status

**✅ What's Already Working:**
1. Notification channels created (`aloochat_messages`, `aloochat_sla_alerts`)
2. Permission handling
3. Token registration with backend
4. Foreground notification handler (Firebase `onMessage`)
5. Background task registration (expo-task-manager)
6. Payload parsing for multiple Chatwoot formats

**❌ What's NOT Working in Expo Go:**
1. Firebase native modules unavailable
2. `messaging().onMessage()` never fires
3. Background handler never receives messages
4. No FCM messages reach the app at all

---

## 🎯 The Real Solution: Build with EAS

### Why Expo Go Cannot Work

```
Expo Go → No Firebase Native Modules → No FCM Reception → Silent Notifications
```

**You MUST build with EAS for FCM to work:**

```bash
npx eas-cli build -p android --profile preview
```

### After Building, Notifications Will Work Because:

1. ✅ Firebase native modules included
2. ✅ `messaging().onMessage()` fires in foreground
3. ✅ `setBackgroundMessageHandler()` fires in background
4. ✅ System auto-displays notifications when app is killed
5. ✅ All your parsing logic will execute correctly

---

## 📱 Expected Behavior After EAS Build

### Foreground (App Open)
```
FCM Message Arrives
  ↓
messaging().onMessage() fires
  ↓
parsePayload() extracts title/body
  ↓
displayBackgroundNotification() shows it
  ↓
User sees notification banner
```

### Background (App Minimized)
```
FCM Message Arrives
  ↓
setBackgroundMessageHandler() fires
  ↓
parsePayload() extracts title/body
  ↓
displayBackgroundNotification() shows it
  ↓
User sees notification banner
```

### Killed (App Closed)
```
FCM Message Arrives
  ↓
System auto-displays notification.title + notification.body
  ↓
User taps notification
  ↓
App opens → addNotificationResponseListener() fires
  ↓
Navigate to conversation
```

---

## 🐛 Common Mistakes That Cause Silent Notifications

### 1. Data-Only Messages Without Handler
```javascript
// ❌ WRONG: No foreground handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // ← Silent!
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

```javascript
// ✅ CORRECT: Show in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

### 2. Missing Android Channel
```javascript
// ❌ WRONG: No channel or wrong importance
await Notifications.setNotificationChannelAsync('default', {
  importance: Notifications.AndroidImportance.LOW, // ← Silent!
});
```

```javascript
// ✅ CORRECT: MAX importance
await Notifications.setNotificationChannelAsync('aloochat_messages', {
  importance: Notifications.AndroidImportance.MAX,
  sound: 'default',
  vibrationPattern: [0, 250, 250, 250],
});
```

### 3. Not Handling Data-Only Messages
```javascript
// ❌ WRONG: Assuming notification field exists
const title = remoteMessage.notification.title; // undefined!
```

```javascript
// ✅ CORRECT: Parse data field
const data = remoteMessage.data;
const payload = JSON.parse(data.notification);
const title = payload.push_message_title;
```

### 4. Missing Firebase Foreground Listener
```javascript
// ❌ WRONG: No foreground handler
// Messages arrive but nothing happens
```

```javascript
// ✅ CORRECT: Handle foreground messages
messaging().onMessage(async (remoteMessage) => {
  const { title, body, data } = parsePayload(remoteMessage);
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
});
```

### 5. Testing in Expo Go
```javascript
// ❌ WRONG: Expecting FCM to work in Expo Go
// Firebase native modules not available
```

```javascript
// ✅ CORRECT: Build with EAS
npx eas-cli build -p android --profile preview
```

---

## 📝 Testing Checklist

### Before Testing
- [ ] Build app with EAS (not Expo Go)
- [ ] Install APK on physical device
- [ ] Enable notifications in Settings
- [ ] Verify FCM token registered with backend
- [ ] Check backend logs for push send attempts

### Test Scenarios
- [ ] **Foreground**: App open → Send message → See notification banner
- [ ] **Background**: App minimized → Send message → See notification banner
- [ ] **Killed**: App closed → Send message → See notification banner
- [ ] **Tap**: Tap notification → App opens to conversation
- [ ] **Sound**: Notification plays sound
- [ ] **Vibration**: Notification vibrates
- [ ] **Badge**: App icon shows badge count

### Debug Logs to Check
```javascript
// Look for these in device logs (adb logcat | grep Expo)
[ExpoBackgroundHandler] ====== PARSING FCM MESSAGE ======
[ExpoBackgroundHandler] Raw message: {...}
[ExpoBackgroundHandler] Final notification: {...}
[Navigation] 🔔 FCM foreground message received
[ExpoNotification] ✅ Notification displayed!
```

---

## 🎯 Summary

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Silent notifications | Chatwoot sends mixed FCM payload | Build with EAS (not Expo Go) |
| No foreground display | Firebase native modules missing | EAS build includes Firebase |
| No background display | `setBackgroundMessageHandler` not firing | EAS build enables handler |
| Data parsing fails | Complex nested JSON structure | Already implemented in `parsePayload()` |

**Bottom Line:** Your code is correct. The issue is **Expo Go limitation**. Build with EAS and notifications will work perfectly.
