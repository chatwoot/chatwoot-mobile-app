import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import API from '../helpers/APIHelper';

const cannedResponseAdapter = createEntityAdapter();

export const cannedResponsesSlice = createSlice({
  name: 'cannedResponses',
  initialState: cannedResponseAdapter.getInitialState(),
  reducers: {
    setAll: cannedResponseAdapter.setAll,
  },
});

const { setAll } = cannedResponsesSlice.actions;
export const actions = {
  index:
    ({ searchKey }) =>
    async dispatch => {
      try {
        const url = searchKey ? `canned_responses?search=${searchKey}` : url;
        const { data } = await API.get(url);
        const cannedResponses = data.map(({ id, short_code: shortCode, content }) => ({
          id,
          shortCode,
          content,
        }));
        dispatch(setAll(cannedResponses));
      } catch (error) {}
    },
};

export const cannedResponseSelector = cannedResponseAdapter.getSelectors(
  state => state.cannedResponses,
);

export default cannedResponsesSlice.reducer;
