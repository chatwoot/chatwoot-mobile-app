import React, { useMemo, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View } from 'react-native';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { NormalizedTemplate, TemplateSendParams } from '@/types';
import {
  buildTemplateParams,
  canSendTemplate,
  renderTemplatePreview,
  requiresImageUrl,
} from '@/utils/messageTemplateUtils';

import TemplateBodyPreview from './TemplateBodyPreview';
import TemplateFormHeader from './TemplateFormHeader';
import TemplateImageInputField from './TemplateImageInputField';
import TemplateVariableInput from './TemplateVariableInput';

const IMAGE_URL_FIELD = '__imageUrl';

type ContentTemplateFormProps = {
  template: NormalizedTemplate;
  onBack: () => void;
  onSend: (payload: { message: string; templateParams: TemplateSendParams }) => void;
};

const ContentTemplateForm = ({ template, onBack, onSend }: ContentTemplateFormProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState('');
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const showImageInput = requiresImageUrl(template);
  const canSend = useMemo(
    () => canSendTemplate(template, values, imageUrl),
    [template, values, imageUrl],
  );

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleFocus = (key: string) => () => setFocusedKey(key);
  const handleBlur = (key: string) => () => setFocusedKey(prev => (prev === key ? null : prev));

  const handleSend = () => {
    const message = renderTemplatePreview(template.body, values);
    const templateParams = buildTemplateParams(
      template,
      values,
      showImageInput ? imageUrl : undefined,
    );
    onSend({ message, templateParams });
  };

  return (
    <Animated.View entering={FadeIn.duration(250).springify()} style={tailwind.style('flex-1')}>
      <TemplateFormHeader
        title={template.name}
        canSend={canSend}
        onBack={onBack}
        onSend={handleSend}
      />

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('px-6 pb-12 pt-2')}>
        <TemplateBodyPreview body={template.body} values={values} />

        {showImageInput && (
          <TemplateImageInputField
            value={imageUrl}
            onChangeText={setImageUrl}
            isFocused={focusedKey === IMAGE_URL_FIELD}
            onFocus={handleFocus(IMAGE_URL_FIELD)}
            onBlur={handleBlur(IMAGE_URL_FIELD)}
          />
        )}

        {template.variables.length > 0 && (
          <View style={tailwind.style('mt-6')}>
            <Animated.Text
              style={tailwind.style(
                'mb-3 text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-500',
              )}>
              {i18n.t('CONTENT_TEMPLATE.VARIABLES')}
            </Animated.Text>
            {template.variables.map(key => (
              <TemplateVariableInput
                key={key}
                label={key}
                value={values[key] || ''}
                onChangeText={text => handleChange(key, text)}
                isFocused={focusedKey === key}
                onFocus={handleFocus(key)}
                onBlur={handleBlur(key)}
              />
            ))}
          </View>
        )}
      </BottomSheetScrollView>
    </Animated.View>
  );
};

export default ContentTemplateForm;
