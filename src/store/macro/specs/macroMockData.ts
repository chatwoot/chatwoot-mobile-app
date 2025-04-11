import type { Macro } from '@/types';

export const macro: Macro = {
  id: 1,
  name: 'Macro 1',
  hasChevron: true,
  actions: [],
};

export const mockMacrosResponse = {
  data: { payload: [macro] },
};
