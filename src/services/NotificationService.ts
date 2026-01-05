import { transformNotification } from '@/utils/camelCaseKeys';
import { findNotificationFromFCM, formatNotificationWithSender } from '@/utils/pushUtils';
import notifee from '@notifee/react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'default';
const NOTIFICATION_ICON = 'ic_notification';

interface NotificationData {
  conversationId?: string;
  messageId?: string;
  eventType?: string;
  senderName?: string;
  senderId?: string;
}

export class NotificationService {
  static async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    if (Platform.OS !== 'android' || !remoteMessage.data) {
      return;
    }

    // DEBUG: Verificar se backend ainda envia 'notification'
    console.log('=== NOTIFICATION DEBUG ===');
    console.log('Has notification field:', !!remoteMessage.notification);
    console.log('Data:', JSON.stringify(remoteMessage.data, null, 2));
    if (remoteMessage.notification) {
      console.log('⚠️ BACKEND AINDA ENVIA notification:', remoteMessage.notification);
    }

    const notification = findNotificationFromFCM({ message: remoteMessage });
    if (!notification) {
      console.log('❌ No notification found');
      return;
    }

    const transformedNotification = transformNotification(notification);
    const { title, body } = formatNotificationWithSender({
      notification,
      transformedNotification,
      remoteMessageData: remoteMessage.data,
      remoteMessageNotification: remoteMessage.notification,
    });

    console.log('📱 Will display:', { title, body });

    const notificationId = String(
      remoteMessage.data.message_id || remoteMessage.data.conversation_id || Date.now(),
    );

    // Exibir a notificação com notifee
    await notifee.displayNotification({
      id: notificationId,
      title: title || 'Nova mensagem',
      body: body || 'Você tem uma nova mensagem',
      android: {
        channelId: ANDROID_CHANNEL_ID,
        smallIcon: NOTIFICATION_ICON,
        pressAction: {
          id: 'default',
        },
        importance: 4,
        autoCancel: true,
        showTimestamp: true,
      },
      data: remoteMessage.data,
    });

    console.log('✅ Notification displayed');
  }

  static extractNotificationData(
    data: Record<string, string> | undefined,
  ): NotificationData | null {
    if (!data) {
      return null;
    }

    return {
      conversationId: data.conversation_id,
      messageId: data.message_id,
      eventType: data.event_type,
      senderName: data.sender_name,
      senderId: data.sender_id,
    };
  }
}
