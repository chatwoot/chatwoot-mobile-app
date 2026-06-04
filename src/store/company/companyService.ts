import { apiService } from '@/services/APIService';
import type { Contact } from '@/types';
import type {
  CompanyAPIResponse,
  CompanyListAPIResponse,
  CompanyContactsAPIResponse,
  CompanyNoteAPIResponse,
  CompanyNotesAPIResponse,
  UpdateCompanyPayload,
} from '@/types/Company';
import {
  transformCompanyAPIResponse,
  transformCompanyContactsAPIResponse,
  transformCompanyListAPIResponse,
  transformCompanyNoteAPIResponse,
  transformCompanyNotesAPIResponse,
  transformContact,
} from '@/utils/camelCaseKeys';

export class CompanyService {
  static async getCompanies({
    page = 1,
    query = '',
    sort = 'name',
  }: {
    page?: number;
    query?: string;
    sort?: string;
  } = {}): Promise<CompanyListAPIResponse> {
    const trimmedQuery = query.trim();
    const response = await apiService.get<CompanyListAPIResponse>(
      trimmedQuery ? 'companies/search' : 'companies',
      {
        params: {
          page,
          sort,
          ...(trimmedQuery ? { q: trimmedQuery } : {}),
        },
      },
    );
    return transformCompanyListAPIResponse(response.data);
  }

  static async getCompany(companyId: number): Promise<CompanyAPIResponse> {
    const response = await apiService.get<CompanyAPIResponse>(`companies/${companyId}`);
    return transformCompanyAPIResponse(response.data);
  }

  static async updateCompany(
    companyId: number,
    company: UpdateCompanyPayload,
  ): Promise<CompanyAPIResponse> {
    const hasAvatar = !!company.avatar;
    const payload = hasAvatar
      ? CompanyService.buildCompanyFormData(company)
      : {
          company: {
            name: company.name,
            domain: company.domain || null,
            description: company.description || null,
          },
        };
    const response = await apiService.patch<CompanyAPIResponse>(
      `companies/${companyId}`,
      payload,
      hasAvatar ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
    );
    return transformCompanyAPIResponse(response.data);
  }

  private static buildCompanyFormData(company: UpdateCompanyPayload) {
    const formData = new FormData();
    formData.append('company[name]', company.name);
    formData.append('company[domain]', company.domain || '');
    formData.append('company[description]', company.description || '');

    if (company.avatar) {
      formData.append('company[avatar]', {
        uri: company.avatar.uri,
        name: company.avatar.name,
        type: company.avatar.type,
      } as unknown as Blob);
    }

    return formData;
  }

  static async getCompanyNotes(companyId: number): Promise<CompanyNotesAPIResponse> {
    const response = await apiService.get<CompanyNotesAPIResponse>(`companies/${companyId}/notes`);
    return transformCompanyNotesAPIResponse(response.data);
  }

  static async getCompanyContacts(companyId: number): Promise<CompanyContactsAPIResponse> {
    const response = await apiService.get<CompanyContactsAPIResponse>(
      `companies/${companyId}/contacts`,
    );
    return transformCompanyContactsAPIResponse(response.data);
  }

  static async getCompanyContactsCount(companyId: number): Promise<number> {
    const response = await CompanyService.getCompanyContacts(companyId);
    return response.meta?.totalCount ?? response.payload.length;
  }

  static async attachContactToCompany(companyId: number, contactId: number): Promise<Contact> {
    const response = await apiService.post<{ payload: Contact }>(
      `companies/${companyId}/contacts`,
      {
        contact_id: contactId,
      },
    );
    return transformContact(response.data.payload);
  }

  static async createCompanyNote(
    companyId: number,
    content: string,
  ): Promise<CompanyNoteAPIResponse> {
    const response = await apiService.post<CompanyNoteAPIResponse>(`companies/${companyId}/notes`, {
      content,
    });
    return transformCompanyNoteAPIResponse(response.data);
  }

  static async updateCompanyNote(
    companyId: number,
    noteId: number,
    content: string,
  ): Promise<CompanyNoteAPIResponse> {
    const response = await apiService.patch<CompanyNoteAPIResponse>(
      `companies/${companyId}/notes/${noteId}`,
      { content },
    );
    return transformCompanyNoteAPIResponse(response.data);
  }

  static async deleteCompanyNote(companyId: number, noteId: number) {
    await apiService.delete(`companies/${companyId}/notes/${noteId}`);
    return { companyId, noteId };
  }
}
