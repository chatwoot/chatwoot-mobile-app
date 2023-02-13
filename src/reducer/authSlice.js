import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

import I18n from 'i18n';
import axios from 'axios';
import APIHelper from 'helpers/APIHelper';
import { showToast } from 'helpers/ToastHelper';
import { getHeaders } from 'helpers/AuthHelper';
import { getBaseUrl } from 'helpers/UrlHelper';
import { API_URL } from 'constants/url';
import { updateAgentsPresence } from 'reducer/inboxAgentsSlice';

export const actions = {
  doLogin: createAsyncThunk('auth/doLogin', async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await APIHelper.post('auth/sign_in', { email, password });
      const { data } = response.data;
      const {
        name,
        id,
        account_id,
        accounts,
        access_token,
        uid,
        pubsub_token,
        avatar_url,
        available_name,
        role,
      } = data;
      return {
        user: {
          name,
          id,
          account_id,
          accounts,
          email,
          access_token,
          uid,
          pubsub_token,
          avatar_url,
          available_name,
          role,
        },
        headers: response.headers,
      };
    } catch (response) {
      if (response && response.status === 401) {
        const { errors } = response.data;
        const hasAuthErrorMsg =
          errors && errors.length && errors[0] && typeof errors[0] === 'string';
        if (hasAuthErrorMsg) {
          showToast({ message: errors[0] });
        } else {
          showToast({ message: I18n.t('ERRORS.AUTH') });
        }
        if (!errors) {
          throw errors;
        }
        return rejectWithValue(errors);
      }
      showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
    }
  }),
  onResetPassword: createAsyncThunk(
    'auth/onResetPassword',
    async ({ email }, { rejectWithValue }) => {
      try {
        const response = await APIHelper.post('auth/password', { email });
        let successMessage = I18n.t('FORGOT_PASSWORD.API_SUCCESS');
        if (response.data && response.data.message) {
          successMessage = response.data.message;
        }
        showToast({ message: successMessage, type: 'success' });
        const { data } = response;
        return data;
      } catch (error) {
        const { response } = error;
        if (response && response.status === 401) {
          const { errors } = response.data;
          const hasAuthErrorMsg =
            errors && errors.length && errors[0] && typeof errors[0] === 'string';
          if (hasAuthErrorMsg) {
            showToast({ message: errors[0], type: 'error' });
          } else {
            showToast({ message: I18n.t('ERRORS.AUTH'), type: 'error' });
          }
        } else {
          showToast({ message: I18n.t('ERRORS.COMMON_ERROR'), type: 'error' });
        }
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    },
  ),
  updateAvailability: createAsyncThunk(
    'auth/updateAvailability',
    async ({ availability }, { dispatch, rejectWithValue }) => {
      try {
        const headers = await getHeaders();
        const baseUrl = await getBaseUrl();
        const { accountId } = headers;
        const payload = { profile: { availability, account_id: accountId } };
        const { data } = await axios.post(`${baseUrl}${API_URL}profile/availability`, payload, {
          headers: headers,
        });
        const users = { [data.id]: availability };
        dispatch(
          updateAgentsPresence({
            users,
          }),
        );
        return data;
      } catch (error) {}
    },
  ),
};

export const authAdapter = createEntityAdapter();
const initialState = {
  currentUser: {
    id: null,
    account_id: null,
    accounts: [],
    email: null,
    name: null,
    access_token: null,
    pubsub_token: null,
  },
  headers: null,
  isLoggingIn: false,
  isResettingPassword: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      // in rootReducer, there is an action to CLEAR the complete Redux Store's state
    },
    resetAuth: state => {
      state.isLoggingIn = false;
      state.isResettingPassword = false;
    },
    setAccount: (state, action) => {
      state.currentUser.account_id = action.payload;
    },
    setCurrentUserAvailability(state, action) {
      const { users } = action.payload;
      if (users[state.currentUser.id]) {
        const availability = users[state.currentUser.id];
        const accounts = state.currentUser.accounts.map(account => {
          if (account.id === state.currentUser.account_id) {
            return { ...account, availability, availability_status: availability };
          }
          return account;
        });
        state.currentUser.accounts = accounts;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(actions.doLogin.pending, state => {
        state.isLoggingIn = true;
      })
      .addCase(actions.doLogin.fulfilled, (state, { payload }) => {
        state.currentUser = payload.user;
        state.headers = payload.headers;
        state.isLoggingIn = false;
      })
      .addCase(actions.doLogin.rejected, (state, error) => {
        state.isLoggingIn = false;
      })
      .addCase(actions.onResetPassword.pending, state => {
        state.isResettingPassword = true;
      })
      .addCase(actions.onResetPassword.fulfilled, (state, { payload }) => {
        state.isResettingPassword = false;
      })
      .addCase(actions.onResetPassword.rejected, (state, error) => {
        state.isResettingPassword = false;
      })
      .addCase(actions.updateAvailability.fulfilled, (state, { payload }) => {
        state.currentUser = payload;
      });
  },
});

export const authSelector = authAdapter.getSelectors(state => state.auth);

export const { logout, resetAuth, setAccount, setCurrentUserAvailability } = authSlice.actions;

export const selectAccounts = state => state.auth.currentUser.accounts;

export const selectUser = state => state.auth.currentUser;

export const selectUserId = state => state.auth.currentUser.id;

export const selectLoggedIn = state => state.auth.currentUser?.id;

export const selectIsLoggingIn = state => state.auth.isLoggingIn;

export const selectIsResettingPassword = state => state.auth.isResettingPassword;

export const selectCurrentUserAvailability = state => {
  const {
    currentUser: { account_id, accounts = [] },
  } = state.auth;
  const [currentAccount = {}] = accounts.filter(account => account.id === account_id);
  return currentAccount.availability;
};

export default authSlice.reducer;
