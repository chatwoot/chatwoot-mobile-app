import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import i18n from 'i18n';

export const WorkPausedNote = () => (
  <Animated.Text
    style={tailwind.style(
      'mx-4 mt-2.5 px-3 py-2.5 rounded-lg border border-dashed border-slate-400',
      'text-sm leading-[18px] tracking-[0.16px] font-inter-420-20 text-slate-900',
    )}>
    {i18n.t('SETTINGS.WORK_PAUSED')}
  </Animated.Text>
);
