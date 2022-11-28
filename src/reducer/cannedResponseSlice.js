import { createSlice, createEntityAdapter, createDraftSafeSelector } from '@reduxjs/toolkit';
import API from 'helpers/APIHelper';

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
  index: () => async dispatch => {
    try {
      const { data } = await API.get('canned_responses');
      const cannedResponses = data.map(({ id, short_code: shortCode, content }) => ({
        id,
        shortCode,
        content,
      }));
      dispatch(setAll(cannedResponses));
    } catch (error) {}
  },
};

const cannedResponseSelector = cannedResponseAdapter.getSelectors(state => state.cannedResponses);
export const selectors = {
  getFilteredCannedResponses: createDraftSafeSelector(
    [cannedResponseSelector.selectAll, (_, searchKey) => searchKey],
    (cannedResponses, searchKey = '') => {
      return cannedResponses.filter(cannedResponse => {
        return (
          cannedResponse.shortCode.includes(searchKey) || cannedResponse.content.includes(searchKey)
        );
      });
    },
  ),
};

export default cannedResponsesSlice.reducer;
