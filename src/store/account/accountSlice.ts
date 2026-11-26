import { createSlice, createSelector } from '@reduxjs/toolkit';
import { accountActions } from './accountActions';
import { RootState } from '@/store';
import { getConversationCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';

const REQUIRED_ATTRIBUTES_FEATURE = 'conversation_required_attributes';

export interface AccountState {
  features: Record<string, boolean>;
  conversationRequiredAttributes: string[];
}

const initialState: AccountState = {
  features: {},
  conversationRequiredAttributes: [],
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(accountActions.show.pending, () => initialState)
      .addCase(accountActions.show.fulfilled, (state, action) => {
        state.features = action.payload.features;
        state.conversationRequiredAttributes = action.payload.conversationRequiredAttributes;
      });
  },
});

const selectAccount = (state: RootState) => state.account;

export const selectRequiredConversationAttributes = createSelector(
  [selectAccount, getConversationCustomAttributes],
  (account, conversationAttributes) => {
    if (!account.features[REQUIRED_ATTRIBUTES_FEATURE]) {
      return [];
    }
    return account.conversationRequiredAttributes.flatMap(key => {
      const attribute = conversationAttributes.find(item => item.attributeKey === key);
      return attribute ? [attribute] : [];
    });
  },
);

export default accountSlice.reducer;
