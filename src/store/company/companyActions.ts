import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  Company,
  CompanyContactsAPIResponse,
  CompanyNote,
  UpdateCompanyPayload,
} from '@/types/Company';
import { CompanyService } from './companyService';

export type CompanyPayload = {
  companyId: number;
};

export type CreateCompanyNotePayload = {
  companyId: number;
  content: string;
};

export type UpdateCompanyActionPayload = {
  companyId: number;
  company: UpdateCompanyPayload;
};

export type UpdateCompanyNotePayload = {
  companyId: number;
  noteId: number;
  content: string;
};

export type DeleteCompanyNotePayload = {
  companyId: number;
  noteId: number;
};

export const companyActions = {
  getCompany: createAsyncThunk<Company, CompanyPayload>(
    'company/getCompany',
    async ({ companyId }, { rejectWithValue }) => {
      try {
        const response = await CompanyService.getCompany(companyId);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  updateCompany: createAsyncThunk<Company, UpdateCompanyActionPayload>(
    'company/updateCompany',
    async ({ companyId, company }, { rejectWithValue }) => {
      try {
        const response = await CompanyService.updateCompany(companyId, company);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  getCompanyNotes: createAsyncThunk<CompanyNote[], CompanyPayload>(
    'company/getCompanyNotes',
    async ({ companyId }, { rejectWithValue }) => {
      try {
        const response = await CompanyService.getCompanyNotes(companyId);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  getCompanyContacts: createAsyncThunk<CompanyContactsAPIResponse, CompanyPayload>(
    'company/getCompanyContacts',
    async ({ companyId }, { rejectWithValue }) => {
      try {
        const response = await CompanyService.getCompanyContacts(companyId);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  createCompanyNote: createAsyncThunk<CompanyNote, CreateCompanyNotePayload>(
    'company/createCompanyNote',
    async ({ companyId, content }, { rejectWithValue }) => {
      try {
        const response = await CompanyService.createCompanyNote(companyId, content);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  updateCompanyNote: createAsyncThunk<CompanyNote, UpdateCompanyNotePayload>(
    'company/updateCompanyNote',
    async ({ companyId, noteId, content }, { rejectWithValue }) => {
      try {
        const response = await CompanyService.updateCompanyNote(companyId, noteId, content);
        return response.payload;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
  deleteCompanyNote: createAsyncThunk<DeleteCompanyNotePayload, DeleteCompanyNotePayload>(
    'company/deleteCompanyNote',
    async ({ companyId, noteId }, { rejectWithValue }) => {
      try {
        return await CompanyService.deleteCompanyNote(companyId, noteId);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
