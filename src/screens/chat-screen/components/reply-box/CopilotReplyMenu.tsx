import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { REPLY_EDITOR_MODES } from '@/constants';
import { COPILOT_ACTIONS } from '@/constants/copilot';
import i18n from '@/i18n';
import type { CopilotActionKey } from '@/types/Copilot';
import { useHaptic } from '@/utils';

import { TONE_OPTIONS } from '../copilot/ToneSelectionSheet';
import { renderItem, type MenuItemSpec } from './replyMenuItem';

type CopilotReplyMenuProps = PropsWithChildren<{
  editorContent: string;
  editorMode: string;
  onSelectAction: (actionKey: CopilotActionKey) => void;
}>;

export const CopilotReplyMenu = ({
  editorContent,
  editorMode,
  onSelectAction,
  children,
}: CopilotReplyMenuProps) => {
  const haptic = useHaptic();
  const hasContent = editorContent.trim().length > 0;
  const isReplyMode = editorMode === REPLY_EDITOR_MODES.REPLY;
  const run = (key: string) => () => onSelectAction(key as CopilotActionKey);

  const rewrite: MenuItemSpec[] = hasContent
    ? [
        {
          key: 'improve',
          title: i18n.t('COPILOT.IMPROVE_REPLY'),
          icon: 'wand.and.stars',
          onSelect: run(COPILOT_ACTIONS.IMPROVE),
        },
        {
          key: 'grammar',
          title: i18n.t('COPILOT.FIX_GRAMMAR'),
          icon: 'text.badge.checkmark',
          onSelect: run(COPILOT_ACTIONS.FIX_SPELLING_GRAMMAR),
        },
      ]
    : [];
  const generate: MenuItemSpec[] = [
    ...(isReplyMode
      ? [
          {
            key: 'suggest',
            title: i18n.t('COPILOT.SUGGEST_REPLY'),
            icon: 'arrowshape.turn.up.left',
            onSelect: run(COPILOT_ACTIONS.REPLY_SUGGESTION),
          },
        ]
      : []),
    {
      key: 'summarize',
      title: i18n.t('COPILOT.SUMMARIZE'),
      icon: 'text.alignleft',
      onSelect: run(COPILOT_ACTIONS.SUMMARIZE),
    },
  ];

  return (
    <DropdownMenu.Root onOpenChange={open => open && haptic?.()}>
      <DropdownMenu.Trigger asChild>
        <View accessibilityRole="button">{children}</View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {hasContent ? (
          <DropdownMenu.Group>
            {rewrite.map(renderItem)}
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger key="tone-trigger">
                <DropdownMenu.ItemIcon ios={{ name: 'theatermasks' as never }} />
                <DropdownMenu.ItemTitle>{i18n.t('COPILOT.CHANGE_TONE')}</DropdownMenu.ItemTitle>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {TONE_OPTIONS.map(option => (
                  <DropdownMenu.Item key={`tone-${option.key}`} onSelect={run(option.key)}>
                    <DropdownMenu.ItemTitle>{i18n.t(option.labelKey)}</DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Group>
        ) : null}
        <DropdownMenu.Group>{generate.map(renderItem)}</DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
