import type { Inbox } from '@/types/Inbox';

import { sortInboxesByName } from '../inboxSortUtils';

describe('sortInboxesByName', () => {
  it('sorts inboxes alphabetically by name and then id', () => {
    expect(
      sortInboxesByName([
        { id: 3, name: 'Sales' },
        { id: 2, name: 'customer support' },
        { id: 1, name: 'Customer Support' },
      ] as Inbox[]).map(inbox => inbox.id),
    ).toEqual([1, 2, 3]);
  });
});
