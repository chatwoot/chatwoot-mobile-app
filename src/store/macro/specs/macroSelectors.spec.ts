import { RootState } from '@/store';
import { selectAllMacros } from '../macroSelectors';
import { macro } from './macroMockData';

describe('Macro Selectors', () => {
  const mockState = {
    macros: {
      ids: [macro.id],
      entities: { [macro.id]: macro },
    },
  } as RootState;

  it('should select all macros', () => {
    expect(selectAllMacros(mockState)).toEqual([macro]);
  });
});
