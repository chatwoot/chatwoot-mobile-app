import React from 'react';

import i18n from '@/i18n';
import { CloseGlyph } from '@/svg-icons';

import { CALL_INK, CONTROL_OFF_FILL, CONTROL_OFF_GLYPH } from '../../constants/callTheme';
import { WideActionButton } from '../WideActionButton';

export const DismissAllButton = ({ onPress }: { onPress: () => void }) => (
  <WideActionButton
    label={i18n.t('CONVERSATION.VOICE_WIDGET.DISMISS_ALL')}
    fill={CONTROL_OFF_FILL}
    labelColor={CALL_INK}
    onPress={onPress}>
    <CloseGlyph color={CONTROL_OFF_GLYPH} size={18} />
  </WideActionButton>
);
