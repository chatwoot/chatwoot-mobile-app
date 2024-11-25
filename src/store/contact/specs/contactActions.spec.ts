import { contactActions } from '../contactActions';
import { ContactService } from '../contactService';
import { mockContactLabelsResponse } from './contactMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/helpers/ToastHelper', () => ({
  showToast: jest.fn(),
}));

jest.mock('../contactService', () => ({
  ContactService: {
    getContactLabels: jest.fn(),
  },
}));

describe('contactActions', () => {
  it('should return the getContactLabels action', async () => {
    (ContactService.getContactLabels as jest.Mock).mockResolvedValue(
      mockContactLabelsResponse.data,
    );
    const dispatch = jest.fn();
    const getState = jest.fn();
    const payload = { contactId: 1 };

    const result = await contactActions.getContactLabels(payload)(dispatch, getState, undefined);
    expect(ContactService.getContactLabels).toHaveBeenCalledWith(payload);
    expect(result.payload).toEqual({
      contactId: 1,
      labels: ['label1', 'label2'],
    });
  });
});
