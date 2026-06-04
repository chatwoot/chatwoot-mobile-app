import { createSlice } from '@reduxjs/toolkit';

import type { Company, CompanyContact, CompanyNote } from '@/types/Company';
import { companyActions } from './companyActions';

export type CompanyState = {
  entities: Record<number, Company>;
  notesByCompanyId: Record<number, CompanyNote[]>;
  contactsByCompanyId: Record<number, CompanyContact[]>;
  isLoading: boolean;
};

const initialState: CompanyState = {
  entities: {},
  notesByCompanyId: {},
  contactsByCompanyId: {},
  isLoading: false,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(companyActions.getCompany.pending, state => {
        state.isLoading = true;
      })
      .addCase(companyActions.getCompany.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
        state.isLoading = false;
      })
      .addCase(companyActions.updateCompany.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(companyActions.getCompany.rejected, state => {
        state.isLoading = false;
      })
      .addCase(companyActions.getCompanyNotes.fulfilled, (state, action) => {
        state.notesByCompanyId[action.meta.arg.companyId] = action.payload;
      })
      .addCase(companyActions.getCompanyContacts.fulfilled, (state, action) => {
        state.contactsByCompanyId[action.meta.arg.companyId] = action.payload.payload;
      })
      .addCase(companyActions.createCompanyNote.fulfilled, (state, action) => {
        const { companyId } = action.meta.arg;
        state.notesByCompanyId[companyId] = [
          action.payload,
          ...(state.notesByCompanyId[companyId] || []),
        ];
      })
      .addCase(companyActions.updateCompanyNote.fulfilled, (state, action) => {
        const { companyId } = action.meta.arg;
        state.notesByCompanyId[companyId] = (state.notesByCompanyId[companyId] || []).map(note =>
          note.id === action.payload.id ? action.payload : note,
        );
      })
      .addCase(companyActions.deleteCompanyNote.fulfilled, (state, action) => {
        const { companyId, noteId } = action.payload;
        state.notesByCompanyId[companyId] = (state.notesByCompanyId[companyId] || []).filter(
          note => note.id !== noteId,
        );
      });
  },
});

export default companySlice.reducer;
