type AudioSession = typeof import('@/utils/audioSession');

// The module remembers the mode it applied, so every test loads a fresh copy.
const loadAudioSession = () => {
  let session!: AudioSession;
  let setAudioModeAsync!: jest.Mock;
  let captureException!: jest.Mock;
  jest.isolateModules(() => {
    jest.doMock('expo-audio', () => ({ setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
    jest.doMock('@sentry/react-native', () => ({ captureException: jest.fn() }));
    setAudioModeAsync = jest.requireMock('expo-audio').setAudioModeAsync;
    captureException = jest.requireMock('@sentry/react-native').captureException;
    session = jest.requireActual('@/utils/audioSession');
  });
  return { ...session, setAudioModeAsync, captureException };
};

describe('audioSession', () => {
  it('enables silent-mode playback once for every caller', async () => {
    const { ensurePlaybackAudioMode, setAudioModeAsync } = loadAudioSession();

    await Promise.all([ensurePlaybackAudioMode(), ensurePlaybackAudioMode()]);
    await ensurePlaybackAudioMode();

    expect(setAudioModeAsync).toHaveBeenCalledTimes(1);
    expect(setAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      allowsRecording: false,
    });
  });

  it('raises allowsRecording while the recorder is open and lowers it after', async () => {
    const { enableRecordingAudioMode, disableRecordingAudioMode, setAudioModeAsync } =
      loadAudioSession();

    await enableRecordingAudioMode();
    await disableRecordingAudioMode();

    expect(setAudioModeAsync.mock.calls).toEqual([
      [{ playsInSilentMode: true, allowsRecording: true }],
      [{ playsInSilentMode: true, allowsRecording: false }],
    ]);
  });

  it('applies mode changes in order even when they overlap', async () => {
    const { enableRecordingAudioMode, ensurePlaybackAudioMode, setAudioModeAsync } =
      loadAudioSession();
    const order: string[] = [];
    setAudioModeAsync.mockImplementation(
      (mode: { allowsRecording: boolean }) =>
        new Promise<void>(resolve => {
          setTimeout(
            () => {
              order.push(mode.allowsRecording ? 'record' : 'play');
              resolve();
            },
            mode.allowsRecording ? 20 : 0,
          );
        }),
    );

    await Promise.all([enableRecordingAudioMode(), ensurePlaybackAudioMode()]);

    expect(order).toEqual(['record', 'play']);
  });

  it('reports a failure, resolves anyway, and retries next time', async () => {
    const { ensurePlaybackAudioMode, setAudioModeAsync, captureException } = loadAudioSession();
    setAudioModeAsync.mockRejectedValueOnce(new Error('session busy'));

    await expect(ensurePlaybackAudioMode()).resolves.toBeUndefined();
    await ensurePlaybackAudioMode();

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(setAudioModeAsync).toHaveBeenCalledTimes(2);
  });
});
