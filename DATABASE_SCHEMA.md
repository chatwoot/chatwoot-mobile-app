# AlooChat Database Schema

This document describes the data models used in the AlooChat mobile application. The app connects to a AlooChat backend API and uses Redux for local state management.

## Core Entities

### User
Represents an authenticated user/agent in the system.

```typescript
{
  id: number
  name: string
  account_id: number
  accounts: Account[]
  email: string
  pubsub_token: string
  avatar_url: string
  available_name: string
  role: 'administrator' | 'agent'
  identifier_hash: string
  availability: string
  thumbnail: string
  availability_status: AvailabilityStatus
  type: string
}
```

### Contact
Represents a customer/contact in conversations.

```typescript
{
  id: number
  name: string | null
  email: string | null
  phoneNumber: string | null
  thumbnail: string | null
  identifier: string | null
  type: string
  createdAt: UnixTimestamp
  lastActivityAt: UnixTimestamp | null
  availabilityStatus: AvailabilityStatus
  customAttributes: Record<string, string>
  additionalAttributes: {
    location?: string
    companyName?: string
    city?: string
    country?: string
    description?: string
    createdAtIp?: string
    socialProfiles?: Record<string, string>
    twitterScreenName?: string
    telegramUsername?: string
  }
}
```

### Conversation
Represents a chat conversation between contacts and agents.

```typescript
{
  id: number
  uuid: string
  accountId: number
  inboxId: number
  status: 'open' | 'resolved' | 'pending' | 'snoozed'
  priority: 'urgent' | 'high' | 'medium' | 'low' | null
  canReply: boolean
  muted: boolean
  unreadCount: number
  labels: string[]
  createdAt: UnixTimestamp
  lastActivityAt: UnixTimestamp
  timestamp: UnixTimestamp (deprecated)
  waitingSince: UnixTimestamp
  agentLastSeenAt: UnixTimestamp
  assigneeLastSeenAt: UnixTimestamp
  contactLastSeenAt: UnixTimestamp
  firstReplyCreatedAt: UnixTimestamp
  snoozedUntil: UnixTimestamp | null
  slaPolicyId: number | null
  appliedSla: SLA | null
  slaEvents: SLAEvent[]
  customAttributes: Record<string, string>
  additionalAttributes: {
    browser?: {
      deviceName: string
      browserName: string
      platformName: string
      browserVersion: string
      platformVersion: string
    }
    referer?: string
    initiatedAt?: { timestamp: string }
    browserLanguage?: string
    type?: string
  }
  messages: Message[]
  lastNonActivityMessage: Message | null
  meta: {
    sender: Contact
    assignee: Agent
    team: Team | null
    hmacVerified: boolean | null
    channel: Channel
  }
  channel?: Channel
}
```

### Message
Represents individual messages within conversations.

```typescript
{
  id: number
  conversationId: number
  inboxId: number
  senderId: number
  senderType: string
  content: string
  contentType: 'text' | 'input_text' | 'input_textarea' | 'input_email' | 
                'input_select' | 'cards' | 'form' | 'article' | 
                'incoming_email' | 'input_csat' | 'integrations'
  messageType: 0 | 1 | 2 | 3  // incoming | outgoing | activity | template
  status: 'sent' | 'delivered' | 'read' | 'failed'
  private: boolean
  createdAt: UnixTimestamp
  echoId: number | string | null
  sourceId: string | null
  sender?: Agent | User | AgentBot | Contact | null
  attachments: ImageMetadata[]
  contentAttributes?: {
    inReplyTo: number
    inReplyToExternalId: null
    deleted?: boolean
    email?: {
      subject: string
      from?: string[]
      to?: string[]
      cc?: string[]
      bcc?: string[]
      htmlContent?: { full: string }
      textContent?: { full: string }
    }
    ccEmails?: string[]
    bccEmails?: string[]
    externalError: string
    imageType: string
    contentType: ContentType
    isUnsupported: boolean
  }
  lastNonActivityMessage: Message | null
  conversation?: Conversation | null
  shouldRenderAvatar?: boolean
  groupWithNext?: boolean
  groupWithPrevious?: boolean
}
```

### ImageMetadata (Attachment)
Represents file attachments in messages.

```typescript
{
  id: number
  messageId: number
  fileType: 'image' | 'video' | 'audio' | 'file' | 'ig_reel'
  accountId: number
  extension: string | null
  dataUrl: string
  thumbUrl: string
  fallbackTitle: string
  coordinatesLat: number
  coordinatesLong: number
}
```

### Agent
Represents support agents/team members.

```typescript
{
  id: number
  name: string
  email: string
  thumbnail: string
  availabilityStatus: AvailabilityStatus
  role: UserRole
  confirmed: boolean
  accountId: number
  customAttributes: Record<string, string>
}
```

### Inbox
Represents communication channels (email, chat, social media, etc.).

```typescript
{
  id: number
  name: string
  channelType: string
  channelId: number
  avatarUrl: string
  phoneNumber: string
  enableAutoAssignment: boolean
}
```

### Team
Represents agent teams.

```typescript
{
  id: number
  name: string
  description: string
  allowAutoAssign: boolean
  accountId: number
}
```

### Account
Represents organization/workspace accounts.

```typescript
{
  id: number
  name: string
  locale: string
  domain: string
  supportEmail: string
  features: Record<string, boolean>
  customAttributes: Record<string, string>
}
```

## Supporting Types

### Channel
```typescript
{
  id: number
  type: string
  name: string
  phoneNumber?: string
  reauthorizationRequired?: boolean
}
```

### Label
```typescript
{
  id: number
  title: string
  description: string
  color: string
  showOnSidebar: boolean
}
```

### CannedResponse
```typescript
{
  id: number
  content: string
  shortCode: string
  accountId: number
}
```

### Notification
```typescript
{
  id: number
  accountId: number
  userId: number
  notificationType: string
  primaryActorType: string
  primaryActorId: number
  primaryActor: Agent | Contact
  readAt: UnixTimestamp | null
  createdAt: UnixTimestamp
  lastActivityAt: UnixTimestamp
  pushMessageTitle: string
  meta: Record<string, any>
}
```

### CustomAttribute
```typescript
{
  id: number
  attributeDisplayName: string
  attributeDisplayType: number
  attributeDescription: string
  attributeKey: string
  attributeModel: number
  defaultValue: any
  attributeValues: string[]
  regexPattern: string
  regexCue: string
}
```

### SLA (Service Level Agreement)
```typescript
{
  id: number
  name: string
  description: string
  firstResponseTime: number
  nextResponseTime: number
  resolutionTime: number
  onlyDuringBusinessHours: boolean
}
```

## Enums & Constants

### ConversationStatus
- `open`
- `resolved`
- `pending`
- `snoozed`

### ConversationPriority
- `urgent`
- `high`
- `medium`
- `low`
- `null`

### MessageType
- `0` - incoming
- `1` - outgoing
- `2` - activity
- `3` - template

### AvailabilityStatus
- `online`
- `offline`
- `busy`

### UserRole
- `administrator`
- `agent`

## Data Flow

1. **Authentication**: User logs in → receives auth token → stored in Redux
2. **Conversations**: Fetched from API → stored in Redux → displayed in list
3. **Messages**: Real-time updates via WebSocket (ActionCable) → Redux → UI
4. **Contacts**: Loaded on-demand → cached in Redux
5. **Local Storage**: Redux Persist saves state to AsyncStorage

## API Integration

The app communicates with a AlooChat backend API:
- Base URL: Configured in `.env` as `EXPO_PUBLIC_AlooChat_BASE_URL`
- WebSocket: ActionCable for real-time message updates
- REST API: For CRUD operations on conversations, contacts, etc.

## State Management

- **Redux Toolkit**: Primary state management
- **Redux Persist**: Persists state to AsyncStorage
- **Slices**: Organized by entity (conversations, contacts, messages, etc.)

## Notes

- All timestamps are Unix timestamps (seconds since epoch)
- The app is a mobile client; the actual database is on the AlooChat backend server
- Local state is temporary and synced with the backend API
