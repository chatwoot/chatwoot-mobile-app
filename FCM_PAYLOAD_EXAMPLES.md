# FCM Payload Examples - What Works vs What Doesn't

## 🔴 Current Chatwoot Payload (Causes Silent Notifications)

### What Chatwoot Sends
```json
{
  "notification": {
    "title": "Assigned Conversation New Message",
    "body": "A new conversation [ID -123] has been assigned to you."
  },
  "data": {
    "notification": "{\"id\":123,\"notification_type\":\"assigned_conversation_new_message\",\"primary_actor\":{\"id\":456,\"conversation_id\":789,\"meta\":{\"sender\":{\"name\":\"John Doe\"},\"last_message\":{\"content\":\"Hello, I need help\"}}}}"
  }
}
```

### Why It Fails in Expo Go
1. **Expo Go**: Firebase native modules unavailable
2. **Result**: `notification` field ignored, only `data` arrives
3. **Impact**: No auto-display, app must manually show notification
4. **Problem**: `messaging().onMessage()` never fires in Expo Go

---

## ✅ Ideal FCM Payload (For Production)

### What Should Be Sent
```json
{
  "notification": {
    "title": "John Doe",
    "body": "Hello, I need help",
    "sound": "default",
    "badge": "1",
    "click_action": "FLUTTER_NOTIFICATION_CLICK",
    "android_channel_id": "aloochat_messages"
  },
  "data": {
    "notification_type": "assigned_conversation_new_message",
    "conversation_id": "789",
    "push_message_title": "John Doe",
    "push_message_body": "Hello, I need help",
    "notification": "{\"id\":123,\"notification_type\":\"assigned_conversation_new_message\",\"primary_actor\":{\"id\":456,\"conversation_id\":789,\"meta\":{\"sender\":{\"name\":\"John Doe\"},\"last_message\":{\"content\":\"Hello, I need help\"}}}}"
  },
  "priority": "high",
  "content_available": true,
  "mutable_content": true
}
```

### Why This Works
1. ✅ **Better UX**: Shows sender name + actual message
2. ✅ **Auto-display**: System shows notification when app is killed
3. ✅ **Foreground**: `onMessage()` can display it manually
4. ✅ **Navigation**: `data` contains conversation_id for deep linking
5. ✅ **Sound/Badge**: Proper notification behavior

---

## 🧪 Test Payload (Send via Firebase Console)

### For Testing in EAS Build

```json
{
  "to": "YOUR_FCM_TOKEN_HERE",
  "notification": {
    "title": "Test Notification",
    "body": "This is a test message",
    "sound": "default"
  },
  "data": {
    "notification_type": "assigned_conversation_new_message",
    "conversation_id": "123",
    "test": "true"
  },
  "priority": "high",
  "android": {
    "notification": {
      "channel_id": "aloochat_messages",
      "sound": "default",
      "priority": "high"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "alert": {
          "title": "Test Notification",
          "body": "This is a test message"
        },
        "sound": "default",
        "badge": 1
      }
    }
  }
}
```

### Send via cURL
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test message",
      "sound": "default"
    },
    "data": {
      "conversation_id": "123",
      "notification_type": "test"
    },
    "priority": "high"
  }'
```

---

## 📊 Payload Comparison Table

| Field | Current Chatwoot | Recommended | Impact |
|-------|-----------------|-------------|--------|
| `notification.title` | "Assigned Conversation New Message" | "John Doe" | Better UX |
| `notification.body` | "A new conversation..." | "Hello, I need help" | Actual message |
| `notification.sound` | ❌ Missing | "default" | No sound |
| `notification.android_channel_id` | ❌ Missing | "aloochat_messages" | Wrong channel |
| `data.notification_type` | ❌ Nested in JSON | "assigned_conversation_new_message" | Hard to parse |
| `data.conversation_id` | ❌ Nested in JSON | "789" | Hard to parse |
| `priority` | ❌ Missing | "high" | May be delayed |
| `content_available` | ❌ Missing | true | Background wake |

---

## 🔧 Backend Fix for Chatwoot

### File: `app/services/notification/push_notification_service.rb`

```ruby
def send_fcm_push(subscription)
  return unless subscription.fcm?
  
  fcm = FCM.new(ENV['FCM_SERVER_KEY'])
  
  # Extract notification details
  notification_data = notification.push_event_data
  sender_name = notification_data.dig('primary_actor', 'meta', 'sender', 'name') || 'Someone'
  message_content = notification_data.dig('primary_actor', 'meta', 'last_message', 'content') || notification.push_message_title
  conversation_id = notification_data.dig('primary_actor', 'conversation_id')&.to_s || notification_data.dig('primary_actor', 'id')&.to_s
  
  # Build FCM payload
  options = {
    "notification": {
      "title": sender_name,
      "body": message_content,
      "sound": "default",
      "badge": "1",
      "android_channel_id": "aloochat_messages"
    },
    "data": {
      "notification_type": notification.notification_type,
      "conversation_id": conversation_id,
      "push_message_title": sender_name,
      "push_message_body": message_content,
      "notification": notification_data.to_json
    },
    "priority": "high",
    "content_available": true,
    "mutable_content": true
  }
  
  response = fcm.send([subscription.subscription_attributes['push_token']], options)
  subscription.destroy! if JSON.parse(response[:body])['results']&.first&.keys&.include?('error')
end
```

### Alternative: Use FCM HTTP v1 API (Recommended)

```ruby
def send_fcm_push_v1(subscription)
  return unless subscription.fcm?
  
  require 'googleauth'
  require 'net/http'
  require 'json'
  
  # Get OAuth2 token
  scopes = ['https://www.googleapis.com/auth/firebase.messaging']
  authorizer = Google::Auth::ServiceAccountCredentials.make_creds(
    json_key_io: File.open(ENV['GOOGLE_APPLICATION_CREDENTIALS']),
    scope: scopes
  )
  access_token = authorizer.fetch_access_token!['access_token']
  
  # Extract notification details
  notification_data = notification.push_event_data
  sender_name = notification_data.dig('primary_actor', 'meta', 'sender', 'name') || 'Someone'
  message_content = notification_data.dig('primary_actor', 'meta', 'last_message', 'content') || notification.push_message_title
  conversation_id = notification_data.dig('primary_actor', 'conversation_id')&.to_s || notification_data.dig('primary_actor', 'id')&.to_s
  
  # Build FCM v1 payload
  message = {
    message: {
      token: subscription.subscription_attributes['push_token'],
      notification: {
        title: sender_name,
        body: message_content
      },
      data: {
        notification_type: notification.notification_type,
        conversation_id: conversation_id,
        push_message_title: sender_name,
        push_message_body: message_content,
        notification: notification_data.to_json
      },
      android: {
        priority: 'high',
        notification: {
          channel_id: 'aloochat_messages',
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: sender_name,
              body: message_content
            },
            sound: 'default',
            badge: 1,
            'content-available': 1
          }
        }
      }
    }
  }
  
  # Send request
  uri = URI("https://fcm.googleapis.com/v1/projects/#{ENV['FCM_PROJECT_ID']}/messages:send")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  
  request = Net::HTTP::Post.new(uri.path)
  request['Authorization'] = "Bearer #{access_token}"
  request['Content-Type'] = 'application/json'
  request.body = message.to_json
  
  response = http.request(request)
  
  # Handle errors
  if response.code.to_i >= 400
    error_body = JSON.parse(response.body)
    Rails.logger.error("FCM send failed: #{error_body}")
    subscription.destroy! if error_body.dig('error', 'status') == 'NOT_FOUND'
  end
end
```

---

## 🎯 Key Takeaways

1. **Notification Field**: Must be present for auto-display when app is killed
2. **Data Field**: Must contain flat structure for easy parsing
3. **Priority**: Must be "high" for immediate delivery
4. **Sound**: Must be "default" or custom sound name
5. **Channel ID**: Must match Android channel created in app
6. **Content Available**: Must be true for background wake on iOS

**Without these fields, notifications will be silent or delayed.**
