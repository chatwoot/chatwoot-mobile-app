export type JoinResult = { status: string };

const pendingJoins = new Map<string, Promise<JoinResult>>();

const cancelledJoins = new Set<string>();

export const trackJoin = (callSid: string, join: Promise<JoinResult>) => {
  pendingJoins.set(callSid, join);
  join
    .finally(() => {
      if (pendingJoins.get(callSid) === join) {
        pendingJoins.delete(callSid);
        cancelledJoins.delete(callSid);
      }
    })
    .catch(() => {});
  return join;
};

export const pendingJoin = (callSid: string) => pendingJoins.get(callSid);

export const cancelJoin = (callSid: string) => {
  if (pendingJoins.has(callSid)) cancelledJoins.add(callSid);
};

export const isJoinCancelled = (callSid: string) => cancelledJoins.has(callSid);

let locallyEndedSid: string | null = null;

export const markLocalEnd = (callSid: string) => {
  locallyEndedSid = callSid;
};

export const takeLocalEnd = (callSid: string) => {
  const endedHere = locallyEndedSid === callSid;
  if (endedHere) locallyEndedSid = null;
  return endedHere;
};

const actionDrains = new Set<Promise<unknown>>();

export const trackActionDrain = (run: Promise<unknown>) => {
  actionDrains.add(run);
  run.finally(() => actionDrains.delete(run)).catch(() => {});
};

let closing = 0;
export const isSessionClosing = () => closing > 0;

// Release media before awaiting pending joins.
export const closeSession = async (
  close: () => Promise<unknown>,
  releaseNow?: () => Promise<unknown>,
) => {
  closing += 1;
  pendingJoins.forEach((_, callSid) => cancelledJoins.add(callSid));
  try {
    await releaseNow?.();
    while (pendingJoins.size || actionDrains.size) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled([...pendingJoins.values(), ...actionDrains]);
    }
    await close();
  } finally {
    closing -= 1;
  }
};
