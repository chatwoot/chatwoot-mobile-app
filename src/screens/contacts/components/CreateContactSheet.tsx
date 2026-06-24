import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';

import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { BottomSheetHeader } from '@/components-next/common';
import i18n from '@/i18n';
import { ContactCompanySelectorSheet } from '@/screens/contact-details/components/ContactCompanySelectorSheet';
import type { CreateContactPayload } from '@/store/contact/contactTypes';
import { tailwind } from '@/theme';
import type { Company } from '@/types/Company';

type CreateContactSheetProps = {
  visible: boolean;
  isSaving: boolean;
  showCompanyField?: boolean;
  onClose: () => void;
  onCreate: (payload: CreateContactPayload) => void;
};

export const CreateContactSheet = ({
  visible,
  isSaving,
  showCompanyField = false,
  onClose,
  onCreate,
}: CreateContactSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySelectorVisible, setCompanySelectorVisible] = useState(false);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss({ overshootClamping: true });
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setPhoneNumber('');
    setEmail('');
    setSelectedCompany(null);
    setCompanySelectorVisible(false);
  };

  const handleCreate = () => {
    const trimmedName = name.trim();

    if (!trimmedName || isSaving) {
      return;
    }

    onCreate({
      name: trimmedName,
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      ...(showCompanyField && selectedCompany?.id ? { companyId: selectedCompany.id } : {}),
    });
  };

  const canCreate = !!name.trim() && !isSaving;

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        onDismiss={() => {
          resetForm();
          onClose();
        }}
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={[showCompanyField ? '64%' : '56%']}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('CONTACTS.CREATE_TITLE')} />
          <View style={tailwind.style('px-4 pt-3')}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={i18n.t('CONTACTS.NAME')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              autoCapitalize="words"
              autoCorrect={false}
              style={tailwind.style(
                'h-12 rounded-xl border border-gray-100 bg-gray-50 px-3 text-base font-inter-normal-20 text-gray-950',
              )}
            />
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={i18n.t('CONTACTS.PHONE')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoCorrect={false}
              style={tailwind.style(
                'mt-3 h-12 rounded-xl border border-gray-100 bg-gray-50 px-3 text-base font-inter-normal-20 text-gray-950',
              )}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={i18n.t('CONTACTS.EMAIL')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              style={tailwind.style(
                'mt-3 h-12 rounded-xl border border-gray-100 bg-gray-50 px-3 text-base font-inter-normal-20 text-gray-950',
              )}
            />
            {showCompanyField ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setCompanySelectorVisible(true)}
                style={({ pressed }) =>
                  tailwind.style(
                    'mt-3 h-12 rounded-xl border border-gray-100 bg-gray-50 px-3 justify-center',
                    pressed ? 'bg-gray-100' : '',
                  )
                }>
                <Animated.Text
                  numberOfLines={1}
                  style={tailwind.style(
                    'text-base font-inter-normal-20',
                    selectedCompany ? 'text-gray-950' : 'text-gray-700',
                  )}>
                  {selectedCompany?.name || i18n.t('CONTACTS.COMPANY')}
                </Animated.Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canCreate }}
              disabled={!canCreate}
              onPress={handleCreate}
              style={({ pressed }) =>
                tailwind.style(
                  'mt-5 h-12 rounded-xl items-center justify-center',
                  canCreate ? 'bg-blue-800' : 'bg-gray-100',
                  pressed && canCreate ? 'bg-blue-900' : '',
                )
              }>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-medium-24',
                  canCreate ? 'text-white' : 'text-gray-700',
                )}>
                {isSaving ? i18n.t('CONTACTS.CREATING') : i18n.t('CONTACTS.CREATE')}
              </Animated.Text>
            </Pressable>
          </View>
        </BottomSheetWrapper>
      </BottomSheetModal>
      {showCompanyField ? (
        <ContactCompanySelectorSheet
          visible={companySelectorVisible}
          selectedCompanyId={selectedCompany?.id}
          onSelect={setSelectedCompany}
          onClose={() => setCompanySelectorVisible(false)}
        />
      ) : null}
    </>
  );
};
