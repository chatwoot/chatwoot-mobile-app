import reducer, {
  setCurrentState,
  setSearchTerm,
  setBottomSheetState,
  selectCurrentState,
  selectSearchTerm,
  selectBottomSheetState,
  CurrentState,
  BottomSheetType,
} from '../conversationHeaderSlice';
import { RootState } from '@/store';

describe('conversationHeaderSlice', () => {
  const initialState = {
    currentState: 'none' as CurrentState,
    searchTerm: '',
    currentBottomSheet: 'none' as BottomSheetType,
  };

  describe('reducer', () => {
    it('should return initial state', () => {
      expect(reducer(undefined, { type: '' })).toEqual(initialState);
    });

    it('should handle setCurrentState', () => {
      const nextState = reducer(initialState, setCurrentState('Search' as CurrentState));
      expect(nextState.currentState).toBe('Search');
    });

    it('should handle setSearchTerm', () => {
      const nextState = reducer(initialState, setSearchTerm('test query'));
      expect(nextState.searchTerm).toBe('test query');
    });

    it('should handle setBottomSheetState', () => {
      const nextState = reducer(initialState, setBottomSheetState('mine' as BottomSheetType));
      expect(nextState.currentBottomSheet).toBe('mine');
    });
  });

  describe('selectors', () => {
    const mockState = {
      conversationHeader: {
        currentState: 'Search' as CurrentState,
        searchTerm: 'test',
        currentBottomSheet: 'mine' as BottomSheetType,
      },
    } as RootState;

    it('should select current state', () => {
      expect(selectCurrentState(mockState)).toBe('Search');
    });

    it('should select search term', () => {
      expect(selectSearchTerm(mockState)).toBe('test');
    });

    it('should select bottom sheet state', () => {
      expect(selectBottomSheetState(mockState)).toBe('mine');
    });
  });
});
