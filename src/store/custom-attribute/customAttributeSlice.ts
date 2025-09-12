import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import type { CustomAttribute } from '@/types';
import { customAttributeActions } from './customAttributeActions';
import { RootState } from '@/store';

export const customAttributeAdapter = createEntityAdapter<CustomAttribute>();

export interface CustomAttributeState {
  isLoading: boolean;
}

const initialState = customAttributeAdapter.getInitialState<CustomAttributeState>({
  isLoading: false,
});

const customAttributeSlice = createSlice({
  name: 'customAttributes',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(customAttributeActions.index.pending, state => {
        state.isLoading = true;
      })
      .addCase(customAttributeActions.index.fulfilled, (state, action) => {
        const { payload: customAttributes } = action.payload;
        customAttributeAdapter.setAll(state, customAttributes);
        state.isLoading = false;
      })
      .addCase(customAttributeActions.index.rejected, state => {
        state.isLoading = false;
      });
  },
});

export const { selectAll: selectAllCustomAttributes } = customAttributeAdapter.getSelectors(
  (state: RootState) => state.customAttributes,
);

export const getContactCustomAttributes = createSelector(
  [selectAllCustomAttributes],
  customAttributes =>
    customAttributes.filter(
      customAttribute => customAttribute.attributeModel === 'contact_attribute',
    ),
);

export const getConversationCustomAttributes = createSelector(
  [selectAllCustomAttributes],
  customAttributes =>
    customAttributes.filter(
      customAttribute => customAttribute.attributeModel === 'conversation_attribute',
    ),
);

export default customAttributeSlice.reducer;
