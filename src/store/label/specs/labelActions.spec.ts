import { labelActions } from '../labelActions';
import { mockLabelsResponse } from './labelMockData';
import { LabelService } from '../labelService';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/helpers/ToastHelper', () => ({
  showToast: jest.fn(),
}));

jest.mock('../labelService', () => ({
  LabelService: {
    getLabels: jest.fn(),
  },
}));

describe('labelActions', () => {
  it('should fetch labels successfully', async () => {
    (LabelService.getLabels as jest.Mock).mockResolvedValue(mockLabelsResponse.data);

    const dispatch = jest.fn();
    const getState = jest.fn();

    const result = await labelActions.fetchLabels()(dispatch, getState, {});

    expect(LabelService.getLabels).toHaveBeenCalled();
    expect(result.payload).toEqual(mockLabelsResponse.data);
  });
});
