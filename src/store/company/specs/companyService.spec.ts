import { CompanyService } from '../companyService';
import { apiService } from '@/services/APIService';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('CompanyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get companies sorted by name', async () => {
    const response = {
      data: {
        meta: { total_count: 2, page: 1 },
        payload: [
          { id: 1, name: 'Acme', domain: 'acme.test', contacts_count: 3 },
          { id: 2, name: 'Beacon', domain: 'beacon.test', contacts_count: 1 },
        ],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.getCompanies({ page: 1 });

    expect(apiService.get).toHaveBeenCalledWith('companies', {
      params: {
        page: 1,
        sort: 'name',
      },
    });
    expect(result).toEqual({
      meta: { totalCount: 2, page: 1 },
      payload: [
        { id: 1, name: 'Acme', domain: 'acme.test', contactsCount: 3 },
        { id: 2, name: 'Beacon', domain: 'beacon.test', contactsCount: 1 },
      ],
    });
  });

  it('should search companies', async () => {
    const response = {
      data: {
        meta: { total_count: 1, page: 2 },
        payload: [{ id: 1, name: 'Acme' }],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.getCompanies({ page: 2, query: 'Acme' });

    expect(apiService.get).toHaveBeenCalledWith('companies/search', {
      params: {
        page: 2,
        sort: 'name',
        q: 'Acme',
      },
    });
    expect(result).toEqual({
      meta: { totalCount: 1, page: 2 },
      payload: [{ id: 1, name: 'Acme' }],
    });
  });

  it('should get company details', async () => {
    const response = {
      data: {
        payload: {
          id: 1,
          name: 'Acme',
          custom_attributes: { plan: 'enterprise' },
        },
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.getCompany(1);

    expect(apiService.get).toHaveBeenCalledWith('companies/1');
    expect(result).toEqual({
      payload: {
        id: 1,
        name: 'Acme',
        customAttributes: { plan: 'enterprise' },
      },
    });
  });

  it('should update company details', async () => {
    const response = {
      data: {
        payload: {
          id: 1,
          name: 'Acme Updated',
          domain: 'acme.test',
          description: 'Enterprise customer',
          contacts_count: 4,
        },
      },
    };
    (apiService.patch as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.updateCompany(1, {
      name: 'Acme Updated',
      domain: 'acme.test',
      description: 'Enterprise customer',
    });

    expect(apiService.patch).toHaveBeenCalledWith(
      'companies/1',
      {
        company: {
          name: 'Acme Updated',
          domain: 'acme.test',
          description: 'Enterprise customer',
        },
      },
      undefined,
    );
    expect(result).toEqual({
      payload: {
        id: 1,
        name: 'Acme Updated',
        domain: 'acme.test',
        description: 'Enterprise customer',
        contactsCount: 4,
      },
    });
  });

  it('should get company notes', async () => {
    const response = {
      data: {
        payload: [{ id: 1, content: 'Important account', created_at: 1717320000 }],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.getCompanyNotes(1);

    expect(apiService.get).toHaveBeenCalledWith('companies/1/notes');
    expect(result).toEqual({
      payload: [{ id: 1, content: 'Important account', createdAt: 1717320000 }],
    });
  });

  it('should get company contacts', async () => {
    const response = {
      data: {
        payload: [{ id: 1, name: 'Example Customer', phone_number: '+12025550198' }],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.getCompanyContacts(1);

    expect(apiService.get).toHaveBeenCalledWith('companies/1/contacts');
    expect(result).toEqual({
      payload: [{ id: 1, name: 'Example Customer', phoneNumber: '+12025550198' }],
    });
  });

  it('should get company contacts count from contacts metadata', async () => {
    const response = {
      data: {
        meta: { total_count: 15, page: 1 },
        payload: [{ id: 1, name: 'Example Customer' }],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.getCompanyContactsCount(1);

    expect(apiService.get).toHaveBeenCalledWith('companies/1/contacts');
    expect(result).toEqual(15);
  });

  it('should attach a contact to a company', async () => {
    const response = {
      data: {
        payload: {
          id: 7,
          name: 'Example Customer',
          company_id: 1,
          company: { id: 1, name: 'Acme' },
          additional_attributes: { company_name: 'Acme' },
        },
      },
    };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.attachContactToCompany(1, 7);

    expect(apiService.post).toHaveBeenCalledWith('companies/1/contacts', {
      contact_id: 7,
    });
    expect(result).toEqual({
      id: 7,
      name: 'Example Customer',
      companyId: 1,
      company: { id: 1, name: 'Acme' },
      additionalAttributes: { companyName: 'Acme' },
    });
  });

  it('should create a company note', async () => {
    const response = { data: { payload: { id: 1, content: 'New note' } } };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.createCompanyNote(1, 'New note');

    expect(apiService.post).toHaveBeenCalledWith('companies/1/notes', { content: 'New note' });
    expect(result).toEqual(response.data);
  });

  it('should update a company note', async () => {
    const response = { data: { payload: { id: 2, content: 'Updated note' } } };
    (apiService.patch as jest.Mock).mockResolvedValueOnce(response);

    const result = await CompanyService.updateCompanyNote(1, 2, 'Updated note');

    expect(apiService.patch).toHaveBeenCalledWith('companies/1/notes/2', {
      content: 'Updated note',
    });
    expect(result).toEqual(response.data);
  });

  it('should delete a company note', async () => {
    (apiService.delete as jest.Mock).mockResolvedValueOnce({});

    const result = await CompanyService.deleteCompanyNote(1, 2);

    expect(apiService.delete).toHaveBeenCalledWith('companies/1/notes/2');
    expect(result).toEqual({ companyId: 1, noteId: 2 });
  });
});
