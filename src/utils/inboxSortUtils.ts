import type { Inbox } from '@/types/Inbox';

export const sortInboxesByName = (inboxes: Inbox[]) =>
  [...inboxes].sort((left, right) => {
    const byName = left.name.localeCompare(right.name, undefined, {
      sensitivity: 'base',
    });

    return byName || left.id - right.id;
  });
