import React from 'react';
import { View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { AnswerGlyph, EndGlyph } from '@/svg-icons';

import { CALL_ANSWER, CALL_END } from '../constants/callTheme';
import { WideActionButton } from './WideActionButton';

const WHITE = '#FFFFFF';

type IncomingCallActionsProps = {
  onDecline: () => void;
  onAnswer: () => void;
  // The answer button's label, "Answer" unless the caller says otherwise
  answerLabel?: string;
  declineDisabled?: boolean;
  answerDisabled?: boolean;
};

// Decline and Answer as two wide buttons side by side
export const IncomingCallActions = ({
  onDecline,
  onAnswer,
  answerLabel,
  declineDisabled,
  answerDisabled,
}: IncomingCallActionsProps) => (
  <View style={tailwind.style('flex-row gap-4')}>
    <WideActionButton
      label={i18n.t('CONVERSATION.VOICE_WIDGET.REJECT_CALL')}
      fill={CALL_END}
      disabled={declineDisabled}
      onPress={onDecline}>
      <EndGlyph color={WHITE} size={18} />
    </WideActionButton>
    <WideActionButton
      label={answerLabel ?? i18n.t('CONVERSATION.VOICE_WIDGET.JOIN_CALL')}
      fill={CALL_ANSWER}
      disabled={answerDisabled}
      onPress={onAnswer}>
      <AnswerGlyph color={WHITE} size={18} />
    </WideActionButton>
  </View>
);
