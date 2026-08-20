import React, { useMemo, useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScrollView, View } from 'react-native';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { NormalizedTemplate, TemplateSendParams } from '@/types';
import {
  TemplateFormState,
  buildTemplateSendPayload,
  createEmptyFormState,
  hasMediaHeader,
  isDocumentHeader,
  isTemplateComplete,
} from '@/utils/messageTemplateUtils';

import TemplateBodyPreview from './TemplateBodyPreview';
import TemplateFormHeader from './TemplateFormHeader';
import TemplateMediaInputField from './TemplateMediaInputField';
import TemplateVariableInput from './TemplateVariableInput';

const MEDIA_URL_FIELD = '__mediaUrl';
const MEDIA_NAME_FIELD = '__mediaName';
const buttonFieldKey = (index: number) => `__button_${index}`;

type WhatsAppTemplateFormProps = {
  template: NormalizedTemplate;
  onBack: () => void;
  onSend: (payload: { message: string; templateParams: TemplateSendParams }) => void;
};

const SectionLabel = ({ label }: { label: string }) => (
  <Animated.Text
    style={tailwind.style(
      'mb-3 text-[15px] font-inter-medium-24 tracking-[0.225px] text-gray-500',
    )}>
    {label}
  </Animated.Text>
);

const WhatsAppTemplateForm = ({ template, onBack, onSend }: WhatsAppTemplateFormProps) => {
  const [state, setState] = useState<TemplateFormState>(createEmptyFormState);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const showMediaInput =
    template.platform === 'twilio'
      ? Boolean(template.isMediaTemplate && template.mediaVariableKey)
      : hasMediaHeader(template);
  const showDocumentName = template.platform === 'whatsapp' && isDocumentHeader(template);

  const canSend = useMemo(() => isTemplateComplete(template, state), [template, state]);

  const handleBodyChange = (key: string) => (value: string) => {
    setState(prev => ({ ...prev, bodyValues: { ...prev.bodyValues, [key]: value } }));
  };
  const handleMediaUrlChange = (value: string) => setState(prev => ({ ...prev, mediaUrl: value }));
  const handleMediaNameChange = (value: string) =>
    setState(prev => ({ ...prev, mediaName: value }));
  const handleButtonChange = (index: number) => (value: string) => {
    setState(prev => ({ ...prev, buttonValues: { ...prev.buttonValues, [index]: value } }));
  };

  const handleFocus = (key: string) => () => setFocusedKey(key);
  const handleBlur = (key: string) => () => setFocusedKey(prev => (prev === key ? null : prev));

  const handleSend = () => {
    onSend(buildTemplateSendPayload(template, state));
  };

  const mediaLabel =
    template.platform === 'twilio'
      ? i18n.t('CONTENT_TEMPLATE.MEDIA_URL')
      : template.header?.format === 'IMAGE'
        ? i18n.t('CONTENT_TEMPLATE.IMAGE_URL')
        : template.header?.format === 'VIDEO'
          ? i18n.t('CONTENT_TEMPLATE.VIDEO_URL')
          : i18n.t('CONTENT_TEMPLATE.DOCUMENT_URL');
  const withImagePreview = template.platform === 'whatsapp' && template.header?.format === 'IMAGE';
  const mediaPlaceholder =
    (template.platform === 'twilio' && template.templateMediaUrl) ||
    i18n.t('CONTENT_TEMPLATE.MEDIA_URL_PLACEHOLDER');

  return (
    <Animated.View entering={FadeIn.duration(250).springify()} style={tailwind.style('flex-1')}>
      <TemplateFormHeader
        title={template.name}
        canSend={canSend}
        onBack={onBack}
        onSend={handleSend}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('px-6 pb-12 pt-2')}>
        <TemplateBodyPreview body={template.body} values={state.bodyValues} />

        {showMediaInput && (
          <TemplateMediaInputField
            label={mediaLabel}
            value={state.mediaUrl}
            placeholder={mediaPlaceholder}
            onChangeText={handleMediaUrlChange}
            isFocused={focusedKey === MEDIA_URL_FIELD}
            onFocus={handleFocus(MEDIA_URL_FIELD)}
            onBlur={handleBlur(MEDIA_URL_FIELD)}
            withImagePreview={withImagePreview}
          />
        )}

        {showDocumentName && (
          <TemplateMediaInputField
            label={i18n.t('CONTENT_TEMPLATE.DOCUMENT_NAME')}
            value={state.mediaName}
            placeholder={i18n.t('CONTENT_TEMPLATE.DOCUMENT_NAME_PLACEHOLDER')}
            onChangeText={handleMediaNameChange}
            isFocused={focusedKey === MEDIA_NAME_FIELD}
            onFocus={handleFocus(MEDIA_NAME_FIELD)}
            onBlur={handleBlur(MEDIA_NAME_FIELD)}
            keyboardType="default"
          />
        )}

        {template.variables.length > 0 && (
          <View style={tailwind.style('mt-6')}>
            <SectionLabel label={i18n.t('CONTENT_TEMPLATE.VARIABLES')} />
            {template.variables.map(key => (
              <TemplateVariableInput
                key={key}
                label={key}
                value={state.bodyValues[key] || ''}
                onChangeText={handleBodyChange(key)}
                isFocused={focusedKey === key}
                onFocus={handleFocus(key)}
                onBlur={handleBlur(key)}
              />
            ))}
          </View>
        )}

        {template.buttons && template.buttons.length > 0 && (
          <View style={tailwind.style('mt-6')}>
            <SectionLabel label={i18n.t('CONTENT_TEMPLATE.BUTTON_PARAMETERS')} />
            {template.buttons.map(button => (
              <TemplateVariableInput
                key={buttonFieldKey(button.index)}
                label={`${button.index + 1}`}
                value={state.buttonValues[button.index] || ''}
                onChangeText={handleButtonChange(button.index)}
                isFocused={focusedKey === buttonFieldKey(button.index)}
                onFocus={handleFocus(buttonFieldKey(button.index))}
                onBlur={handleBlur(buttonFieldKey(button.index))}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default WhatsAppTemplateForm;
