import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={tailwind.style('absolute bottom-full left-0 right-0 px-1 pb-2')}>
      {hasContent && (
        <CopilotMenuItem
          icon={<ImproveReplyIcon />}
          label={i18n.t('COPILOT.IMPROVE_REPLY')}
          onPress={() => onSelectAction(COPILOT_ACTIONS.IMPROVE as CopilotActionKey)}
        />
      )}
      <CopilotMenuItem
        icon={<ChangeToneIcon />}
        label={i18n.t('COPILOT.CHANGE_TONE')}
        onPress={onSelectChangeTone}
      />
      {hasContent && (
        <CopilotMenuItem
          icon={<FixGrammarIcon />}
          label={i18n.t('COPILOT.FIX_GRAMMAR')}
          onPress={() => onSelectAction(COPILOT_ACTIONS.FIX_SPELLING_GRAMMAR as CopilotActionKey)}
        />
      )}
      {isReplyMode && (
        <CopilotMenuItem
          icon={<SuggestReplyIcon />}
          label={i18n.t('COPILOT.SUGGEST_REPLY')}
          onPress={() => onSelectAction(COPILOT_ACTIONS.REPLY_SUGGESTION as CopilotActionKey)}
        />
      )}
      <CopilotMenuItem
        icon={<SummarizeIcon />}
        label={i18n.t('COPILOT.SUMMARIZE')}
        onPress={() => onSelectAction(COPILOT_ACTIONS.SUMMARIZE as CopilotActionKey)}
      />
    </Animated.View>
  );
};
