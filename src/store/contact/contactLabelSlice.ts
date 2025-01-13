import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { contactLabelActions } from './contactLabelActions';

interface ContactLabelsState {
  records: { [key: number]: string[] };
}

const initialState: ContactLabelsState = {
  records: {},
};

const contactLabelsSlice = createSlice({
  name: 'contactLabels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(contactLabelActions.getContactLabels.fulfilled, (state, action) => {
      const { contactId, labels } = action.payload;
      state.records[contactId] = labels;
    });
    builder.addCase(contactLabelActions.updateContactLabels.fulfilled, (state, action) => {
      const { contactId, labels } = action.payload;
      state.records[contactId] = labels;
    });
  },
});

export const selectContactLabels = (state: RootState) => state.contactLabels.records;

export const selectContactLabelsByContactId = (contactId: number) => (state: RootState) =>
  state.contactLabels.records[contactId] || [];

export default contactLabelsSlice.reducer;
