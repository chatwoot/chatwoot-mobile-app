import React from 'react';
import { Animated } from 'react-native';
import i18n from '@/i18n';

import { tailwind } from '@/theme';
import { Message } from '@/types';
import { MessageContentAttributes } from '@/types';

type EmailMetaProps = {
  contentAttributes: MessageContentAttributes;
  sender: Message['sender'];
};

export const EmailMeta = (props: EmailMetaProps) => {
  const { contentAttributes, sender } = props;

  const fromEmail = contentAttributes?.email?.from ?? [];

  const toEmail = contentAttributes?.email?.to ?? [];

  const ccEmail = contentAttributes?.ccEmails ?? contentAttributes?.email?.cc ?? [];

  const bccEmail = contentAttributes?.bccEmails ?? contentAttributes?.email?.bcc ?? [];

  const senderName = sender?.name ?? '';

  const subject = contentAttributes?.email?.subject ?? '';

  const showMeta = fromEmail[0] || toEmail.length || ccEmail.length || bccEmail.length || subject;

  if (!showMeta) {
    return null;
  }

  return (
    <Animated.View style={tailwind.style('flex flex-col gap-1')}>
      {fromEmail[0] && (
        <Animated.Text
          style={tailwind.style('text-md text-gray-950 font-inter-normal-20 tracking-[0.16px]')}
        >
          {senderName} &lt;{fromEmail[0]}&gt;
        </Animated.Text>
      )}

      {toEmail.length > 0 && (
        <Animated.Text
          style={tailwind.style('text-md text-gray-900 font-inter-normal-20 tracking-[0.32px]')}
        >
          {i18n.t('CONVERSATION.EMAIL_HEADER.TO')}: {toEmail.join(', ')}
        </Animated.Text>
      )}

      {ccEmail.length > 0 && (
        <Animated.Text
          style={tailwind.style(' text-md text-gray-900 font-inter-normal-20 tracking-[0.32px]')}
        >
          {i18n.t('CONVERSATION.EMAIL_HEADER.CC')}: {ccEmail.join(', ')}
        </Animated.Text>
      )}

      {bccEmail.length > 0 && (
        <Animated.Text
          style={tailwind.style(' text-md text-gray-900 font-inter-normal-20 tracking-[0.32px]')}
        >
          {i18n.t('CONVERSATION.EMAIL_HEADER.BCC')}: {bccEmail}
        </Animated.Text>
      )}

      {subject && (
        <Animated.Text
          style={tailwind.style('text-md text-gray-950 font-inter-normal-20 tracking-[0.32px]')}
        >
          {i18n.t('CONVERSATION.EMAIL_HEADER.SUBJECT')}: {subject}
        </Animated.Text>
      )}
      <Animated.View style={tailwind.style('h-[1px] my-2 bg-gray-300')} />
    </Animated.View>
  );
};
