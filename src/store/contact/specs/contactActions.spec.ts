import { contactActions } from '../contactActions';
import { ContactService } from '../contactService';
import { mockContactLabelsResponse } from './contactMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../contactService', () => ({
  ContactService: {
    getContactLabels: jest.fn(),
  },
}));

describe('contactActions', () => {
  it('should return the getContactLabels action', async () => {
    (ContactService.getContactLabels as jest.Mock).mockResolvedValue(mockContactLabelsResponse);
    const dispatch = jest.fn();
    const getState = jest.fn();
    const payload = { contactId: 1 };

    await contactActions.getContactLabels(payload)(dispatch, getState, undefined);
    expect(ContactService.getContactLabels).toHaveBeenCalledWith(payload);
  });
});
