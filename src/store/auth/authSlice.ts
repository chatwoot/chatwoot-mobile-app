import { createSlice } from '@reduxjs/toolkit';
import { authActions } from './authActions';
import { User } from '@/types/User';
import { AuthHeaders } from './authTypes';
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  uiFlags: {
    isLoggingIn: boolean;
    isResettingPassword: boolean;
  };
  headers: AuthHeaders | null;
  error: string | null;
}
const initialState: AuthState = {
  user: null,
  accessToken: null,
  uiFlags: {
    isLoggingIn: false,
    isResettingPassword: false,
  },
  headers: null,
  error: null,
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      // in rootReducer, there is an action to CLEAR the complete Redux Store's state
    },
    resetAuth: state => {
      state.user = null;
      state.accessToken = null;
      state.headers = null;
    },
    setCurrentUserAvailability(state, action) {
      const { users } = action.payload;
      const userId = state.user?.id;
      if (userId && users[userId] && state.user?.accounts) {
        const availability = users[userId];
        state.user.accounts = state.user.accounts.map(account => {
          if (account.id === state.user?.account_id) {
            return { ...account, availability, availability_status: availability };
          }
          return account;
        });
      }
    },
    setAccount: (state, action) => {
      if (state.user) {
        state.user.account_id = action.payload;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(authActions.login.pending, state => {
        state.uiFlags.isLoggingIn = true;
        state.error = null;
      })
      .addCase(authActions.login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.headers = action.payload.headers;
        state.uiFlags.isLoggingIn = false;
        state.error = null;
      })
      .addCase(authActions.getProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload.user,
        };
      })
      .addCase(authActions.login.rejected, (state, action) => {
        state.uiFlags.isLoggingIn = false;
        state.error = action.payload?.errors[0] ?? null;
      })
      .addCase(authActions.resetPassword.pending, state => {
        state.uiFlags.isResettingPassword = true;
        state.error = null;
      })
      .addCase(authActions.resetPassword.fulfilled, (state, action) => {
        state.uiFlags.isResettingPassword = false;
        state.error = null;
      })
      .addCase(authActions.resetPassword.rejected, (state, action) => {
        state.uiFlags.isResettingPassword = false;
      })
      .addCase(authActions.updateAvailability.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload.user,
        };
      });
  },
});
export const { logout, setAccount, resetAuth, setCurrentUserAvailability } = authSlice.actions;
export default authSlice.reducer;
