type Controller = typeof import('../audioPlaybackController');

// The controller keeps the active owner and the audio-mode promise at module
// level, so every test gets its own copy of the module and its mocks.
const loadController = () => {
  let controller!: Controller;
  let setAudioModeAsync!: jest.Mock;
  let captureException!: jest.Mock;
  jest.isolateModules(() => {
    jest.doMock('expo-audio', () => ({ setAudioModeAsync: jest.fn() }));
    jest.doMock('@sentry/react-native', () => ({ captureException: jest.fn() }));
    setAudioModeAsync = jest.requireMock('expo-audio').setAudioModeAsync;
    captureException = jest.requireMock('@sentry/react-native').captureException;
    controller = jest.requireActual('../audioPlaybackController');
  });
  return { ...controller, setAudioModeAsync, captureException };
};

describe('claimPlayback', () => {
  it('pauses the owner that previously held playback', () => {
    const { claimPlayback } = loadController();
    const first = { pause: jest.fn() };
    const second = { pause: jest.fn() };

    claimPlayback(first);
    claimPlayback(second);

    expect(first.pause).toHaveBeenCalledTimes(1);
    expect(second.pause).not.toHaveBeenCalled();
  });

  it('does not pause an owner that claims playback again', () => {
    const { claimPlayback } = loadController();
    const owner = { pause: jest.fn() };

    claimPlayback(owner);
    claimPlayback(owner);

    expect(owner.pause).not.toHaveBeenCalled();
  });

  it('forgets a released owner so it is not paused later', () => {
    const { claimPlayback, releasePlayback } = loadController();
    const first = { pause: jest.fn() };
    const second = { pause: jest.fn() };

    claimPlayback(first);
    releasePlayback(first);
    claimPlayback(second);

    expect(first.pause).not.toHaveBeenCalled();
  });

  it('ignores a release from an owner that does not hold playback', () => {
    const { claimPlayback, releasePlayback } = loadController();
    const holder = { pause: jest.fn() };
    const other = { pause: jest.fn() };

    claimPlayback(holder);
    releasePlayback(other);
    claimPlayback(other);

    expect(holder.pause).toHaveBeenCalledTimes(1);
  });
});

describe('ensurePlaybackAudioMode', () => {
  it('enables silent-mode playback once for every caller', async () => {
    const { ensurePlaybackAudioMode, setAudioModeAsync } = loadController();
    setAudioModeAsync.mockResolvedValue(undefined);

    await Promise.all([ensurePlaybackAudioMode(), ensurePlaybackAudioMode()]);
    await ensurePlaybackAudioMode();

    expect(setAudioModeAsync).toHaveBeenCalledTimes(1);
    expect(setAudioModeAsync).toHaveBeenCalledWith({ playsInSilentMode: true });
  });

  it('reports a failure, resolves anyway, and retries next time', async () => {
    const { ensurePlaybackAudioMode, setAudioModeAsync, captureException } = loadController();
    setAudioModeAsync.mockRejectedValueOnce(new Error('session busy'));
    setAudioModeAsync.mockResolvedValueOnce(undefined);

    await expect(ensurePlaybackAudioMode()).resolves.toBeUndefined();
    await ensurePlaybackAudioMode();

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(setAudioModeAsync).toHaveBeenCalledTimes(2);
  });
});
