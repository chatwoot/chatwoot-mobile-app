import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@/hooks';
import type { LiveCall } from '@/store/call/callTypes';
import { selectCallerInfo, type CallerInfo } from '@/services/voice/callerInfo';

export type { CallerInfo };

export const useCallerInfo = (call: LiveCall | null): CallerInfo =>
  useAppSelector(state => selectCallerInfo(state, call), shallowEqual);
