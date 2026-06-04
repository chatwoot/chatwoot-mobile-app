import { ContactService } from '../contactService';
import { apiService } from '@/services/APIService';
import { mockContactLabelsResponse } from './contactMockData';

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
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ContactService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get contact details', async () => {
    const response = {
      data: {
        payload: {
          id: 1,
          name: 'Example Customer',
          email: 'customer@example.test',
          phone_number: '+12025550198',
          additional_attributes: { company_name: 'Acme' },
        },
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.getContact(1);

    expect(apiService.get).toHaveBeenCalledWith('contacts/1', {
      params: {
        include_contact_inboxes: false,
      },
    });
    expect(result).toEqual({
      id: 1,
      name: 'Example Customer',
      email: 'customer@example.test',
      phoneNumber: '+12025550198',
      additionalAttributes: { companyName: 'Acme' },
    });
  });

  it('should get contacts sorted by name', async () => {
    const response = {
      data: {
        meta: { count: 1, current_page: 1 },
        payload: [
          {
            id: 1,
            name: 'Example Customer',
            phone_number: '+12025550198',
            additional_attributes: { company_name: 'Acme' },
          },
        ],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.getContacts({ page: 1, sort: 'name' });

    expect(apiService.get).toHaveBeenCalledWith('contacts', {
      params: {
        include_contact_inboxes: false,
        page: 1,
        sort: 'name',
      },
    });
    expect(result).toEqual({
      meta: { count: 1, currentPage: 1 },
      payload: [
        {
          id: 1,
          name: 'Example Customer',
          phoneNumber: '+12025550198',
          additionalAttributes: { companyName: 'Acme' },
        },
      ],
    });
  });

  it('should search contacts when a query is provided', async () => {
    const response = {
      data: {
        meta: { count: 1, has_more: false },
        payload: [{ id: 2, name: 'Sample Contact', email: 'sample@example.test' }],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.getContacts({ page: 2, query: 'Sample', sort: 'name' });

    expect(apiService.get).toHaveBeenCalledWith('contacts/search', {
      params: {
        include_contact_inboxes: false,
        page: 2,
        sort: 'name',
        q: 'Sample',
      },
    });
    expect(result).toEqual({
      meta: { count: 1, hasMore: false },
      payload: [{ id: 2, name: 'Sample Contact', email: 'sample@example.test' }],
    });
  });

  it('should create a contact with a phone number', async () => {
    const response = {
      data: {
        payload: {
          contact: {
            id: 99,
            name: '+12025550198',
            phone_number: '+12025550198',
          },
        },
      },
    };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.createContact({
      name: '+12025550198',
      phoneNumber: '+12025550198',
    });

    expect(apiService.post).toHaveBeenCalledWith('contacts', {
      name: '+12025550198',
      phone_number: '+12025550198',
    });
    expect(result).toEqual({
      id: 99,
      name: '+12025550198',
      phoneNumber: '+12025550198',
    });
  });

  it('should create a contact with optional email', async () => {
    const response = {
      data: {
        payload: {
          contact: {
            id: 100,
            name: 'Example Customer',
            email: 'customer@example.test',
          },
        },
      },
    };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.createContact({
      name: 'Example Customer',
      email: 'customer@example.test',
    });

    expect(apiService.post).toHaveBeenCalledWith('contacts', {
      name: 'Example Customer',
      email: 'customer@example.test',
    });
    expect(result).toEqual({
      id: 100,
      name: 'Example Customer',
      email: 'customer@example.test',
    });
  });

  it('should create a contact with a company id', async () => {
    const response = {
      data: {
        payload: {
          contact: {
            id: 101,
            name: 'Example Customer',
            company_id: 12,
            company: {
              id: 12,
              name: 'Acme',
            },
          },
        },
      },
    };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.createContact({
      name: 'Example Customer',
      companyId: 12,
    });

    expect(apiService.post).toHaveBeenCalledWith('contacts', {
      name: 'Example Customer',
      company_id: 12,
    });
    expect(result).toEqual({
      id: 101,
      name: 'Example Customer',
      companyId: 12,
      company: {
        id: 12,
        name: 'Acme',
      },
    });
  });

  it('should get contact labels', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce(mockContactLabelsResponse);

    const result = await ContactService.getContactLabels({ contactId: 1 });
    expect(apiService.get).toHaveBeenCalledWith('contacts/1/labels');
    expect(result).toEqual(mockContactLabelsResponse.data);
  });

  it('should get contactable inboxes', async () => {
    const response = {
      data: {
        payload: [
          {
            inbox: {
              id: 10,
              name: 'DM (Phone)',
              channel_type: 'Channel::Api',
              phone_number: '+12025550198',
            },
            source_id: '+12025550198',
          },
        ],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.getContactableInboxes(1);

    expect(apiService.get).toHaveBeenCalledWith('contacts/1/contactable_inboxes');
    expect(result).toEqual({
      payload: [
        {
          id: 10,
          name: 'DM (Phone)',
          channelType: 'Channel::Api',
          phoneNumber: '+12025550198',
          sourceId: '+12025550198',
        },
      ],
    });
  });

  it('should get contact notes', async () => {
    const response = {
      data: {
        payload: [
          {
            id: 1,
            content: 'Follow up next week',
            created_at: 1717320000,
          },
        ],
      },
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.getContactNotes({ contactId: 1 });

    expect(apiService.get).toHaveBeenCalledWith('contacts/1/notes');
    expect(result).toEqual({
      payload: [
        {
          id: 1,
          content: 'Follow up next week',
          createdAt: 1717320000,
        },
      ],
    });
  });

  it('should normalize contact notes returned as a raw array', async () => {
    const response = {
      data: [
        {
          id: 1,
          content: 'Follow up next week',
          created_at: 1717320000,
        },
      ],
    };
    (apiService.get as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.getContactNotes({ contactId: 1 });

    expect(apiService.get).toHaveBeenCalledWith('contacts/1/notes');
    expect(result).toEqual({
      payload: [
        {
          id: 1,
          content: 'Follow up next week',
          createdAt: 1717320000,
        },
      ],
    });
  });

  it('should create a contact note', async () => {
    const response = { data: { payload: { id: 1, content: 'New note' } } };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.createContactNote({ contactId: 1, content: 'New note' });

    expect(apiService.post).toHaveBeenCalledWith('contacts/1/notes', { content: 'New note' });
    expect(result).toEqual(response.data);
  });

  it('should normalize a created contact note returned without payload', async () => {
    const response = { data: { id: 1, content: 'New note' } };
    (apiService.post as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.createContactNote({ contactId: 1, content: 'New note' });

    expect(apiService.post).toHaveBeenCalledWith('contacts/1/notes', { content: 'New note' });
    expect(result).toEqual({ payload: response.data });
  });

  it('should update a contact note', async () => {
    const response = { data: { payload: { id: 2, content: 'Updated note' } } };
    (apiService.patch as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.updateContactNote({
      contactId: 1,
      noteId: 2,
      content: 'Updated note',
    });

    expect(apiService.patch).toHaveBeenCalledWith('contacts/1/notes/2', {
      content: 'Updated note',
    });
    expect(result).toEqual(response.data);
  });

  it('should normalize an updated contact note returned without payload', async () => {
    const response = { data: { id: 2, content: 'Updated note' } };
    (apiService.patch as jest.Mock).mockResolvedValueOnce(response);

    const result = await ContactService.updateContactNote({
      contactId: 1,
      noteId: 2,
      content: 'Updated note',
    });

    expect(apiService.patch).toHaveBeenCalledWith('contacts/1/notes/2', {
      content: 'Updated note',
    });
    expect(result).toEqual({ payload: response.data });
  });

  it('should delete a contact note', async () => {
    (apiService.delete as jest.Mock).mockResolvedValueOnce({});

    const result = await ContactService.deleteContactNote({ contactId: 1, noteId: 2 });

    expect(apiService.delete).toHaveBeenCalledWith('contacts/1/notes/2');
    expect(result).toEqual({ contactId: 1, noteId: 2 });
  });

  it('should merge contacts', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({});

    await ContactService.mergeContacts({ baseContactId: 1, mergeeContactId: 2 });

    expect(apiService.post).toHaveBeenCalledWith('actions/contact_merge', {
      base_contact_id: 1,
      mergee_contact_id: 2,
    });
  });
});
