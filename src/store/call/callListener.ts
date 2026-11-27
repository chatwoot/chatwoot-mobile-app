import { createListenerMiddleware, isAnyOf, type SerializedError } from '@reduxjs/toolkit';

import { isMicrophoneDeniedError } from '@/services/voice/callErrors';
import { callLogger } from '@/services/voice/callLogger';
import { settingsActions } from '@/store/settings/settingsActions';
import { isUnreportableSerializedError } from '@/utils/sentryUtils';

import { callActions } from './callActions';
import { callMediaActions } from './callMediaActions';

export const callListenerMiddleware = createListenerMiddleware();

const isCallFailure = isAnyOf(
  callActions.joinCall.rejected,
  callActions.startOutboundCall.rejected,
  callActions.endCall.rejected,
  callActions.rejectIncomingCall.rejected,
  callMediaActions.setHold.rejected,
  settingsActions.saveVoipToken.rejected,
);

const toError = ({ name, message, stack }: SerializedError) => {
  const error = new Error(message);
  if (name) error.name = name;
  if (stack) error.stack = stack;
  return error;
};

const isExpectedFailure = (error: SerializedError) =>
  isMicrophoneDeniedError(error) ||
  error.name === 'ConnectAbandonedError' ||
  isUnreportableSerializedError(error);

callListenerMiddleware.startListening({
  matcher: isCallFailure,
  effect: action => {
    if (isExpectedFailure(action.error)) return;
    const failure = action.type.replace(/\/rejected$/, '');
    callLogger.reportFailure(failure, toError(action.error));
  },
});
