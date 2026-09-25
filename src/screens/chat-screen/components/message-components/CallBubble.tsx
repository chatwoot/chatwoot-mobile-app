import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Message } from '@/types';
import i18n from '@/i18n';
import { MESSAGE_VARIANTS } from '@/constants';
import { getVoiceCallDisplay } from '@/utils/voiceCallUtils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectFullScreenCall } from '@/store/call/callSelectors';
import { setMinimised } from '@/store/call/callSlice';

import { AudioBubble } from './AudioBubble';
import { CallActionButton } from './call-bubble/CallActionButton';
import { CallGlyph } from './call-bubble/CallGlyph';
import { useCallBubbleActions } from './call-bubble/useCallBubbleActions';

type CallBubbleProps = {
  item: Message;
  variant: string;
};

const TRANSCRIPT_PREVIEW_LINES = 3;

const isLightOnDark = (variant: string) =>
  variant === MESSAGE_VARIANTS.USER || variant === MESSAGE_VARIANTS.ERROR;

export const CallBubble = ({ item, variant }: CallBubbleProps) => {
  const display = useMemo(() => getVoiceCallDisplay(item), [item]);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const dispatch = useAppDispatch();
  const liveCall = useAppSelector(selectFullScreenCall);
  const actions = useCallBubbleActions(item, display);
  const callSid = item.call?.providerCallId;
  // The bubble opens the call screen while this device is on that very call
  const isThisDevicesCall = !!liveCall && !!callSid && liveCall.callSid === callSid;

  const openCallScreen = () => dispatch(setMinimised(false));

  const lightOnDark = isLightOnDark(variant);
  const titleColor = lightOnDark ? 'text-white' : 'text-gray-950';
  const subtextColor = lightOnDark ? 'text-blue-100' : 'text-gray-700';
  const glyphColor = display.isFailed
    ? tailwind.color(lightOnDark ? 'text-ruby-300' : 'text-ruby-800')
    : tailwind.color(lightOnDark ? 'text-white' : 'text-gray-900');
  const glyphBackground = lightOnDark
    ? 'bg-blue-800'
    : display.isFailed
      ? 'bg-ruby-100'
      : 'bg-gray-200';

  const subtextParts = [
    display.subtextKey ? i18n.t(display.subtextKey, display.subtextParams) : null,
    display.status === 'completed' ? display.duration : null,
  ].filter(Boolean);

  const header = (
    <View style={tailwind.style('flex flex-row items-center gap-3')}>
      <View
        style={tailwind.style(
          'h-10 w-10 rounded-full items-center justify-center',
          glyphBackground,
        )}>
        <CallGlyph
          color={glyphColor as string}
          failed={display.isFailed}
          outbound={display.isOutbound}
        />
      </View>
      <View style={tailwind.style('flex-1')}>
        <Text style={tailwind.style('text-md font-inter-medium-24 tracking-[0.32px]', titleColor)}>
          {i18n.t(display.labelKey)}
        </Text>
        {subtextParts.length > 0 ? (
          <Text
            style={tailwind.style(
              'text-sm font-inter-420-20 tracking-[0.32px] pt-0.5',
              subtextColor,
            )}>
            {subtextParts.join(' · ')}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <Animated.View style={tailwind.style('flex flex-col gap-3 min-w-[220px]')}>
      {isThisDevicesCall ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.RETURN_TO_CALL')}
          onPress={openCallScreen}>
          {header}
        </Pressable>
      ) : (
        header
      )}

      {display.recording ? (
        <View style={tailwind.style('flex flex-row items-center')}>
          <AudioBubble
            audioSrc={display.recording.dataUrl}
            contentType={display.recording.contentType}
            extension={display.recording.extension}
            variant={variant}
          />
        </View>
      ) : null}

      {actions.canCallBack ? (
        <CallActionButton
          label={i18n.t('CONVERSATION.VOICE_CALL.CALL_BACK')}
          onPress={actions.callBack}
          disabled={actions.isCallingBack}
          lightOnDark={lightOnDark}
        />
      ) : null}

      {actions.canJoinCall ? (
        <CallActionButton
          label={i18n.t('CONVERSATION.VOICE_CALL.JOIN_CALL')}
          onPress={actions.joinCall}
          disabled={actions.isJoining}
          lightOnDark={lightOnDark}
        />
      ) : null}

      {display.transcript ? (
        <View style={tailwind.style('flex flex-col gap-1')}>
          <Text
            style={tailwind.style(
              'text-xs font-inter-medium-24 uppercase tracking-[0.48px]',
              subtextColor,
            )}>
            {i18n.t('CONVERSATION.VOICE_CALL.TRANSCRIPT')}
          </Text>
          <Text
            numberOfLines={transcriptExpanded ? undefined : TRANSCRIPT_PREVIEW_LINES}
            style={tailwind.style('text-sm font-inter-420-20 tracking-[0.32px]', titleColor)}>
            {display.transcript}
          </Text>
          <Pressable onPress={() => setTranscriptExpanded(value => !value)} hitSlop={6}>
            <Text style={tailwind.style('text-xs font-inter-medium-24 pt-0.5', subtextColor)}>
              {i18n.t(
                transcriptExpanded
                  ? 'CONVERSATION.VOICE_CALL.TRANSCRIPT_SHOW_LESS'
                  : 'CONVERSATION.VOICE_CALL.TRANSCRIPT_SHOW_MORE',
              )}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
};
