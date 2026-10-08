export type JoinResult = { status: string };

// Joins in flight by call sid, so an end that lands mid-join settles after the join and
// ends the call that was actually established instead of one already accepted
const pendingJoins = new Map<string, Promise<JoinResult>>();

// Joins the agent gave up on while they ran; each stops at its next step rather than
// opening media or accepting the call
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

// Runs of the queue of choices made on the native call screen or notification, which
// can start joins of their own
const actionDrains = new Set<Promise<unknown>>();

export const trackActionDrain = (run: Promise<unknown>) => {
  actionDrains.add(run);
  run.finally(() => actionDrains.delete(run)).catch(() => {});
};

// While the session's calls are being ended, no new join starts
let closing = 0;
export const isSessionClosing = () => closing > 0;

// Runs `close` with new joins held off, once every join already in flight and every run
// of the queued choices has settled
export const closeSession = async (close: () => Promise<unknown>) => {
  closing += 1;
  try {
    while (pendingJoins.size || actionDrains.size) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled([...pendingJoins.values(), ...actionDrains]);
    }
    await close();
  } finally {
    closing -= 1;
  }
};
