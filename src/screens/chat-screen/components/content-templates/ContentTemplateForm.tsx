import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { Icon } from '@/components-next';
import i18n from '@/i18n';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import { NormalizedTemplate, TemplateSendParams } from '@/types';
import { useHaptic, useScaleAnimation } from '@/utils';
import {
  allVariablesFilled,
  buildTemplateParams,
  renderTemplatePreview,
} from '@/utils/messageTemplateUtils';

type ContentTemplateFormProps = {
  template: NormalizedTemplate;
  onBack: () => void;
  onSend: (payload: { message: string; templateParams: TemplateSendParams }) => void;
};

type PreviewSegment = { text: string; filled: boolean };

const buildPreviewSegments = (body: string, values: Record<string, string>): PreviewSegment[] => {
  if (!body) return [];
  const segments: PreviewSegment[] = [];
  const regex = /\{\{([^{}]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: body.slice(lastIndex, match.index), filled: false });
    }
    const key = match[1].trim();
    const value = values[key];
    if (value && value.length > 0) {
      segments.push({ text: value, filled: true });
    } else {
      segments.push({ text: `{{${key}}}`, filled: false });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < body.length) {
    segments.push({ text: body.slice(lastIndex), filled: false });
  }
  return segments;
};

const ContentTemplateForm = ({ template, onBack, onSend }: ContentTemplateFormProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const hapticSelection = useHaptic();
  const { animatedStyle, handlers } = useScaleAnimation();

  const segments = useMemo(
    () => buildPreviewSegments(template.body, values),
    [template.body, values],
  );
  const canSend = useMemo(() => allVariablesFilled(template, values), [template, values]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSend = () => {
    if (!canSend) return;
    hapticSelection?.();
    const message = renderTemplatePreview(template.body, values);
    const templateParams = buildTemplateParams(template, values);
    onSend({ message, templateParams });
  };

  return (
    <Animated.View entering={FadeIn.duration(250).springify()} style={tailwind.style('flex-1')}>
      <View style={tailwind.style('flex-row items-center px-5 py-3 gap-3')}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={tailwind.style('items-center justify-center w-5 h-5')}>
          <Icon icon={<ChevronLeft />} size={16} />
        </Pressable>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'flex-1 text-[17px] font-inter-medium-24 leading-[24px] tracking-[0.34px] text-gray-950',
          )}>
          {template.name}
        </Animated.Text>
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            {...handlers}
            style={tailwind.style(
              'px-3 py-[7px] rounded-lg flex-row items-center justify-center min-w-[60px] min-h-[32px]',
              canSend ? 'bg-gray-100' : 'bg-gray-50',
            )}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-medium-24 leading-[22px] tracking-[0.32px]',
                canSend ? 'text-gray-950' : 'text-gray-500',
              )}>
              {i18n.t('CONTENT_TEMPLATE.SEND')}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('px-6 pb-12 pt-2')}>
        <Animated.Text
          style={tailwind.style(
            'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
          )}>
          {segments.map((segment, index) => (
            <Animated.Text
              key={`${index}-${segment.text}`}
              style={tailwind.style(segment.filled ? 'font-inter-medium-24' : 'font-inter-420-20')}>
              {segment.text}
            </Animated.Text>
          ))}
        </Animated.Text>

        {template.variables.length > 0 && (
          <>
            <Animated.Text
              style={tailwind.style(
                'mt-6 mb-3 text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-500',
              )}>
              {i18n.t('CONTENT_TEMPLATE.VARIABLES')}
            </Animated.Text>
            {template.variables.map(key => {
              const isFocused = focusedKey === key;
              return (
                <View key={key} style={tailwind.style('flex-row items-center mb-4')}>
                  <Animated.Text
                    style={tailwind.style(
                      'w-8 text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-500',
                    )}>
                    {key}
                  </Animated.Text>
                  <BottomSheetTextInput
                    value={values[key] || ''}
                    onChangeText={text => handleChange(key, text)}
                    onFocus={() => setFocusedKey(key)}
                    onBlur={() => setFocusedKey(prev => (prev === key ? null : prev))}
                    placeholder={key}
                    placeholderTextColor={tailwind.color('text-gray-500')}
                    style={[
                      tailwind.style(
                        'flex-1 px-3 py-2 rounded-[10px] border text-base font-inter-420-20 text-gray-950',
                        isFocused ? 'border-blue-700' : 'border-blackA-A4',
                      ),
                    ]}
                  />
                </View>
              );
            })}
          </>
        )}
      </BottomSheetScrollView>
    </Animated.View>
  );
};

export default ContentTemplateForm;
