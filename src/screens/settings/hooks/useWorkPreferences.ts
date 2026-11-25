import { useAppDispatch, useAppSelector } from '@/hooks';
import { authActions } from '@/store/auth/authActions';
import {
  selectCurrentUserAccountId,
  selectCurrentUserWorkPreferences,
} from '@/store/auth/authSelectors';
import { setCurrentUserWorkPreferences } from '@/store/auth/authSlice';
import type { WorkPreferences } from '@/types/common/AvailabilityStatus';

export const useWorkPreferences = () => {
  const dispatch = useAppDispatch();
  const accountId = useAppSelector(selectCurrentUserAccountId);
  const preferences = useAppSelector(selectCurrentUserWorkPreferences);
  const enabledCount = Object.values(preferences).filter(Boolean).length;

  const isLocked = (key: keyof WorkPreferences) => preferences[key] && enabledCount === 1;

  const toggle = async (key: keyof WorkPreferences) => {
    if (!accountId || isLocked(key)) return;
    const updated = { ...preferences, [key]: !preferences[key] };
    dispatch(setCurrentUserWorkPreferences(updated));
    const result = await dispatch(
      authActions.updateWorkPreferences({ profile: { account_id: accountId, ...updated } }),
    );
    if (authActions.updateWorkPreferences.rejected.match(result)) {
      dispatch(setCurrentUserWorkPreferences(preferences));
    }
  };

  return { preferences, isLocked, toggle };
};
