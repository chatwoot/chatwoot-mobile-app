import { Linking } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { navigationRef } from './navigationUtils';
import { findConversationLinkFromPush } from './pushUtils';
import { transformNotification } from './camelCaseKeys';
import { findNotificationFromFCM } from './pushUtils';
import { Notification } from '@/types/Notification';

interface ConversationParams {
  conversationId: number;
  primaryActorId?: number;
  primaryActorType?: string;
}

const CONVERSATION_ID_REGEX = /conversations\/(\d+)/;
const PRIMARY_ACTOR_ID_REGEX = /conversations\/\d+\/(\d+)\//;
const PRIMARY_ACTOR_TYPE_REGEX = /\/(\w+)$/;

export function extractParamsFromLink(link: string): ConversationParams | null {
  const conversationIdMatch = link.match(CONVERSATION_ID_REGEX);
  if (!conversationIdMatch) {
    return null;
  }

  const conversationId = parseInt(conversationIdMatch[1], 10);
  const primaryActorIdMatch = link.match(PRIMARY_ACTOR_ID_REGEX);
  const primaryActorTypeMatch = link.match(PRIMARY_ACTOR_TYPE_REGEX);

  return {
    conversationId,
    primaryActorId: primaryActorIdMatch ? parseInt(primaryActorIdMatch[1], 10) : undefined,
    primaryActorType: primaryActorTypeMatch ? primaryActorTypeMatch[1] : undefined,
  };
}

export function extractParamsFromNotification(
  notificationData: Record<string, string>,
  installationUrl: string,
): ConversationParams | null {
  const message = { data: notificationData };
  const notification = findNotificationFromFCM({ message });
  if (!notification) {
    return null;
  }

  const transformedNotification = transformNotification(notification);
  const conversationLink = findConversationLinkFromPush({
    notification: transformedNotification,
    installationUrl,
  });

  if (!conversationLink) {
    return null;
  }

  return extractParamsFromLink(conversationLink);
}

export async function navigateToConversation(
  params: ConversationParams,
  fallbackLink?: string,
): Promise<void> {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.dispatch(
      StackActions.push('ChatScreen', {
        conversationId: params.conversationId,
        primaryActorId: params.primaryActorId,
        primaryActorType: params.primaryActorType,
      }),
    );
    return;
  }

  if (fallbackLink) {
    const canOpen = await Linking.canOpenURL(fallbackLink);
    if (canOpen) {
      await Linking.openURL(fallbackLink);
    }
  }
}
