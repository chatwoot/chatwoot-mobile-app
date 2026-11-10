import React from 'react';
import { View } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';
import { AnswerGlyph, EndGlyph } from '@/svg-icons';

import { useCallTheme } from '../constants/callTheme';
import { CALL_GLASS } from './CallSurface';
import { WideActionButton } from './WideActionButton';

const glyph = (colour: string) => (CALL_GLASS ? colour : '#FFFFFF');

type IncomingCallActionsProps = {
  onDecline: () => void;
  onAnswer: () => void;
  answerLabel?: string;
  declineDisabled?: boolean;
  answerDisabled?: boolean;
};

export const IncomingCallActions = ({
  onDecline,
  onAnswer,
  answerLabel,
  declineDisabled,
  answerDisabled,
}: IncomingCallActionsProps) => {
  const tailwind = useTailwind();
  const { CALL_ANSWER, CALL_END } = useCallTheme();
  return (
    <View style={tailwind.style('flex-row gap-4')}>
      <WideActionButton
        label={i18n.t('CONVERSATION.VOICE_WIDGET.REJECT_CALL')}
        fill={CALL_END}
        disabled={declineDisabled}
        onPress={onDecline}>
        <EndGlyph color={glyph(CALL_END)} size={18} />
      </WideActionButton>
      <WideActionButton
        label={answerLabel ?? i18n.t('CONVERSATION.VOICE_WIDGET.JOIN_CALL')}
        fill={CALL_ANSWER}
        disabled={answerDisabled}
        onPress={onAnswer}>
        <AnswerGlyph color={glyph(CALL_ANSWER)} size={18} />
      </WideActionButton>
    </View>
  );
};
