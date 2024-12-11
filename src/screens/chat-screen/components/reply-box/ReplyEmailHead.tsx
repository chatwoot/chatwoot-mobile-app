import React, { useState } from 'react';
import { Animated, TextInput, Text, Pressable } from 'react-native';
import i18n from '@/i18n';

import { tailwind } from '@/theme';

type EmailMetaProps = {
  ccEmails: string;
  bccEmails: string;
  toEmails: string;
  onUpdateCC: (ccEmails: string) => void;
  onUpdateBCC: (bccEmails: string) => void;
  onUpdateTo: (toEmails: string) => void;
};

export const ReplyEmailHead = (props: EmailMetaProps) => {
  const { ccEmails, bccEmails, toEmails, onUpdateCC, onUpdateBCC, onUpdateTo } = props;

  const [showBcc, setShowBcc] = useState(false);

  return (
    <Animated.View style={tailwind.style('flex flex-col mb-2')}>
      <Animated.View
        style={tailwind.style('flex flex-col gap-1 px-3 py-1 border-b border-b-blackA-A3')}>
        <Animated.View style={tailwind.style('flex flex-row items-center gap-1 ')}>
          <Text
            style={tailwind.style(
              'text-md text-gray-950 font-inter-normal-20 tracking-[0.16px] min-w-[30px]',
            )}>
            {i18n.t('CONVERSATION.EMAIL_HEAD.TO')}
          </Text>
          <TextInput
            style={tailwind.style('flex-1 rounded-t-md pl-0 py-2 pr-2')}
            value={toEmails}
            onChangeText={props.onUpdateCC}
            placeholder="Emails separated by commas"
            placeholderTextColor={tailwind.color('text-gray-300')}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex flex-row items-center gap-1 py-1 px-3 border-b border-b-blackA-A3',
        )}>
        <Text
          style={tailwind.style(
            'text-md text-gray-950 font-inter-normal-20 tracking-[0.16px] min-w-[30px]',
          )}>
          {i18n.t('CONVERSATION.EMAIL_HEAD.CC')}
        </Text>
        <TextInput
          style={tailwind.style('flex-1 rounded-t-md pl-0 py-2 pr-2')}
          value={ccEmails}
          onChangeText={props.onUpdateCC}
          placeholder="Emails separated by commas"
          placeholderTextColor={tailwind.color('text-gray-300')}
        />
        <Pressable style={tailwind.style('')} onPress={() => setShowBcc(!showBcc)}>
          <Animated.Text style={tailwind.style('text-blue-800')}>
            {i18n.t('CONVERSATION.EMAIL_HEAD.BCC')}
          </Animated.Text>
        </Pressable>
      </Animated.View>
      {showBcc && (
        <Animated.View
          style={tailwind.style(
            'flex flex-row items-center gap-1 px-3 border-b py-1 border-b-blackA-A3',
          )}>
          <Text
            style={tailwind.style(
              'text-md text-gray-950 font-inter-normal-20 tracking-[0.16px] min-w-[30px]',
            )}>
            {i18n.t('CONVERSATION.EMAIL_HEAD.BCC')}
          </Text>
          <TextInput
            style={tailwind.style('flex-1 rounded-t-md pl-0 py-2 pr-2')}
            value={bccEmails}
            onChangeText={props.onUpdateBCC}
            placeholder="Emails separated by commas"
            placeholderTextColor={tailwind.color('text-gray-300')}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};
