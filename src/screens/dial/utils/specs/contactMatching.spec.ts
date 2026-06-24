import type { Contact } from '@/types/Contact';
import { findExactPhoneContact } from '../contactMatching';

const buildContact = (contact: Partial<Contact>): Contact =>
  ({
    additionalAttributes: {},
    createdAt: 0,
    customAttributes: {},
    email: null,
    identifier: null,
    lastActivityAt: null,
    name: null,
    phoneNumber: null,
    thumbnail: null,
    type: 'contact',
    ...contact,
  }) as Contact;

describe('contactMatching', () => {
  const sampleContact = buildContact({
    id: 1,
    name: 'Sample Contact',
    phoneNumber: '+1 202 555 0198',
  });

  it('matches a local ten digit number to a stored +1 contact number', () => {
    expect(findExactPhoneContact([sampleContact], '2025550198')).toBe(sampleContact);
  });
});
