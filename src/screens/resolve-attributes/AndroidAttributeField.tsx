import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { Icon } from '@/components-next';
import { Sheet, SheetRef } from '@/components-next/common/sheet/Sheet';
import { CalendarIcon, CaretBottomSmall, SearchIcon, TickIcon } from '@/svg-icons';
import { ThemeTailwind, useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';

import { formatDateValue, parseDateValue, toDateValue } from './dateValue';
import type { AttributeFieldProps } from './types';

const SEARCHABLE_OPTION_COUNT = 8;
const VALUE = 'flex-1 text-base leading-[22px] font-inter-420-20';

const boxStyle = (tailwind: ThemeTailwind, isFocused: boolean, hasError: boolean) =>
  tailwind.style(
    'min-h-[48px] px-3.5 rounded-[10px] flex-row items-center gap-2.5',
    hasError
      ? 'border-2 border-ruby-800'
      : isFocused
        ? 'border-2 border-blue-800'
        : 'border border-gray-500',
  );

const ErrorBadge = () => {
  const tailwind = useTailwind();
  return (
    <View
      style={tailwind.style(
        'h-[18px] w-[18px] rounded-full bg-ruby-800 items-center justify-center',
      )}>
      <Text style={tailwind.style('text-xs leading-[14px] font-inter-semibold-20 text-white')}>
        !
      </Text>
    </View>
  );
};

const TextField = ({ attribute, value, error, onChange, onBlur }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const [isFocused, setIsFocused] = useState(false);
  const type = attribute.attributeDisplayType;
  const isText = type === 'text';
  const placeholderKey = isText ? 'TYPE_HERE' : type === 'number' ? 'NUMBER' : 'LINK';

  return (
    <View
      style={[
        boxStyle(tailwind, isFocused, !!error),
        isText ? tailwind.style('min-h-[88px] items-stretch') : null,
      ]}>
      <TextInput
        value={typeof value === 'string' ? value : ''}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        multiline={isText}
        keyboardType={type === 'number' ? 'decimal-pad' : type === 'link' ? 'url' : 'default'}
        autoCapitalize={isText ? 'sentences' : 'none'}
        autoCorrect={isText}
        placeholder={i18n.t(`CONVERSATION.REQUIRED_ATTRIBUTES.PLACEHOLDERS.${placeholderKey}`)}
        placeholderTextColor={tailwind.color('text-gray-700')}
        style={tailwind.style(VALUE, 'p-0 text-gray-950', isText ? 'py-3' : '')}
        textAlignVertical={isText ? 'top' : 'center'}
      />
      {error && !isText ? <ErrorBadge /> : null}
    </View>
  );
};

const DateField = ({ value, error, onChange }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const selectedDate = parseDateValue(value);

  const openPicker = () => {
    DateTimePickerAndroid.open({
      value: selectedDate || new Date(),
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          onChange(toDateValue(date));
        }
      },
    });
  };

  return (
    <Pressable
      onPress={openPicker}
      accessibilityRole="button"
      style={boxStyle(tailwind, false, !!error)}>
      <Text style={tailwind.style(VALUE, selectedDate ? 'text-gray-950' : 'text-gray-700')}>
        {selectedDate
          ? formatDateValue(selectedDate)
          : i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.PLACEHOLDERS.DATE')}
      </Text>
      <Icon icon={<CalendarIcon stroke={tailwind.color('text-gray-900')} />} size={18} />
    </Pressable>
  );
};

const ListField = ({ attribute, value, error, onChange }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const sheetRef = useRef<SheetRef>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const options = attribute.attributeValues || [];
  const visibleOptions = options.filter(option =>
    option.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const hasValue = typeof value === 'string' && value.length > 0;

  const select = (option: string) => {
    onChange(option);
    sheetRef.current?.dismiss();
  };

  return (
    <>
      <Pressable
        onPress={() => {
          setIsOpen(true);
          sheetRef.current?.present();
        }}
        accessibilityRole="button"
        style={boxStyle(tailwind, isOpen, !!error)}>
        <Text
          numberOfLines={1}
          style={tailwind.style(VALUE, hasValue ? 'text-gray-950' : 'text-gray-700')}>
          {hasValue ? value : i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.PLACEHOLDERS.CHOOSE_OPTION')}
        </Text>
        <Icon icon={<CaretBottomSmall fill={tailwind.color('text-gray-900')} />} size={10} />
      </Pressable>
      <Sheet
        ref={sheetRef}
        detents={[0.7]}
        scrollable
        onDismiss={() => {
          setIsOpen(false);
          setQuery('');
        }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={tailwind.style('pb-6')}>
          <Text
            style={tailwind.style(
              'px-6 pt-1 pb-2.5 text-[17px] font-inter-semibold-20 text-gray-950',
            )}>
            {attribute.attributeDisplayName}
          </Text>
          {options.length > SEARCHABLE_OPTION_COUNT ? (
            <View
              style={tailwind.style(
                'mx-4 mb-2 h-11 px-4 rounded-full bg-gray-100 flex-row items-center gap-2.5',
              )}>
              <Icon icon={<SearchIcon stroke={tailwind.color('text-gray-700')} />} size={16} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.SEARCH_OPTIONS', {
                  count: options.length,
                })}
                placeholderTextColor={tailwind.color('text-gray-700')}
                style={tailwind.style('flex-1 p-0 text-[15px] font-inter-420-20 text-gray-950')}
              />
            </View>
          ) : null}
          {visibleOptions.map(option => {
            const isSelected = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => select(option)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                style={({ pressed }) =>
                  tailwind.style(
                    'h-[52px] px-6 flex-row items-center gap-4',
                    pressed && 'bg-gray-100',
                  )
                }>
                <View
                  style={tailwind.style(
                    'h-5 w-5 rounded-full border-2 items-center justify-center',
                    isSelected ? 'border-blue-800' : 'border-gray-700',
                  )}>
                  {isSelected ? (
                    <View style={tailwind.style('h-2.5 w-2.5 rounded-full bg-blue-800')} />
                  ) : null}
                </View>
                <Text style={tailwind.style('flex-1 text-base font-inter-420-20 text-gray-950')}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </>
  );
};

const CheckboxField = ({ value, error, onChange }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  return (
    <View
      style={tailwind.style(
        'h-10 flex-row rounded-full border overflow-hidden',
        error ? 'border-ruby-800' : 'border-gray-500',
      )}>
      {[true, false].map(option => {
        const isSelected = value === option;
        return (
          <Pressable
            key={String(option)}
            onPress={() => onChange(option)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            style={tailwind.style(
              'flex-1 flex-row items-center justify-center gap-2',
              isSelected ? 'bg-blue-100' : '',
              option ? '' : error ? 'border-l border-l-ruby-800' : 'border-l border-l-gray-500',
            )}>
            {isSelected ? <Icon icon={<TickIcon />} size={14} /> : null}
            <Text
              style={tailwind.style(
                'text-sm font-inter-medium-24',
                isSelected ? 'text-blue-800' : 'text-gray-950',
              )}>
              {i18n.t(`CONVERSATION.REQUIRED_ATTRIBUTES.CHECKBOX.${option ? 'YES' : 'NO'}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const renderInput = (props: AttributeFieldProps) => {
  switch (props.attribute.attributeDisplayType) {
    case 'date':
      return <DateField {...props} />;
    case 'list':
      return <ListField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    default:
      return <TextField {...props} />;
  }
};

export const AndroidAttributeField = (props: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const { attribute, error, value } = props;
  const isEmpty = value === null || value === '';
  const supportText = error || (isEmpty ? attribute.regexCue : null);

  return (
    <View style={tailwind.style('gap-1.5')}>
      <Text style={tailwind.style('text-sm leading-[18px] font-inter-medium-24 text-gray-950')}>
        {attribute.attributeDisplayName}
      </Text>
      {renderInput(props)}
      {supportText ? (
        <Text
          style={tailwind.style(
            'px-1 text-xs leading-4 font-inter-420-20',
            error ? 'text-ruby-800' : 'text-gray-900',
          )}>
          {supportText}
        </Text>
      ) : null}
    </View>
  );
};
