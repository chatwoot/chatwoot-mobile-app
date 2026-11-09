import { Pressable, Text } from 'react-native';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { ConversationHeaderPresenterProps } from './ConversationHeaderPresenter';

export const SideLayoutListAction = ({
  currentState,
  isSelectedAll,
  filtersAppliedCount,
  onLeftIconPress,
  onClearFilter,
}: Omit<ConversationHeaderPresenterProps, 'onRightIconPress'>) => {
  if (currentState === 'Select') {
    return (
      <Pressable onPress={onLeftIconPress} hitSlop={12} accessibilityRole="button">
        <Text
          style={tailwind.style('text-[17px] leading-[22px] font-inter-medium-24 text-blue-800')}>
          {i18n.t(
            isSelectedAll
              ? 'CONVERSATION.HEADER.DESELECT_ALL'
              : 'CONVERSATION.HEADER.SELECT_ALL_TITLE',
          )}
        </Text>
      </Pressable>
    );
  }
  if (currentState === 'Filter') {
    return (
      <Pressable onPress={onClearFilter} disabled={filtersAppliedCount === 0} hitSlop={16}>
        <Text
          style={tailwind.style(
            'text-md font-inter-medium-24 leading-[17px] tracking-[0.24px]',
            filtersAppliedCount === 0 ? 'text-gray-700' : 'text-blue-800',
          )}>
          {i18n.t('CONVERSATION.HEADER.CLEAR_FILTER')}
          {filtersAppliedCount > 0 ? ` (${filtersAppliedCount})` : ''}
        </Text>
      </Pressable>
    );
  }
  return null;
};
