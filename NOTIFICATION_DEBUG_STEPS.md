# Critical Notification Debugging Steps

## Step 1: Check if FCM Token is Registered with Chatwoot

1. Open the app on your Android phone
2. Go to Settings → About or Debug section
3. Copy the FCM token shown
4. Go to Chatwoot backend → Rails console:

```ruby
# Check if token exists
PushNotificationSubscription.where("subscription_attributes->>'push_token' = 'YOUR_TOKEN_HERE'")

# Check all subscriptions for your user
user = User.find_by(email: 'your_email@example.com')
user.notification_subscriptions
```

## Step 2: Check if Chatwoot is Sending Notifications

In Chatwoot Rails console:

```ruby
# Enable FCM logging
Rails.logger.level = :debug

# Send test notification
user = User.find_by(email: 'your_email@example.com')
subscription = user.notification_subscriptions.where(subscription_type: 'fcm').first

# Check subscription details
subscription.subscription_attributes
# Should show: {"push_token"=>"...", "device_id"=>"...", ...}

# Manually trigger a notification
notification = user.notifications.last
Notification::PushNotificationService.new(notification: notification).perform
```

## Step 3: Check FCM Server Key Configuration

In Chatwoot `.env` file:

```bash
# Must be set
FCM_SERVER_KEY=your_fcm_server_key_here
```

Verify it's the correct key from Firebase Console → Project Settings → Cloud Messaging → Server Key

## Step 4: Test FCM Directly (Bypass Chatwoot)

Use this curl command to send a test notification directly to your device:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Direct Test",
      "body": "This is a direct FCM test",
      "sound": "default"
    },
    "data": {
      "test": "true"
    },
    "priority": "high"
  }'
```

**Expected Result:** You should see a notification on your phone immediately.

**If this works:** Problem is in Chatwoot backend configuration
**If this doesn't work:** Problem is in FCM token or Firebase project setup

## Step 5: Check Android Logs on Device

Connect your phone via USB and run:

```bash
adb logcat | grep -E "ExpoBackgroundHandler|FCM|Firebase|Notification"
```

Look for these logs:
- `[ExpoBackgroundHandler] ✅ Firebase background handler registered`
- `[ExpoBackgroundHandler] 🔔 Firebase background message received`
- `[ExpoBackgroundHandler] ✅ Background notification displayed`

## Step 6: Verify google-services.json

Check that `google-services.json` has the correct:
- `project_id`
- `client_id`
- `api_key`

Must match your Firebase project.

## Common Issues

### Issue 1: FCM Server Key Not Set
**Symptom:** Chatwoot doesn't send any notifications
**Fix:** Set `FCM_SERVER_KEY` in Chatwoot `.env`

### Issue 2: Wrong google-services.json
**Symptom:** Token registers but notifications never arrive
**Fix:** Download correct `google-services.json` from Firebase Console

### Issue 3: Notification Permissions Denied
**Symptom:** Token exists but notifications blocked
**Fix:** Android Settings → Apps → AlooChat → Notifications → Enable

### Issue 4: Background Restrictions
**Symptom:** Notifications only work when app is open
**Fix:** Android Settings → Apps → AlooChat → Battery → Unrestricted

### Issue 5: Chatwoot Not Sending to FCM
**Symptom:** Token registered but Chatwoot logs show no FCM send attempts
**Fix:** Check Chatwoot notification settings for your user account
