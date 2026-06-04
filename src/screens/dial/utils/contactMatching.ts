import type { Contact } from '@/types/Contact';
import { normalizeDialedNumber } from './phoneNumberUtils';

export const findExactPhoneContact = (contacts: Contact[], number: string) => {
  const normalizedNumber = normalizeDialedNumber(number);

  if (!normalizedNumber) {
    return undefined;
  }

  return contacts.find(contact => {
    if (!contact.phoneNumber) {
      return false;
    }

    return normalizeDialedNumber(contact.phoneNumber) === normalizedNumber;
  });
};
