import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import Animated from 'react-native-reanimated';

import { AttributeList, Avatar, Button } from '@/components-next';
import i18n from '@/i18n';
import type { AttributeListType } from '@/types';
import type { Company, UpdateCompanyPayload } from '@/types/Company';
import { tailwind } from '@/theme';
import { getCompanyAvatarUrl } from '@/utils/companyUtils';

type CompanyDetailsTabProps = {
  company?: Company | null;
  isSaving?: boolean;
  onSave: (company: UpdateCompanyPayload) => Promise<void>;
};

type CompanyFormState = {
  name: string;
  domain: string;
  description: string;
  avatar?: Asset;
};

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const recordToAttributes = (record?: Record<string, unknown>) => {
  if (!record) {
    return [];
  }

  return Object.entries(record).reduce<AttributeListType[]>((result, [key, value]) => {
    const subtitle = stringifyValue(value);
    if (subtitle) {
      result.push({
        title: key,
        subtitle,
        subtitleType: 'dark',
        type: 'text',
      });
    }
    return result;
  }, []);
};

const companyToFormState = (company?: Company | null): CompanyFormState => ({
  name: company?.name || '',
  domain: company?.domain || '',
  description: company?.description || '',
});

const textInputStyles =
  'rounded-[13px] border border-gray-100 bg-gray-50 px-4 py-3 text-base font-inter-normal-20 leading-[22px] text-gray-950';

export const CompanyDetailsTab = ({
  company,
  isSaving = false,
  onSave,
}: CompanyDetailsTabProps) => {
  const [form, setForm] = React.useState<CompanyFormState>(() => companyToFormState(company));
  const customAttributes = recordToAttributes(company?.customAttributes);
  const additionalAttributes = recordToAttributes(company?.additionalAttributes);
  const avatarUri = form.avatar?.uri || getCompanyAvatarUrl(company) || undefined;
  const canSave = form.name.trim().length > 0 && !isSaving;

  React.useEffect(() => {
    setForm(companyToFormState(company));
  }, [company]);

  const updateForm = (field: 'name' | 'domain' | 'description', value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const chooseAvatar = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
      selectionLimit: 1,
      presentationStyle: 'formSheet',
    });

    if (result.didCancel || !result.assets?.[0]?.uri) {
      return;
    }

    setForm(current => ({ ...current, avatar: result.assets?.[0] }));
  };

  const saveCompany = async () => {
    if (!canSave) {
      return;
    }

    const avatar = form.avatar?.uri
      ? {
          uri: form.avatar.uri,
          name: form.avatar.fileName || `company-${company?.id || 'avatar'}.jpg`,
          type: form.avatar.type || 'image/jpeg',
        }
      : undefined;

    await onSave({
      name: form.name.trim(),
      domain: form.domain.trim(),
      description: form.description.trim(),
      avatar,
    });
  };

  return (
    <Animated.View style={tailwind.style('px-4 pt-4')}>
      <Animated.View style={tailwind.style('rounded-[13px] bg-white p-4 shadow-xs')}>
        <Pressable
          accessibilityRole="button"
          onPress={chooseAvatar}
          style={tailwind.style('items-center pb-4')}>
          <Avatar
            size="4xl"
            src={avatarUri ? { uri: avatarUri } : undefined}
            name={form.name || company?.name || 'Company'}
          />
          <Animated.Text style={tailwind.style('pt-2 text-sm font-inter-420-20 text-blue-700')}>
            {i18n.t('COMPANIES.CHANGE_AVATAR')}
          </Animated.Text>
        </Pressable>
        <View style={tailwind.style('gap-3')}>
          <View>
            <Animated.Text style={tailwind.style('pb-2 text-sm font-inter-420-20 text-gray-700')}>
              {i18n.t('COMPANIES.NAME')}
            </Animated.Text>
            <TextInput
              value={form.name}
              onChangeText={value => updateForm('name', value)}
              placeholder={i18n.t('COMPANIES.NAME')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              style={tailwind.style(textInputStyles)}
            />
          </View>
          <View>
            <Animated.Text style={tailwind.style('pb-2 text-sm font-inter-420-20 text-gray-700')}>
              {i18n.t('COMPANIES.DOMAIN')}
            </Animated.Text>
            <TextInput
              value={form.domain}
              onChangeText={value => updateForm('domain', value)}
              placeholder={i18n.t('COMPANIES.DOMAIN')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={tailwind.style(textInputStyles)}
            />
          </View>
          <View>
            <Animated.Text style={tailwind.style('pb-2 text-sm font-inter-420-20 text-gray-700')}>
              {i18n.t('COMPANIES.DESCRIPTION')}
            </Animated.Text>
            <TextInput
              value={form.description}
              onChangeText={value => updateForm('description', value)}
              placeholder={i18n.t('COMPANIES.DESCRIPTION_PLACEHOLDER')}
              placeholderTextColor={tailwind.color('text-gray-700')}
              multiline
              textAlignVertical="top"
              maxLength={280}
              style={tailwind.style(`${textInputStyles} min-h-[120px]`)}
            />
            <Animated.Text
              style={tailwind.style('pt-1 text-right text-xs font-inter-normal-20 text-gray-700')}>
              {form.description.length} / 280
            </Animated.Text>
          </View>
          <Button
            text={i18n.t('COMPANIES.UPDATE_COMPANY')}
            handlePress={saveCompany}
            disabled={!canSave}
          />
        </View>
      </Animated.View>
      {customAttributes.length > 0 ? (
        <Animated.View style={tailwind.style('pt-10')}>
          <AttributeList
            sectionTitle={i18n.t('COMPANIES.COMPANY_ATTRIBUTES')}
            list={customAttributes}
          />
        </Animated.View>
      ) : null}
      {additionalAttributes.length > 0 ? (
        <Animated.View style={tailwind.style('pt-10')}>
          <AttributeList
            sectionTitle={i18n.t('COMPANIES.ADDITIONAL_ATTRIBUTES')}
            list={additionalAttributes}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};
