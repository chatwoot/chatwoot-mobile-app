import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Contact } from '@/types';
import { ContactService } from './contactService';

import {
  CreateContactPayload,
  ContactListAPIResponse,
  ContactListPayload,
  ContactLabelsPayload,
  ContactNote,
  ContactNotePayload,
  CreateContactNotePayload,
  DeleteContactNotePayload,
  MergeContactsPayload,
  StartContactCallPayload,
  UpdateContactNotePayload,
} from './contactTypes';

export const contactActions = {
  createContact: createAsyncThunk<Contact, CreateContactPayload>(
    'contact/createContact',
    async (payload, { rejectWithValue }) => {
      try {
        return await ContactService.createContact(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  getContacts: createAsyncThunk<ContactListAPIResponse, ContactListPayload | undefined>(
    'contact/getContacts',
    async (payload, { rejectWithValue }) => {
      try {
        return await ContactService.getContacts(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  getContactLabels: createAsyncThunk<
    {
      contactId: number;
      labels: string[];
    },
    ContactLabelsPayload
  >('contact/getContactLabels', async (payload, { rejectWithValue }) => {
    try {
      const response = await ContactService.getContactLabels(payload);
      const { payload: labels } = response;
      return { contactId: payload.contactId, labels };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      return rejectWithValue(message);
    }
  }),
  getContactNotes: createAsyncThunk<ContactNote[], ContactNotePayload>(
    'contact/getContactNotes',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ContactService.getContactNotes(payload);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  createContactNote: createAsyncThunk<ContactNote, CreateContactNotePayload>(
    'contact/createContactNote',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ContactService.createContactNote(payload);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  updateContactNote: createAsyncThunk<ContactNote, UpdateContactNotePayload>(
    'contact/updateContactNote',
    async (payload, { rejectWithValue }) => {
      try {
        const response = await ContactService.updateContactNote(payload);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  deleteContactNote: createAsyncThunk<DeleteContactNotePayload, DeleteContactNotePayload>(
    'contact/deleteContactNote',
    async (payload, { rejectWithValue }) => {
      try {
        return await ContactService.deleteContactNote(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  startContactCall: createAsyncThunk<void, StartContactCallPayload>(
    'contact/startContactCall',
    async (payload, { rejectWithValue }) => {
      try {
        await ContactService.startContactCall(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  mergeContacts: createAsyncThunk<void, MergeContactsPayload>(
    'contact/mergeContacts',
    async (payload, { rejectWithValue }) => {
      try {
        await ContactService.mergeContacts(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
