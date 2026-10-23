import React from 'react';

import i18n from '@/i18n';
import { EndGlyph } from '@/svg-icons';

import { CALL_END } from '../../constants/callTheme';
import { WideActionButton } from '../WideActionButton';

// Declines every ringing call at once, the same shape as a single call's Decline
export const DeclineAllButton = ({ onPress }: { onPress: () => void }) => (
  <WideActionButton
    label={i18n.t('CONVERSATION.VOICE_WIDGET.DECLINE_ALL')}
    fill={CALL_END}
    onPress={onPress}>
    <EndGlyph color="#FFFFFF" size={18} />
  </WideActionButton>
);
