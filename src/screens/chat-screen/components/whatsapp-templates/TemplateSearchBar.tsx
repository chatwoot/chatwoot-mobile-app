import React from 'react';
import { TextInput, View } from 'react-native';

import { Icon } from '@/components-next';
import i18n from '@/i18n';
import { SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

type TemplateSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

const TemplateSearchBar = ({ value, onChangeText }: TemplateSearchBarProps) => (
  <View style={tailwind.style('px-3 pb-1')}>
    <View
      style={tailwind.style(
        'h-9 flex-row items-center gap-[6px] px-[10px] rounded-[11px] bg-blackA-A3',
      )}>
      <Icon icon={<SearchIcon />} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={i18n.t('CONTENT_TEMPLATE.SEARCH_PLACEHOLDER')}
        placeholderTextColor={tailwind.color('text-gray-600')}
        autoCapitalize="none"
        autoCorrect={false}
        style={tailwind.style(
          'flex-1 text-base font-inter-420-20 tracking-[0.24px] text-gray-950 p-0',
        )}
      />
    </View>
  </View>
);

export default TemplateSearchBar;
