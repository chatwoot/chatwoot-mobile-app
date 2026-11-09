import { useTailwind } from '@/theme/useTailwind';
import React, { useEffect, useState } from 'react';
import { Animated, TextInput, Text, Pressable, View } from 'react-native';
import i18n from '@/i18n';

import { Icon } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';

type EmailMetaProps = {
  ccEmails: string;
  bccEmails: string;
  toEmails: string;
  onUpdateCC: (ccEmails: string) => void;
  onUpdateBCC: (bccEmails: string) => void;
  onUpdateTo: (toEmails: string) => void;
  iosStyle?: boolean;
  contactEmail?: string;
};

type IOSFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accessory?: React.ReactNode;
};

const LABEL = 'text-[17px] leading-[22px] font-inter-normal-20 text-gray-700 mr-1.5';
const VALUE = 'text-[17px] leading-[22px] font-inter-normal-20 text-gray-950';
const ROW = 'flex-row items-center min-h-11 pr-3 border-b-[0.5px] border-b-blackA-A6';

const IOSField = ({ label, value, onChange, accessory }: IOSFieldProps) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style(ROW)}>
      <Text style={tailwind.style(LABEL)}>{`${label}:`}</Text>
      <TextInput
        style={tailwind.style('flex-1 py-[11px] pr-2', VALUE)}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Emails separated by commas"
        placeholderTextColor={tailwind.color('text-gray-600')}
      />
      {accessory}
    </View>
  );
};

const RemoveRowButton = ({ onPress, label }: { onPress: () => void; label: string }) => {
  const tailwind = useTailwind();
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) =>
        tailwind.style('h-7 w-7 ml-1 items-center justify-center', pressed && 'opacity-50')
      }>
      <Icon size={16} icon={<CloseIcon strokeWidth={1.5} />} />
    </Pressable>
  );
};

const IOSEmailHead = (props: EmailMetaProps) => {
  const tailwind = useTailwind();
  const { ccEmails, bccEmails, toEmails, onUpdateCC, onUpdateBCC, onUpdateTo, contactEmail } =
    props;
  const [isCcOpen, setIsCcOpen] = useState(!!ccEmails || !!bccEmails);
  const [showBcc, setShowBcc] = useState(!!bccEmails);
  useEffect(() => {
    if (ccEmails || bccEmails) setIsCcOpen(true);
    if (bccEmails) setShowBcc(true);
  }, [ccEmails, bccEmails]);

  const removeCcAndBcc = () => {
    onUpdateCC('');
    onUpdateBCC('');
    setShowBcc(false);
    setIsCcOpen(false);
  };
  const removeBcc = () => {
    onUpdateBCC('');
    setShowBcc(false);
  };
  return (
    <View style={tailwind.style('pl-4')}>
      {toEmails ? (
        <IOSField
          label={i18n.t('CONVERSATION.EMAIL_HEAD.TO')}
          value={toEmails}
          onChange={onUpdateTo}
        />
      ) : contactEmail ? (
        <View style={tailwind.style(ROW)}>
          <Text style={tailwind.style(LABEL)}>{`${i18n.t('CONVERSATION.EMAIL_HEAD.TO')}:`}</Text>
          <Text numberOfLines={1} style={tailwind.style('flex-1 py-[11px]', VALUE)}>
            {contactEmail}
          </Text>
        </View>
      ) : null}
      {isCcOpen ? null : (
        <Pressable
          onPress={() => setIsCcOpen(true)}
          accessibilityRole="button"
          style={tailwind.style(ROW)}>
          <Text style={tailwind.style(LABEL)}>
            {`${i18n.t('CONVERSATION.EMAIL_HEAD.CC_BCC')}:`}
          </Text>
        </Pressable>
      )}
      {isCcOpen ? (
        <IOSField
          label={i18n.t('CONVERSATION.EMAIL_HEAD.CC')}
          value={ccEmails}
          onChange={onUpdateCC}
          accessory={
            <>
              {showBcc ? null : (
                <Pressable hitSlop={8} onPress={() => setShowBcc(true)} accessibilityRole="button">
                  <Text style={tailwind.style('text-[15px] font-inter-medium-24 text-blue-800')}>
                    {i18n.t('CONVERSATION.EMAIL_HEAD.BCC')}
                  </Text>
                </Pressable>
              )}
              <RemoveRowButton
                onPress={removeCcAndBcc}
                label={i18n.t('CONVERSATION.EMAIL_HEAD.REMOVE_CC')}
              />
            </>
          }
        />
      ) : null}
      {isCcOpen && showBcc ? (
        <IOSField
          label={i18n.t('CONVERSATION.EMAIL_HEAD.BCC')}
          value={bccEmails}
          onChange={onUpdateBCC}
          accessory={
            <RemoveRowButton
              onPress={removeBcc}
              label={i18n.t('CONVERSATION.EMAIL_HEAD.REMOVE_BCC')}
            />
          }
        />
      ) : null}
    </View>
  );
};

export const ReplyEmailHead = (props: EmailMetaProps) => {
  if (props.iosStyle) return <IOSEmailHead {...props} />;
  return <DefaultEmailHead {...props} />;
};

const DefaultEmailHead = (props: EmailMetaProps) => {
  const tailwind = useTailwind();
  const { ccEmails, bccEmails, toEmails, onUpdateCC, onUpdateBCC, onUpdateTo } = props;

  const [showBcc, setShowBcc] = useState(false);

  return (
    <Animated.View style={tailwind.style('flex flex-col mb-2')}>
      <Animated.View
        style={tailwind.style('flex flex-col gap-1 px-3 py-1 border-b border-b-blackA-A3')}>
        {toEmails && (
          <Animated.View style={tailwind.style('flex flex-row items-center gap-1 ')}>
            <Text
              style={tailwind.style(
                'text-md text-gray-950 font-inter-normal-20 tracking-[0.16px] min-w-[30px]',
              )}>
              {i18n.t('CONVERSATION.EMAIL_HEAD.TO')}
            </Text>
            <TextInput
              style={tailwind.style('flex-1 rounded-t-md pl-0 py-2 pr-2')}
              value={toEmails}
              onChangeText={onUpdateTo}
              placeholder="Emails separated by commas"
              placeholderTextColor={tailwind.color('text-gray-300')}
            />
          </Animated.View>
        )}
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex flex-row items-center gap-1 py-1 px-3 border-b border-b-blackA-A3',
        )}>
        <Text
          style={tailwind.style(
            'text-md text-gray-950 font-inter-normal-20 tracking-[0.16px] min-w-[30px]',
          )}>
          {i18n.t('CONVERSATION.EMAIL_HEAD.CC')}
        </Text>
        <TextInput
          style={tailwind.style('flex-1 rounded-t-md pl-0 py-2 pr-2')}
          value={ccEmails}
          onChangeText={onUpdateCC}
          placeholder="Emails separated by commas"
          placeholderTextColor={tailwind.color('text-gray-300')}
        />
        <Pressable style={tailwind.style('')} onPress={() => setShowBcc(!showBcc)}>
          <Animated.Text style={tailwind.style('text-blue-800')}>
            {i18n.t('CONVERSATION.EMAIL_HEAD.BCC')}
          </Animated.Text>
        </Pressable>
      </Animated.View>
      {showBcc && (
        <Animated.View
          style={tailwind.style(
            'flex flex-row items-center gap-1 px-3 border-b py-1 border-b-blackA-A3',
          )}>
          <Text
            style={tailwind.style(
              'text-md text-gray-950 font-inter-normal-20 tracking-[0.16px] min-w-[30px]',
            )}>
            {i18n.t('CONVERSATION.EMAIL_HEAD.BCC')}
          </Text>
          <TextInput
            style={tailwind.style('flex-1 rounded-t-md pl-0 py-2 pr-2')}
            value={bccEmails}
            onChangeText={onUpdateBCC}
            placeholder="Emails separated by commas"
            placeholderTextColor={tailwind.color('text-gray-300')}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};
