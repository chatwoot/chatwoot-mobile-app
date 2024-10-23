import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import { CannedResponse } from '@/types';
import { AxiosError } from 'axios';
import type { RootState } from '@/store';

import API from '@/helpers/APIHelper';

export const cannedResponseAdapter = createEntityAdapter<CannedResponse>({
  selectId: cannedResponse => cannedResponse.id,
});

export const cannedResponsesSlice = createSlice({
  name: 'cannedTemplates',
  initialState: cannedResponseAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    builder.addCase(actions.index.fulfilled, (state, action) => {
      cannedResponseAdapter.upsertMany(state, action.payload.cannedResponses);
    });
  },
});

export type KnownError = {
  message: string;
  description: string;
  code: number | undefined;
};

export const actions = {
  index: createAsyncThunk(
    'cannedResponses/index',
    async (
      { searchKey }: { searchKey: string },
      { rejectWithValue },
    ): Promise<{
      cannedResponses: CannedResponse[];
    }> => {
      try {
        const url = searchKey ? `canned_responses?search=${searchKey}` : `canned_responses`;
        const { data: responses } = await API.get(url);
        const cannedResponses = responses.map(
          (response: { id: number; short_code: string; content: string }) => ({
            id: response.id,
            shortCode: response.short_code,
            content: response.content,
          }),
        );
        return {
          cannedResponses,
        };
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error: AxiosError<KnownError> = err as any;
        if (!error.response) {
          throw err;
        }
        const {
          data: { message },
        } = error.response;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return rejectWithValue(message);
      }
    },
  ),
};

export const selectors = cannedResponseAdapter.getSelectors(
  (state: RootState) => state.cannedTemplates,
);

export default cannedResponsesSlice.reducer;
