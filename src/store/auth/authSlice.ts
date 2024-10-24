import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authActions } from './authAction';
import { User } from '@/types/User';
import { AuthHeaders, LoginResponse } from './authAPI';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  uiFlags: {
    isLoggingIn: boolean;
  };
  headers: AuthHeaders | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  uiFlags: {
    isLoggingIn: false,
  },
  headers: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'authv4',
  initialState,
  reducers: {
    logout: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(authActions.login.pending, state => {
        state.uiFlags.isLoggingIn = true;
        state.error = null;
      })
      .addCase(authActions.login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.user = action.payload.user;
        state.headers = action.payload.headers;
        state.uiFlags.isLoggingIn = false;
        state.error = null;
      })
      .addCase(authActions.login.rejected, (state, action) => {
        state.uiFlags.isLoggingIn = false;
        state.error = action.payload?.errors[0] ?? null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
