import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeOut, type SharedValue } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { Swipeable } from '@/components-next';
import { AnswerGlyph, EndGlyph } from '@/svg-icons';
import type { LiveCall } from '@/store/call/callTypes';

import { CALL_INK, CALL_LINK, CALL_RING_TEXT } from '../../constants/callTheme';
import { useCallerInfo } from '../../hooks/useCallerInfo';
import { useRingingFor } from '../../hooks/useRingingFor';
import { CallerMetaLine } from './CallerMetaLine';
import { RingingAvatar } from './RingingAvatar';

const WHITE = '#FFFFFF';

type RingingRowProps = {
  call: LiveCall;
  index: number;
  openedRowIndex: SharedValue<number | null>;
  onAnswer: () => void;
  onDecline: () => void;
};

const SwipeActionLabel = ({ glyph, label }: { glyph: React.ReactNode; label: string }) => (
  <View style={tailwind.style('items-center justify-center gap-1')}>
    {glyph}
    <Text
      numberOfLines={1}
      style={tailwind.style('font-inter-580-24 text-[13px] leading-4 text-white')}>
      {label}
    </Text>
  </View>
);

const noop = () => {};

export const RingingRow = ({
  call,
  index,
  openedRowIndex,
  onAnswer,
  onDecline,
}: RingingRowProps) => {
  const info = useCallerInfo(call);
  const ringingFor = useRingingFor(call.addedAt);

  return (
    <Animated.View exiting={FadeOut.duration(160)}>
      <Swipeable
        spacing={24}
        leftElement={
          <SwipeActionLabel
            glyph={<AnswerGlyph color={WHITE} size={22} />}
            label={i18n.t('CONVERSATION.VOICE_WIDGET.JOIN_CALL')}
          />
        }
        rightElement={
          <SwipeActionLabel
            glyph={<EndGlyph color={WHITE} size={22} />}
            label={i18n.t('CONVERSATION.VOICE_WIDGET.REJECT_CALL')}
          />
        }
        leftElementBgColor="bg-teal-700"
        rightElementBgColor="bg-ruby-700"
        handleLeftElementPress={onAnswer}
        handleOnLeftOverswiped={onAnswer}
        handleRightElementPress={onDecline}
        handleOnRightOverswiped={onDecline}
        handlePress={noop}
        triggerOverswipeOnFlick
        {...{ index, openedRowIndex }}>
        <View style={tailwind.style('h-[72px] px-5 flex-row items-center gap-3')}>
          <RingingAvatar name={info.name} uri={info.avatar || undefined} size="row" />
          <View style={tailwind.style('flex-1 min-w-0 gap-[3px]')}>
            <View style={tailwind.style('flex-row items-center gap-2')}>
              <Text
                numberOfLines={1}
                style={[
                  tailwind.style(
                    'flex-1 min-w-0 font-inter-580-24 text-[16px] leading-5 tracking-[-0.1px]',
                  ),
                  { color: CALL_INK },
                ]}>
                {info.name}
              </Text>
              <View style={tailwind.style('flex-row items-center')}>
                <View
                  style={[
                    tailwind.style('h-1.5 w-1.5 rounded-full mr-1.5'),
                    { backgroundColor: CALL_LINK },
                  ]}
                />
                <Text
                  style={[
                    tailwind.style('font-inter-580-24 text-[12px] leading-4 tabular-nums'),
                    { color: CALL_RING_TEXT },
                  ]}>
                  {i18n.t('CONVERSATION.VOICE_WIDGET.RINGING_FOR', { duration: ringingFor })}
                </Text>
              </View>
            </View>
            <CallerMetaLine
              phone={info.phone}
              inboxName={info.inboxName}
              channelType={info.channelType}
              medium={info.medium}
              size="row"
            />
          </View>
        </View>
      </Swipeable>
    </Animated.View>
  );
};
