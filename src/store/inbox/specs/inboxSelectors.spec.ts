import { selectAllInboxes, selectInboxById } from '../inboxSelectors';
import { RootState } from '@/store';
import { inbox } from './inboxMockData';

describe('Inbox Selectors', () => {
  const mockState = {
    inboxes: {
      ids: [inbox.id],
      entities: { [inbox.id]: inbox },
    },
  } as RootState;

  it('should select all inboxes', () => {
    expect(selectAllInboxes(mockState)).toEqual([inbox]);
  });

  it('should select inbox by id', () => {
    expect(selectInboxById(mockState, inbox.id)).toEqual(inbox);
  });
});
