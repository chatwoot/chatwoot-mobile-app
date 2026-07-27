import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { NormalizedTemplate } from '@/types';
import { useHaptic } from '@/utils';
import { getHeaderSubtitle, renderTemplateLabel } from '@/utils/messageTemplateUtils';

type WhatsAppTemplateItemProps = {
  template: NormalizedTemplate;
  onPress: (template: NormalizedTemplate) => void;
  isLastItem: boolean;
};

const MetaSeparator = () => <View style={tailwind.style('w-px h-[10px] bg-gray-300')} />;

const MetaChip = ({ label }: { label: string }) => (
  <Animated.Text
    style={tailwind.style(
      'text-[14px] font-inter-420-20 leading-[20px] tracking-[0.07px] text-gray-700',
    )}>
    {label}
  </Animated.Text>
);

const ActionChip = ({ label }: { label: string }) => (
  <View
    style={tailwind.style(
      'h-7 px-3 rounded-lg bg-white border border-blackA-A3 items-center justify-center',
    )}>
    <Animated.Text
      style={tailwind.style(
        'text-[15px] font-inter-420-20 leading-[22px] tracking-[0.3px] text-gray-950',
      )}>
      {label}
    </Animated.Text>
  </View>
);

const WhatsAppTemplateItem = ({ template, onPress, isLastItem }: WhatsAppTemplateItemProps) => {
  const hapticSelection = useHaptic();

  const handlePress = useCallback(() => {
    hapticSelection?.();
    onPress(template);
  }, [hapticSelection, onPress, template]);

  const subtitle = getHeaderSubtitle(template);
  const bodyLabel = renderTemplateLabel(template.body);

  return (
    <Pressable onPress={handlePress} style={tailwind.style('pl-4 pr-3')}>
      <View
        style={tailwind.style(
          'py-4 pr-2 gap-[10px]',
          !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '',
        )}>
        <View style={tailwind.style('flex-row items-center gap-2')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style(
              'flex-1 text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {template.name}
          </Animated.Text>
          {(template.category || template.language) && (
            <View style={tailwind.style('flex-row items-center gap-[6px]')}>
              {template.category && <MetaChip label={template.category} />}
              {template.category && template.language && <MetaSeparator />}
              {template.language && <MetaChip label={template.language} />}
            </View>
          )}
        </View>

        {subtitle && (
          <Animated.Text
            style={tailwind.style(
              'text-[15px] font-inter-420-20 leading-[22px] tracking-[0.3px] text-gray-800',
            )}>
            {subtitle}
          </Animated.Text>
        )}

        <Animated.Text
          style={tailwind.style(
            'text-[15px] font-inter-420-20 leading-[22px] tracking-[0.3px] text-gray-800',
          )}>
          {bodyLabel}
        </Animated.Text>

        {template.actions && template.actions.length > 0 && (
          <View style={tailwind.style('flex-row flex-wrap items-center gap-[10px]')}>
            {template.actions.map((action, index) => (
              <ActionChip key={`${index}-${action}`} label={action} />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default WhatsAppTemplateItem;
