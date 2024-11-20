import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { contactAdapter } from './contactSlice';

export const selectContactsState = (state: RootState) => state.contacts;

export const { selectAll: selectAllContacts } =
  contactAdapter.getSelectors<RootState>(selectContactsState);

export const selectContactById = createSelector(
  [selectContactsState, (_state: RootState, contactId: number) => contactId],
  (contactsState, contactId) => contactsState.entities[contactId],
);

export const selectContacts = createSelector(selectContactsState, contactsState =>
  Object.values(contactsState.entities),
);
