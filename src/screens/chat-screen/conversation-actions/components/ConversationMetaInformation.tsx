import React from 'react';
import Animated from 'react-native-reanimated';

import { AttributeListType, CustomAttribute } from '@/types';
import { Conversation } from '@/types/Conversation';
import i18n from '@/i18n';
import { camelCase } from 'lodash';
import { useAppSelector } from '@/hooks';
import { getConversationCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { AttributeList } from '@/components-next';

const processContactAttributes = (
  attributes: CustomAttribute[],
  customAttributes: Record<string, string>,
  filterCondition: (key: string, custom: Record<string, string>) => boolean,
) => {
  if (!attributes.length || !customAttributes) {
    return [];
  }

  return attributes.reduce<(CustomAttribute & { value: string })[]>((result, attribute) => {
    const { attributeKey } = attribute;
    const meetsCondition = filterCondition(camelCase(attributeKey), customAttributes);

    if (meetsCondition) {
      result.push({
        ...attribute,
        value: customAttributes[camelCase(attributeKey)] ?? '',
      });
    }

    return result;
  }, []);
};

export const ConversationMetaInformation = ({ conversation }: { conversation: Conversation }) => {
  const additionalAttributes = conversation.additionalAttributes;
  const initiatedAt = additionalAttributes.initiatedAt?.timestamp;
  const referer = additionalAttributes.referer;
  const browser = additionalAttributes.browser;
  const sender = conversation.meta.sender;

  const browserName = `${browser?.browserName} ${browser?.browserVersion}`;
  const platformName = `${browser?.platformName} ${browser?.platformVersion}`;

  const conversationCustomAttributes = useAppSelector(getConversationCustomAttributes);
  const { additionalAttributes: { createdAtIp = '' } = {} } = sender;

  const usedConversationCustomAttributes = processContactAttributes(
    conversationCustomAttributes,
    conversation?.customAttributes || {},
    (key, custom) => key in custom,
  );

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

  const processedAttributes = usedConversationCustomAttributes.map(attribute => ({
    title: attribute.attributeDisplayName,
    subtitle: attribute.value,
    subtitleType: 'dark',
    type: attribute.attributeDisplayType,
  }));

  const allAttributes = [...otherConversationDetails, ...processedAttributes];

  return (
    <Animated.View>
      <AttributeList
        sectionTitle={i18n.t('CONVERSATION_DETAILS.TITLE')}
        list={allAttributes as AttributeListType[]}
      />
    </Animated.View>
  );
};
