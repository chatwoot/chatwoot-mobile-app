import { selectAllContacts, selectContactById } from '../contactSelectors';
import { RootState } from '@/store';
import { contact } from './contactMockData';

describe('Contact Selectors', () => {
  const mockState = {
    contacts: {
      ids: [contact.id],
      entities: { [contact.id]: contact },
    },
  } as RootState;

  it('should select all contacts', () => {
    expect(selectAllContacts(mockState)).toEqual([contact]);
  });

  it('should select contact by id', () => {
    expect(selectContactById(mockState, contact.id)).toEqual(contact);
  });
});
