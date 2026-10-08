export type JoinResult = { status: string };

// Joins in flight by call sid, so an end that lands mid-join settles after the join and
// ends the call that was actually established instead of one already accepted
const pendingJoins = new Map<string, Promise<JoinResult>>();

export const trackJoin = (callSid: string, join: Promise<JoinResult>) => {
  pendingJoins.set(callSid, join);
  join
    .finally(() => {
      if (pendingJoins.get(callSid) === join) pendingJoins.delete(callSid);
    })
    .catch(() => {});
  return join;
};

export const pendingJoin = (callSid: string) => pendingJoins.get(callSid);

// While the session's calls are being ended, no new join starts
let closing = 0;
export const isSessionClosing = () => closing > 0;

// Runs `close` with new joins held off, once every join already in flight has settled
export const closeSession = async (close: () => Promise<unknown>) => {
  closing += 1;
  try {
    while (pendingJoins.size) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled([...pendingJoins.values()]);
    }
    await close();
  } finally {
    closing -= 1;
  }
};
