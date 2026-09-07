export type PlaybackOwner = {
  pause: () => void;
};

let activeOwner: PlaybackOwner | null = null;

/** Makes `owner` the only bubble playing; whichever owner held playback is paused. */
export const claimPlayback = (owner: PlaybackOwner) => {
  if (activeOwner && activeOwner !== owner) {
    activeOwner.pause();
  }
  activeOwner = owner;
};

export const releasePlayback = (owner: PlaybackOwner) => {
  if (activeOwner === owner) {
    activeOwner = null;
  }
};
