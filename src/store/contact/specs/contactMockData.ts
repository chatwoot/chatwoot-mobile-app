import type { Contact } from '@/types';

export const contact: Contact = {
  id: 1,
  availabilityStatus: 'online',
  email: null,
  name: 'Leo Das',
  phoneNumber: '+2323242242',
  identifier: null,
  thumbnail: null,
  customAttributes: {},
  additionalAttributes: {},
  lastActivityAt: 1732159896,
  createdAt: 1728033836,
  type: 'user',
};

export const conversation = {
  meta: {
    sender: contact,
  },
};

export const mockContactLabelsResponse = { data: { payload: ['label1', 'label2'] } };
