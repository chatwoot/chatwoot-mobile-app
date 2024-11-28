import conversationActionReducer, {
  setActionState,
  resetActionState,
  selectCurrentActionState,
  ActionState,
} from '../conversationActionSlice';
import { RootState } from '@/store';

describe('conversationAction reducer', () => {
  it('should return initial state', () => {
    expect(conversationActionReducer(undefined, { type: '' })).toEqual({
      currentActionState: null,
    });
  });

  describe('setActionState', () => {
    it('should set the action state to Assign', () => {
      const initialState = {
        currentActionState: null,
      } as ActionState;

      const nextState = conversationActionReducer(initialState, setActionState('Assign'));

      expect(nextState.currentActionState).toBe('Assign');
    });

    it('should set the action state to Status', () => {
      const initialState = {
        currentActionState: 'Assign',
      } as ActionState;

      const nextState = conversationActionReducer(initialState, setActionState('Status'));

      expect(nextState.currentActionState).toBe('Status');
    });

    it('should set the action state to Label', () => {
      const initialState = {
        currentActionState: 'Status',
      } as ActionState;

      const nextState = conversationActionReducer(initialState, setActionState('Label'));

      expect(nextState.currentActionState).toBe('Label');
    });

    it('should set the action state to TeamAssign', () => {
      const initialState = {
        currentActionState: 'Label',
      } as ActionState;

      const nextState = conversationActionReducer(initialState, setActionState('TeamAssign'));

      expect(nextState.currentActionState).toBe('TeamAssign');
    });
  });

  describe('resetActionState', () => {
    it('should reset the action state to null', () => {
      const initialState = {
        currentActionState: 'Assign',
      } as ActionState;

      const nextState = conversationActionReducer(initialState, resetActionState());

      expect(nextState.currentActionState).toBe(null);
    });
  });

  describe('selectCurrentActionState', () => {
    it('should return current action state from state', () => {
      const mockState = {
        conversationAction: {
          currentActionState: 'Assign',
        },
      } as RootState;

      expect(selectCurrentActionState(mockState)).toBe('Assign');
    });

    it('should return null when no action state is set', () => {
      const mockState = {
        conversationAction: {
          currentActionState: null,
        },
      } as RootState;

      expect(selectCurrentActionState(mockState)).toBeNull();
    });
  });
});
