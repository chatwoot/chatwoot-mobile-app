import React from 'react';
import { Platform } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ImproveReplyIcon,
  ChangeToneIcon,
  FixGrammarIcon,
  SuggestReplyIcon,
  SummarizeIcon,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import { COPILOT_ACTIONS } from '@/constants/copilot';
import { REPLY_EDITOR_MODES } from '@/constants';
import { CopilotMenuItem } from './CopilotMenuItem';
import type { CopilotActionKey } from '@/types/Copilot';
import i18n from '@/i18n';

type CopilotMenuProps = {
  editorContent: string;
  editorMode: string;
  onSelectAction: (actionKey: CopilotActionKey) => void;
  onSelectChangeTone: () => void;
};

export const CopilotMenu = ({
  editorContent,
  editorMode,
  onSelectAction,
  onSelectChangeTone,
}: CopilotMenuProps) => {
  const hasContent = editorContent.trim().length > 0;
  const isReplyMode = editorMode === REPLY_EDITOR_MODES.REPLY;
  const { bottom } = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';

  const menuItems = [
    hasContent && {
      icon: <ImproveReplyIcon />,
      label: i18n.t('COPILOT.IMPROVE_REPLY'),
      onPress: () => onSelectAction(COPILOT_ACTIONS.IMPROVE as CopilotActionKey),
    },
    {
      icon: <ChangeToneIcon />,
      label: i18n.t('COPILOT.CHANGE_TONE'),
      onPress: onSelectChangeTone,
    },
    hasContent && {
      icon: <FixGrammarIcon />,
      label: i18n.t('COPILOT.FIX_GRAMMAR'),
      onPress: () => onSelectAction(COPILOT_ACTIONS.FIX_SPELLING_GRAMMAR as CopilotActionKey),
    },
    isReplyMode && {
      icon: <SuggestReplyIcon />,
      label: i18n.t('COPILOT.SUGGEST_REPLY'),
      onPress: () => onSelectAction(COPILOT_ACTIONS.REPLY_SUGGESTION as CopilotActionKey),
    },
    {
      icon: <SummarizeIcon />,
      label: i18n.t('COPILOT.SUMMARIZE'),
      onPress: () => onSelectAction(COPILOT_ACTIONS.SUMMARIZE as CopilotActionKey),
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; onPress: () => void }[];

  const itemHeight = 48;
  const containerHeight = isAndroid
    ? menuItems.length * itemHeight + (bottom === 0 ? 16 : bottom)
    : menuItems.length * itemHeight + (bottom === 0 ? 16 : bottom);

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(38).stiffness(240)}
      exiting={SlideOutDown.springify().damping(38).stiffness(240)}
      style={tailwind.style('mx-1 pt-2 items-start', `h-[${containerHeight}px]`)}>
      {menuItems.map(item => (
        <CopilotMenuItem key={item.label} icon={item.icon} label={item.label} onPress={item.onPress} />
      ))}
    </Animated.View>
  );
};
