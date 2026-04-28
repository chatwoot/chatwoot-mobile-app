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

const EMPTY_LABELS: string[] = [];

export const selectContactLabelsByContactId = (contactId: number | undefined) =>
  (state: RootState) =>
    contactId ? state.contactLabels.records[contactId] ?? EMPTY_LABELS : EMPTY_LABELS;

export default contactLabelsSlice.reducer;
