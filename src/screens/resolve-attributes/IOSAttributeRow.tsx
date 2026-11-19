import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { Icon } from '@/components-next';
import { ChevronUpDownIcon } from '@/svg-icons';
import { useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';

import { formatDateValue, parseDateValue, toDateValue } from './dateValue';
import type { AttributeFieldProps } from './types';

const NAME = 'text-base leading-[22px] font-inter-420-20 text-gray-950';
const VALUE = 'text-base leading-[22px] font-inter-420-20';

const ErrorLine = ({ error }: { error: string }) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('flex-row items-center gap-1.5')}>
      <View
        style={tailwind.style('h-3.5 w-3.5 rounded-full bg-ruby-800 items-center justify-center')}>
        <Text
          style={tailwind.style('text-[10px] leading-[12px] font-inter-semibold-20 text-white')}>
          !
        </Text>
      </View>
      <Text
        style={tailwind.style('flex-1 text-[13px] leading-[18px] font-inter-420-20 text-ruby-800')}>
        {error}
      </Text>
    </View>
  );
};

const TextRow = ({ attribute, value, onChange, onBlur }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const type = attribute.attributeDisplayType;
  const isText = type === 'text';
  const inputRef = useRef<TextInput>(null);

  const input = (
    <TextInput
      ref={inputRef}
      value={typeof value === 'string' ? value : ''}
      onChangeText={onChange}
      onBlur={onBlur}
      multiline={isText}
      keyboardType={
        type === 'number' ? 'numbers-and-punctuation' : type === 'link' ? 'url' : 'default'
      }
      keyboardAppearance={tailwind.isDark ? 'dark' : 'light'}
      autoCapitalize={isText ? 'sentences' : 'none'}
      autoCorrect={isText}
      placeholder={i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.PLACEHOLDERS.REQUIRED')}
      placeholderTextColor={tailwind.color('text-gray-600')}
      style={tailwind.style(
        VALUE,
        'p-0 text-gray-950',
        isText ? 'min-h-[44px]' : 'flex-1 max-w-[58%] text-right',
      )}
      textAlignVertical={isText ? 'top' : 'center'}
    />
  );

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      accessible={false}
      style={tailwind.style(isText ? 'gap-1.5' : 'flex-row items-center gap-3')}>
      <Text style={tailwind.style(NAME, isText ? '' : 'flex-1')}>
        {attribute.attributeDisplayName}
      </Text>
      {input}
    </Pressable>
  );
};

const DateRow = ({ attribute, value, onChange }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateValue(value);

  return (
    <View>
      <View style={tailwind.style('flex-row items-center gap-3 -my-[5px]')}>
        <Text style={tailwind.style(NAME, 'flex-1')}>{attribute.attributeDisplayName}</Text>
        <Pressable
          onPress={() => setIsOpen(open => !open)}
          accessibilityRole="button"
          style={tailwind.style('h-[34px] px-[11px] rounded-[8px] bg-blackA-A5 justify-center')}>
          <Text
            style={tailwind.style(
              VALUE,
              isOpen ? 'text-blue-800' : selectedDate ? 'text-gray-950' : 'text-gray-900',
            )}>
            {selectedDate
              ? formatDateValue(selectedDate)
              : i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.PLACEHOLDERS.SELECT')}
          </Text>
        </Pressable>
      </View>
      {isOpen && (
        <View style={tailwind.style('mt-3 pt-1 border-t-[0.5px] border-t-blackA-A3')}>
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="inline"
            themeVariant={tailwind.isDark ? 'dark' : 'light'}
            onChange={(event, date) => {
              if (event.type === 'set' && date) {
                onChange(toDateValue(date));
                setIsOpen(false);
              }
            }}
          />
        </View>
      )}
    </View>
  );
};

// zeego Label types include web props.
const MenuItemTitle = DropdownMenu.ItemTitle as unknown as React.FC<{ children: string }>;

const ListRow = ({ attribute, value, onChange }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  const hasValue = typeof value === 'string' && value.length > 0;
  const color = tailwind.color(hasValue ? 'text-gray-900' : 'text-gray-600');

  return (
    <View style={tailwind.style('flex-row items-center gap-3')}>
      <Text style={tailwind.style(NAME, 'flex-1')}>{attribute.attributeDisplayName}</Text>
      <View style={tailwind.style('max-w-[58%]')}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <View accessibilityRole="button">
              <View style={tailwind.style('flex-row items-center gap-[5px]')}>
                <Text numberOfLines={1} style={[tailwind.style(VALUE, 'shrink'), { color }]}>
                  {hasValue
                    ? value
                    : i18n.t('CONVERSATION.REQUIRED_ATTRIBUTES.PLACEHOLDERS.CHOOSE')}
                </Text>
                <Icon icon={<ChevronUpDownIcon stroke={color} />} size={14} />
              </View>
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {(attribute.attributeValues || []).map(option => (
              <DropdownMenu.CheckboxItem
                key={option}
                value={value === option ? 'on' : 'off'}
                onValueChange={() => onChange(option)}>
                <DropdownMenu.ItemIndicator />
                <MenuItemTitle>{option}</MenuItemTitle>
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>
    </View>
  );
};

const CheckboxRow = ({ attribute, value, onChange }: AttributeFieldProps) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('flex-row items-center gap-3 -my-[3px]')}>
      <Text style={tailwind.style(NAME, 'flex-1')}>{attribute.attributeDisplayName}</Text>
      <View style={tailwind.style('w-[116px] flex-row rounded-[9px] p-0.5 bg-blackA-A5')}>
        {[true, false].map(option => {
          const isSelected = value === option;
          return (
            <Pressable
              key={String(option)}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[
                tailwind.style(
                  'flex-1 h-7 rounded-[7px] items-center justify-center',
                  isSelected ? (tailwind.isDark ? 'bg-gray-600' : 'bg-white') : '',
                ),
                isSelected ? styles.segmentShadow : null,
              ]}>
              <Text style={tailwind.style('text-[13px] font-inter-medium-24 text-gray-950')}>
                {i18n.t(`CONVERSATION.REQUIRED_ATTRIBUTES.CHECKBOX.${option ? 'YES' : 'NO'}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const renderRow = (props: AttributeFieldProps) => {
  switch (props.attribute.attributeDisplayType) {
    case 'date':
      return <DateRow {...props} />;
    case 'list':
      return <ListRow {...props} />;
    case 'checkbox':
      return <CheckboxRow {...props} />;
    default:
      return <TextRow {...props} />;
  }
};

export const IOSAttributeRow = (props: AttributeFieldProps & { isLast: boolean }) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('pl-4')}>
      <View
        style={tailwind.style(
          'py-[11px] pr-4 gap-1.5',
          props.isLast ? '' : 'border-b-[0.5px] border-b-blackA-A3',
        )}>
        {renderRow(props)}
        {props.error ? <ErrorLine error={props.error} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
  },
});
