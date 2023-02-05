import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import APIHelper from 'helpers/APIHelper';

export const actions = {
  getAllCustomAttributes: createAsyncThunk(
    'customAttributes/getAllCustomAttributes',
    async (params, { rejectWithValue }) => {
      try {
        const response = await APIHelper.get('custom_attribute_definitions');
        const { data } = response;
        return data;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
};

const customAttributesAdapter = createEntityAdapter({
  selectId: customAttribute => customAttribute.id,
});

const initialState = customAttributesAdapter.getInitialState({
  loading: false,
});

const customAttributeSlice = createSlice({
  name: 'customAttributes',
  initialState,
  reducers: {},
  extraReducers: {
    [actions.getAllCustomAttributes.pending]: state => {
      state.loading = true;
    },
    [actions.getAllCustomAttributes.fulfilled]: (state, action) => {
      state.loading = false;
      customAttributesAdapter.setAll(state, action.payload);
    },
    [actions.getAllCustomAttributes.rejected]: state => {
      state.loading = false;
    },
  },
});

export const customAttributeSelector = customAttributesAdapter.getSelectors(
  state => state.customAttributes,
);

export default customAttributeSlice.reducer;
