import i18n from '@/i18n';
import type { Contact } from '@/types/Contact';
import { digitsOnly } from '@/screens/dial/utils/phoneNumberUtils';

const getStringValue = (value?: unknown) => (typeof value === 'string' ? value.trim() : '');

export const isUnknownContactValue = (value: string) =>
  /^(unknown)(\s+(unknown|contact))*$/i.test(value);

export const getContactDisplayValue = (contact: Contact) => {
  const customAttributes = contact.customAttributes || {};
  const displayCandidates = [
    contact.name,
    contact.email,
    contact.phoneNumber,
    contact.identifier,
    customAttributes.name,
    customAttributes.email,
    customAttributes.phoneNumber,
    customAttributes.phone_number,
  ];

  return displayCandidates
    .map(getStringValue)
    .find(value => value && !isUnknownContactValue(value));
};

export const getContactName = (contact: Contact) =>
  getContactDisplayValue(contact) ||
  i18n.t('CONTACTS.FALLBACK_NAME', { id: contact.id || i18n.t('CONTACTS.UNKNOWN') });

export const getContactSubtitle = (contact: Contact) =>
  [contact.email, contact.phoneNumber].filter(Boolean).join(' - ');

export const getContactPrimarySubtitle = (contact: Contact) =>
  contact.phoneNumber || contact.email || i18n.t('CONTACTS.NO_PHONE_NUMBER');

export const getCompanyName = (contact: Contact) =>
  contact.company?.name ||
  contact.companyName ||
  contact.additionalAttributes?.company?.name ||
  contact.additionalAttributes?.companyName;

export const getContactSearchText = (contact: Contact) =>
  [contact.name, contact.email, contact.phoneNumber, contact.identifier]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const getContactPhoneSearchText = (contact: Contact) =>
  digitsOnly(contact.phoneNumber || '');
