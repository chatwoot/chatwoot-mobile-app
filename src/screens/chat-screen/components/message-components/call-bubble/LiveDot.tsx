import React from 'react';

import { useAppSelector } from '@/hooks';
import { PulseDot } from '@/screens/call/components/PulseDot';
import { selectFullScreenCall, selectIsCallMinimised } from '@/store/call/callSelectors';

// The bubble's marker for a call that is live or still ringing. It rests while the call
// screen covers the chat.
export const LiveDot = ({ colour, periodMs }: { colour: string; periodMs: number }) => {
  const covered = useAppSelector(
    state => !!selectFullScreenCall(state) && !selectIsCallMinimised(state),
  );
  return <PulseDot colour={colour} periodMs={periodMs} spread={1.6} paused={covered} />;
};
