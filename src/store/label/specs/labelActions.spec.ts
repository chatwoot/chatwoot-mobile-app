import { labelActions } from '../labelActions';
import { mockLabelsResponse } from './labelMockData';
import { LabelService } from '../labelService';
import { transformLabel } from '@/utils/camelCaseKeys';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../labelService', () => ({
  LabelService: {
    index: jest.fn(),
  },
}));

describe('labelActions', () => {
  it('should fetch labels successfully', async () => {
    const transformedResponse = {
      payload: mockLabelsResponse.data.payload.map(transformLabel),
    };
    (LabelService.index as jest.Mock).mockResolvedValue(transformedResponse);

    const dispatch = jest.fn();
    const getState = jest.fn();

    const result = await labelActions.fetchLabels()(dispatch, getState, {});

    expect(LabelService.index).toHaveBeenCalled();
    expect(result.payload).toEqual(transformedResponse);
  });
});
