import React from 'react';

import i18n from '@/i18n';
import { BellOffGlyph } from '@/svg-icons';

import { useCallTheme } from '../../constants/callTheme';
import { WideActionButton } from '../WideActionButton';

export const SilenceAllButton = ({ onPress }: { onPress: () => void }) => {
  const { CALL_INK, CONTROL_OFF_FILL, CONTROL_OFF_GLYPH } = useCallTheme();
  return (
    <WideActionButton
      label={i18n.t('CONVERSATION.VOICE_WIDGET.SILENCE_ALL')}
      fill={CONTROL_OFF_FILL}
      labelColor={CALL_INK}
      onPress={onPress}>
      <BellOffGlyph color={CONTROL_OFF_GLYPH} size={18} />
    </WideActionButton>
  );
};
