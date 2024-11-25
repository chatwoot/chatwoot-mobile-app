import type { RootState } from '@/store';
import { inboxAdapter } from './inboxSlice';

export const selectInboxesState = (state: RootState) => state.inboxes;

export const { selectAll: selectAllInboxes } =
  inboxAdapter.getSelectors<RootState>(selectInboxesState);

export const selectInboxById = (state: RootState, inboxId: number) =>
  selectAllInboxes(state).find(inbox => inbox.id === inboxId);
