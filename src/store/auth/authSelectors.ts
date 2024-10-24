import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export const selectAuth = (state: RootState) => state.authv4;

export const selectAuthHeaders = createSelector(selectAuth, auth => auth.headers);

export const selectAuthUser = createSelector(selectAuth, auth => auth.user);

export const selectIsLoggingIn = createSelector(selectAuth, auth => auth.uiFlags.isLoggingIn);

export const selectAuthError = createSelector(selectAuth, auth => auth.error);
