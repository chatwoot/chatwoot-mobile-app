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
    isVerifyingMfa: boolean;
  };
  headers: AuthHeaders | null;
  error: string | null;
  mfaToken: string | null;
}
const initialState: AuthState = {
  user: null,
  accessToken: null,
  uiFlags: {
    isLoggingIn: false,
    isResettingPassword: false,
    isVerifyingMfa: false,
  },
  headers: null,
  error: null,
  mfaToken: null,
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
      state.mfaToken = null;
      state.error = null;
    },
    clearAuthError: state => {
      state.error = null;
    },
    clearMfaToken: state => {
      state.mfaToken = null;
    },
    setCurrentUserAvailability(state, action) {
      const { users } = action.payload;
      const userId = state.user?.id;

      // Only proceed if we have a valid user and matching availability data
      if (!userId || !users[userId] || !state.user?.accounts) {
        return;
      }

      const newAvailability = users[userId];
      let needsUpdate = false;

      // Update the accounts array with the new availability
      const updatedAccounts = state.user.accounts.map(account => {
        if (account.id === state.user?.account_id) {
          // Since this event triggers frequently, we should verify if a state update is necessary to prevent unnecessary component re-renders.
          const shouldUpdateAccount =
            !account.availability || // availability doesn't exist
            account.availability !== newAvailability || // availability doesn't match
            account.availability_status !== newAvailability; // availability_status doesn't match
          if (shouldUpdateAccount) {
            needsUpdate = true;
            return {
              ...account,
              availability: newAvailability,
              availability_status: newAvailability,
            };
          }
        }
        return account;
      });
      if (needsUpdate) {
        state.user = {
          ...state.user,
          accounts: updatedAccounts,
        };
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
        // Check if MFA is required
        if ('mfa_required' in action.payload) {
          state.mfaToken = action.payload.mfa_token;
          state.uiFlags.isLoggingIn = false;
          state.error = null;
          // MFA token will not be persisted due to blacklist in persist config
        } else {
          // Regular login success
          state.user = action.payload.user;
          state.headers = action.payload.headers;
          state.uiFlags.isLoggingIn = false;
          state.error = null;
          state.mfaToken = null;
        }
      })
      .addCase(authActions.getProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload,
        } as User;
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
      })
      .addCase(authActions.verifyMfa.pending, state => {
        state.uiFlags.isVerifyingMfa = true;
        state.error = null;
      })
      .addCase(authActions.verifyMfa.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.headers = action.payload.headers;
        state.uiFlags.isVerifyingMfa = false;
        state.error = null;
        state.mfaToken = null;
      })
      .addCase(authActions.verifyMfa.rejected, (state, action) => {
        state.uiFlags.isVerifyingMfa = false;
        state.error = action.payload?.errors[0] ?? null;
      });
  },
});
export const {
  logout,
  setAccount,
  resetAuth,
  setCurrentUserAvailability,
  clearAuthError,
  clearMfaToken,
} = authSlice.actions;
export default authSlice.reducer;
