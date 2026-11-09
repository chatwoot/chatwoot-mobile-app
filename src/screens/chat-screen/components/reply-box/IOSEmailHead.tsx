import { useTailwind } from '@/theme/useTailwind';
import { useEffect, useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import i18n from '@/i18n';

import { LABEL, VALUE, ROW } from './emailHeadStyles';
import { RemoveRowButton } from './RemoveRowButton';
import { IOSField } from './IOSField';
import type { EmailMetaProps } from './ReplyEmailHead';

export const IOSEmailHead = (props: EmailMetaProps) => {
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
