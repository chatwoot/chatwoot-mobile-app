import { Platform } from 'react-native';
// Deprecated Notifee helpers are removed. This module left intentionally empty for now.
import { Notification } from '@/types/Notification';

export const displayRichNotification = async (notification: {
  title: string;
  body: string;
  data?: any;
  imageUrl?: string;
}) => {
  if (Platform.OS === 'ios') {
    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data,
      ios: {
        sound: 'default',
        badge: 1,
        attachments: notification.imageUrl ? [
          {
            url: notification.imageUrl,
            thumbnailHidden: false,
          },
        ] : undefined,
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  } else {
    // Android
    const channelId = await notifee.createChannel({
      id: 'chatwoot-messages',
      name: 'Chat Messages',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        largeIcon: notification.imageUrl,
        style: notification.imageUrl ? {
          type: notifee.AndroidStyle.BIGPICTURE,
          picture: notification.imageUrl,
        } : undefined,
      },
    });
  }
};
