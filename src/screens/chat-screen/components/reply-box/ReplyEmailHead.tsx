import React, { useState } from 'react';
import { Animated, TextInput, Text } from 'react-native';

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
  return (
    <Animated.View style={tailwind.style('flex flex-col gap-1')}>
      <Animated.View style={tailwind.style('flex flex-col gap-1')}>
        <Animated.View style={tailwind.style('flex flex-row items-center gap-1')}>
          <Text
            style={tailwind.style('text-md text-gray-950 font-inter-normal-20 tracking-[0.16px]')}>
            {'To'}
          </Text>
          <TextInput
            style={tailwind.style('flex-1 border border-gray-300 rounded-md p-2')}
            value={toEmails}
            onChangeText={props.onUpdateCC}
            placeholder="Emails separated by commas"
            placeholderTextColor={tailwind.color('text-gray-300')}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center gap-1')}>
        <Text
          style={tailwind.style('text-md text-gray-950 font-inter-normal-20 tracking-[0.16px]')}>
          {'Cc'}
        </Text>
        <TextInput
          style={tailwind.style('flex-1 border border-gray-300 rounded-md p-2')}
          value={ccEmails}
          onChangeText={props.onUpdateCC}
          placeholder="Emails separated by commas"
          placeholderTextColor={tailwind.color('text-gray-300')}
        />
      </Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center gap-1')}>
        <Text
          style={tailwind.style('text-md text-gray-950 font-inter-normal-20 tracking-[0.16px]')}>
          {'Bcc'}
        </Text>
        <TextInput
          style={tailwind.style('flex-1 border border-gray-300 rounded-md p-2')}
          value={bccEmails}
          onChangeText={props.onUpdateBCC}
          placeholder="Emails separated by commas"
          placeholderTextColor={tailwind.color('text-gray-300')}
        />
      </Animated.View>
    </Animated.View>
  );
};
