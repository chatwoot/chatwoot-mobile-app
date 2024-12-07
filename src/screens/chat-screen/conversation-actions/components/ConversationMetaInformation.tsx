import React from 'react';
import Animated from 'react-native-reanimated';

import { AttributeListType } from '@/types';
import { Conversation } from '@/types/Conversation';
import { ConversationAttributes } from './ConversationAttributes';
import i18n from '@/i18n';

export const ConversationMetaInformation = ({ conversation }: { conversation: Conversation }) => {
  const additionalAttributes = conversation.additionalAttributes;
  const initiatedAt = additionalAttributes.initiatedAt?.timestamp;
  const referer = additionalAttributes.referer;
  const browser = additionalAttributes.browser;
  const sender = conversation.meta.sender;

  const browserName = `${browser?.browserName} ${browser?.browserVersion}`;
  const platformName = `${browser?.platformName} ${browser?.platformVersion}`;

  const { additionalAttributes: { createdAtIp = '' } = {} } = sender;

  const otherConversationDetails: AttributeListType[] = [
    {
      title: i18n.t('CONVERSATION_DETAILS.INITIATED_AT'),
      subtitleType: 'light',
      subtitle: initiatedAt,
      type: 'date',
    },
    {
      title: i18n.t('CONVERSATION_DETAILS.INITIATED_FROM'),
      subtitleType: 'light',
      subtitle: referer,
      type: 'link',
    },
    {
      title: i18n.t('CONVERSATION_DETAILS.BROWSER'),
      subtitleType: 'light',
      subtitle: browserName,
      type: 'text',
    },
    {
      title: i18n.t('CONVERSATION_DETAILS.OPERATING_SYSTEM'),
      subtitleType: 'light',
      subtitle: platformName,
      type: 'text',
    },
    {
      title: i18n.t('CONVERSATION_DETAILS.IP_ADDRESS'),
      subtitleType: 'light',
      subtitle: createdAtIp,
      type: 'text',
    },
  ];

  return (
    <Animated.View>
      <ConversationAttributes
        sectionTitle={i18n.t('CONVERSATION_DETAILS.TITLE')}
        list={otherConversationDetails as AttributeListType[]}
      />
    </Animated.View>
  );
};
