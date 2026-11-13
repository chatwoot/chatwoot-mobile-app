import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StackActions,
  UNSTABLE_usePreventRemove as usePreventRemove,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { camelCase } from 'lodash';

import { Button, Icon } from '@/components-next';
import { GlassCircleButton } from '@/components-next/side-toolbar/GlassCircleButton';
import { GlassPillButton } from '@/components-next/side-toolbar/GlassPillButton';
import { PaneHeader } from '@/navigation/split/PaneHeader';
import { CloseIcon } from '@/svg-icons';
import { useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { macroActions } from '@/store/macro/macroActions';
import { selectRequiredConversationAttributes } from '@/store/account/accountSlice';
import { IOS_DESIGN } from '@/utils';
import { showToast } from '@/utils/toastUtils';
import {
  AttributeValueError,
  RequiredAttributeValue,
  getAttributeValueError,
  getInitialAttributeValue,
  getMissingRequiredAttributes,
  getSavedAttributeValue,
} from '@/utils/attributeUtils';
import type { CustomAttribute } from '@/types';

import { AndroidAttributeField } from './AndroidAttributeField';
import { IOSAttributeRow } from './IOSAttributeRow';
import type { ResolveAttributesParams } from './useRequiredAttributes';

const errorMessage = (attribute: CustomAttribute, error: AttributeValueError) => {
  if (error === 'INVALID_INPUT' && attribute.regexCue) {
    return attribute.regexCue;
  }
  return i18n.t(`CONVERSATION.REQUIRED_ATTRIBUTES.VALIDATIONS.${error}`);
};

const ResolveAttributesScreen = () => {
  const tailwind = useTailwind();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { conversationId, macroId } = route.params as ResolveAttributesParams;

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const requiredAttributes = useAppSelector(selectRequiredConversationAttributes);

  // The fields are fixed when the form opens so they stay put while the agent fills them.
  const [attributes] = useState(() =>
    getMissingRequiredAttributes(requiredAttributes, conversation?.customAttributes || {}),
  );
  const [initialValues] = useState<Record<string, RequiredAttributeValue>>(() =>
    Object.fromEntries(
      attributes.map(attribute => [
        attribute.attributeKey,
        getInitialAttributeValue(
          attribute,
          conversation?.customAttributes?.[camelCase(attribute.attributeKey)],
        ),
      ]),
    ),
  );
  const [values, setValues] = useState(initialValues);
  const [touchedKeys, setTouchedKeys] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const isSubmitted = useRef(false);

  // A dismissed form still runs the macro; the server leaves the conversation open
  // while required attributes are empty.
  useEffect(() => {
    return () => {
      if (!macroId || isSubmitted.current) return;
      dispatch(macroActions.executeMacro({ macroId, conversationIds: [conversationId] }))
        .unwrap()
        .then(() => showToast({ message: i18n.t('MACRO.EXECUTED_WITHOUT_RESOLVING') }))
        .catch(() => showToast({ message: i18n.t('MACRO.EXECUTION_ERROR') }));
    };
  }, [conversationId, dispatch, macroId]);

  const isDirty = attributes.some(
    attribute => values[attribute.attributeKey] !== initialValues[attribute.attributeKey],
  );

  // Closing mid-save would run the macro from both the unmount cleanup and the submit.
  usePreventRemove(isDirty || isSaving, ({ data }) => {
    if (isSubmitted.current) {
      navigation.dispatch(data.action);
      return;
    }
    if (isSaving) return;
    Alert.alert(
      i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.DISCARD.TITLE'),
      i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.DISCARD.MESSAGE'),
      [
        { text: i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.DISCARD.KEEP_EDITING'), style: 'cancel' },
        {
          text: i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.DISCARD.CONFIRM'),
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });

  const errors = Object.fromEntries(
    attributes.map(attribute => [
      attribute.attributeKey,
      getAttributeValueError(attribute, values[attribute.attributeKey]),
    ]),
  );

  const incompleteCount = attributes.filter(attribute => errors[attribute.attributeKey]).length;
  const introKey = hasTriedSubmit ? 'NEEDS_ATTENTION' : 'INTRO';
  const intro =
    incompleteCount === 0
      ? i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.ALL_FILLED')
      : i18n.t(
          `CONVERSATION.REQUIRED_ATTRIBUTES.${introKey}_${incompleteCount === 1 ? 'ONE' : 'OTHER'}`,
          { count: incompleteCount },
        );

  const touch = (key: string) => {
    setTouchedKeys(keys => (keys.includes(key) ? keys : [...keys, key]));
  };

  const handleChange = (key: string, value: RequiredAttributeValue) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  const close = () => {
    navigation.dispatch(StackActions.pop());
  };

  const resolve = async () => {
    if (macroId) {
      try {
        await dispatch(
          macroActions.executeMacro({ macroId, conversationIds: [conversationId] }),
        ).unwrap();
        showToast({ message: i18n.t('MACRO.EXECUTION_SUCCESS') });
      } catch {
        showToast({ message: i18n.t('MACRO.EXECUTION_ERROR') });
      }
      return;
    }
    await dispatch(
      conversationActions.toggleConversationStatus({
        conversationId,
        payload: { status: 'resolved', snoozed_until: null },
      }),
    );
    showToast({ message: i18n.t('CONVERSATION.STATUS_CHANGE') });
  };

  const handleSubmit = async () => {
    setTouchedKeys(attributes.map(attribute => attribute.attributeKey));
    setHasTriedSubmit(true);
    if (isSaving || attributes.some(attribute => errors[attribute.attributeKey])) return;

    setIsSaving(true);
    try {
      await dispatch(
        conversationActions.updateCustomAttributes({
          conversationId,
          customAttributes: Object.fromEntries(
            attributes.map(attribute => [
              attribute.attributeKey,
              getSavedAttributeValue(attribute, values[attribute.attributeKey]),
            ]),
          ),
        }),
      ).unwrap();
    } catch {
      showToast({ message: i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.SAVE_ERROR') });
      setIsSaving(false);
      return;
    }

    isSubmitted.current = true;
    await resolve();
    close();
  };

  const fieldProps = (attribute: CustomAttribute) => {
    const key = attribute.attributeKey;
    const error = touchedKeys.includes(key) ? errors[key] : null;
    return {
      attribute,
      value: values[key],
      error: error ? errorMessage(attribute, error) : null,
      onChange: (value: RequiredAttributeValue) => handleChange(key, value),
      onBlur: () => touch(key),
    };
  };

  if (IOS_DESIGN) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={tailwind.style('flex-1 bg-gray-50')}>
        <View style={tailwind.style('pt-3')}>
          <PaneHeader
            title={i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.TITLE')}
            left={
              <GlassCircleButton
                icon={<CloseIcon stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
                onPress={close}
                disabled={isSaving}
                accessibilityLabel={i18n.t('CONVERSATION.COMPOSE.CLOSE')}
              />
            }
            right={
              <GlassPillButton
                label={i18n.t('CONVERSATION.RESOLVE')}
                onPress={handleSubmit}
                disabled={isSaving}
                isLoading={isSaving}
              />
            }
          />
        </View>
        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            tailwind.style('px-4 pt-1.5 gap-2'),
            { paddingBottom: insets.bottom + 24 },
          ]}>
          <Text
            style={tailwind.style(
              'mx-4 mb-1 text-[13px] leading-[18px] font-inter-420-20 text-gray-900',
            )}>
            {intro}
          </Text>
          <View style={tailwind.style('rounded-[13px] bg-white overflow-hidden')}>
            {attributes.map((attribute, index) => (
              <IOSAttributeRow
                key={attribute.attributeKey}
                {...fieldProps(attribute)}
                isLast={index === attributes.length - 1}
              />
            ))}
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={tailwind.style('flex-1 bg-white')}>
      <View style={tailwind.style('h-14 flex-row items-center gap-1 px-1')}>
        <Pressable
          onPress={close}
          disabled={isSaving}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.COMPOSE.CLOSE')}
          style={tailwind.style('h-12 w-12 items-center justify-center')}>
          <Icon icon={<CloseIcon stroke={tailwind.color('text-gray-950')} />} size={24} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={tailwind.style('flex-1 text-lg leading-6 font-inter-medium-24 text-gray-950')}>
          {i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.RESOLVE')}
        </Text>
      </View>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('px-4 pt-1 pb-4 gap-5')}>
        <Text style={tailwind.style('text-sm leading-5 font-inter-420-20 text-gray-900')}>
          {intro}
        </Text>
        {attributes.map(attribute => (
          <AndroidAttributeField key={attribute.attributeKey} {...fieldProps(attribute)} />
        ))}
      </KeyboardAwareScrollView>
      <View
        style={tailwind.style(
          'px-4 pt-3 border-t border-t-blackA-A3',
          `pb-[${Math.max(insets.bottom, 12)}px]`,
        )}>
        <Button
          text={i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.RESOLVE')}
          handlePress={handleSubmit}
          disabled={isSaving}
          isLoading={isSaving}
        />
      </View>
    </SafeAreaView>
  );
};

export default ResolveAttributesScreen;
