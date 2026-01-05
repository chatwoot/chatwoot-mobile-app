import { User } from '@/types/User';
import { createSlice } from '@reduxjs/toolkit';
import { authActions } from './authActions';
import { AuthHeaders } from './authTypes';
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  apiAccessToken: string | null; // API Access Token para integrações (Kanban, etc)
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
  apiAccessToken: null,
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
      state.headers = null;
      state.user = null;
      state.accessToken = null;
      state.apiAccessToken = null;
      state.mfaToken = null;
      state.uiFlags = {
        isLoggingIn: false,
        isResettingPassword: false,
        isVerifyingMfa: false,
      };
    },
    resetAuth: state => {
      state.user = null;
      state.accessToken = null;
      state.apiAccessToken = null;
      state.headers = null;
      state.mfaToken = null;
      state.error = null;
      state.uiFlags = {
        isLoggingIn: false,
        isResettingPassword: false,
        isVerifyingMfa: false,
      };
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
          // Salvar o API Access Token que vem no body da resposta
          state.apiAccessToken = action.payload.apiAccessToken || null;

          // Log para debug
          console.log(
            '[AuthSlice] Login fulfilled - API Access Token saved:',
            state.apiAccessToken ? `${state.apiAccessToken.substring(0, 20)}...` : 'NULL',
          );

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
        // Salvar o API Access Token que vem no body da resposta
        state.apiAccessToken = action.payload.apiAccessToken || null;
        state.uiFlags.isVerifyingMfa = false;
        state.error = null;
        state.mfaToken = null;
      })
      .addCase(authActions.verifyMfa.rejected, (state, action) => {
        state.uiFlags.isVerifyingMfa = false;
        state.error = action.payload?.errors[0] ?? null;
      })
      .addCase(authActions.loginWithSso.pending, state => {
        state.uiFlags.isLoggingIn = true;
        state.error = null;
      })
      .addCase(authActions.loginWithSso.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.headers = action.payload.headers;
        // Salvar o API Access Token que vem no body da resposta
        state.apiAccessToken = action.payload.apiAccessToken || null;
        state.uiFlags.isLoggingIn = false;
        state.error = null;
        state.mfaToken = null;
      })
      .addCase(authActions.loginWithSso.rejected, (state, action) => {
        state.uiFlags.isLoggingIn = false;
        state.error = action.payload?.errors[0] ?? null;
      })
      .addCase(authActions.setActiveAccount.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload.user,
        };

        if (action.payload.headers) {
          state.headers = action.payload.headers;
        }
      })
      .addCase(authActions.getApiAccessToken.fulfilled, (state, action) => {
        state.apiAccessToken = action.payload;
        console.log('[AuthSlice] API Access Token saved to Redux state');
      })
      .addCase(authActions.getApiAccessToken.rejected, state => {
        state.apiAccessToken = null;
        console.warn('[AuthSlice] Failed to get API Access Token');
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
