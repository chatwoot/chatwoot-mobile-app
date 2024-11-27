import { RootState } from '@/store';
import { label1 } from './labelMockData';
import { selectAllLabels } from '../labelSelectors';

describe('Label Selectors', () => {
  const mockState = {
    labels: {
      ids: [label1.id],
      entities: { [label1.id]: label1 },
    },
  } as RootState;

  it('should select all labels', () => {
    expect(selectAllLabels(mockState)).toEqual([label1]);
  });
});
