import React from 'react';

import { tailwind } from '@/theme';
import { Icon } from '@/components-next';
import Animated from 'react-native-reanimated';
import {
  NotificationSnoozedIcon,
  NotificationMentionIcon,
  NotificationNewMessageIcon,
  NotificationAssignedIcon,
} from '@/svg-icons';
import { NotificationType } from '@/types/Notification';

type NotificationTypeProps = {
  type: NotificationType;
};

export const getNotificationTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'conversation_assignment':
      return <NotificationAssignedIcon />;
    case 'conversation_mention':
      return <NotificationMentionIcon />;
    case 'assigned_conversation_new_message':
      return <NotificationNewMessageIcon />;
    case 'participating_conversation_new_message':
      return <NotificationNewMessageIcon />;
    case 'conversation_creation':
      return <NotificationNewMessageIcon />;
    case 'sla_missed_first_response':
      return <NotificationSnoozedIcon />;
    default:
      return <NotificationNewMessageIcon />;
  }
};

export const NotificationTypeIndicator = (props: NotificationTypeProps) => {
  return (
    <Animated.View style={tailwind.style('h-6 w-6 rounded-full justify-center items-center')}>
      <Icon icon={getNotificationTypeIcon(props.type)} />
    </Animated.View>
  );
};
