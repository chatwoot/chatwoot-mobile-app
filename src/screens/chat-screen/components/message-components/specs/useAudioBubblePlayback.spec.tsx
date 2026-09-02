import React from 'react';
import { Platform } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { createAudioPlayer } from 'expo-audio';

// eslint-disable-next-line import/no-unresolved
import { preparePlayableAudio } from '@/utils/audioConverter';

import { useAudioBubblePlayback } from '../useAudioBubblePlayback';

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));
jest.mock('@/utils/audioConverter', () => ({ preparePlayableAudio: jest.fn() }));
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (initial: number) => {
    const [ref] = jest.requireActual('react').useState(() => ({ value: initial }));
    return ref;
  },
}));

type StatusListener = (status: Record<string, unknown>) => void;

const makePlayer = () => {
  let listener: StatusListener = () => {};
  const player = {
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    remove: jest.fn(),
    addListener: jest.fn((_event: string, cb: StatusListener) => {
      listener = cb;
      return { remove: jest.fn() };
    }),
    emit: (status: Record<string, unknown>) =>
      listener({
        playbackState: 'readyToPlay',
        isBuffering: false,
        didJustFinish: false,
        duration: 0,
        currentTime: 0,
        playing: false,
        ...status,
      }),
  };
  return player;
};

const mockCreatePlayer = createAudioPlayer as jest.Mock;
const mockPrepare = preparePlayableAudio as jest.Mock;

type HookResult = ReturnType<typeof useAudioBubblePlayback>;

const renderHook = (dataUrl: string) => {
  const result: { current: HookResult } = { current: null as unknown as HookResult };
  const Harness = ({ url }: { url: string }) => {
    result.current = useAudioBubblePlayback({ dataUrl: url });
    return null;
  };
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(<Harness url={dataUrl} />);
  });
  return {
    result,
    rerender: (url: string) => act(() => renderer.update(<Harness url={url} />)),
    unmount: () => act(() => renderer.unmount()),
  };
};

const flush = () => act(async () => {});

describe('useAudioBubblePlayback', () => {
  let player: ReturnType<typeof makePlayer>;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    player = makePlayer();
    mockCreatePlayer.mockImplementation(() => player);
    mockPrepare.mockResolvedValue('file:///caches/audio_a.m4a');
  });

  it('creates nothing until the first play', () => {
    const { result } = renderHook('https://example.com/a.oga');

    expect(result.current.state).toBe('idle');
    expect(mockPrepare).not.toHaveBeenCalled();
    expect(mockCreatePlayer).not.toHaveBeenCalled();
  });

  it('prepares the source, then plays it', async () => {
    const { result } = renderHook('https://example.com/a.oga');

    act(() => result.current.toggle());
    expect(result.current.state).toBe('loading');
    await flush();

    expect(mockPrepare).toHaveBeenCalledWith({ dataUrl: 'https://example.com/a.oga' });
    expect(mockCreatePlayer).toHaveBeenCalledWith(
      { uri: 'file:///caches/audio_a.m4a' },
      expect.objectContaining({ updateInterval: expect.any(Number) }),
    );
    expect(player.play).toHaveBeenCalledTimes(1);

    act(() => player.emit({ playing: true, duration: 12, currentTime: 1 }));
    expect(result.current.state).toBe('playing');
    expect(result.current.totalDuration.value).toBe(12);
    expect(result.current.currentPosition.value).toBe(1);
  });

  it('plays the original url on android without preparing', async () => {
    Platform.OS = 'android';
    const { result } = renderHook('https://example.com/a.oga');

    act(() => result.current.toggle());
    await flush();

    expect(mockPrepare).not.toHaveBeenCalled();
    expect(mockCreatePlayer).toHaveBeenCalledWith(
      { uri: 'https://example.com/a.oga' },
      expect.anything(),
    );
  });

  it('pauses and resumes the same player', async () => {
    const { result } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();
    act(() => player.emit({ playing: true, duration: 12 }));

    act(() => result.current.toggle());
    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe('paused');

    act(() => result.current.toggle());
    expect(player.play).toHaveBeenCalledTimes(2);
    expect(mockCreatePlayer).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe('playing');
  });

  it('returns to the start when playback finishes', async () => {
    const { result } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();
    act(() => player.emit({ playing: true, duration: 12, currentTime: 6 }));

    act(() => player.emit({ playing: false, didJustFinish: true, duration: 12, currentTime: 12 }));

    expect(result.current.state).toBe('paused');
    expect(result.current.currentPosition.value).toBe(0);
    expect(player.seekTo).toHaveBeenCalledWith(0);
  });

  it('keeps the playing state while the player buffers', async () => {
    const { result } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();
    act(() => player.emit({ playing: true, duration: 12 }));

    act(() => player.emit({ playing: false, isBuffering: true, duration: 12 }));

    expect(result.current.state).toBe('playing');
  });

  it('pauses the previous bubble when another one starts', async () => {
    const first = renderHook('https://example.com/a.oga');
    act(() => first.result.current.toggle());
    await flush();
    act(() => player.emit({ playing: true, duration: 12 }));

    const secondPlayer = makePlayer();
    mockCreatePlayer.mockImplementation(() => secondPlayer);
    const second = renderHook('https://example.com/b.oga');
    act(() => second.result.current.toggle());
    await flush();

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(first.result.current.state).toBe('paused');
    expect(secondPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('seeks and resumes from the new position', async () => {
    const { result } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();
    act(() => player.emit({ playing: true, duration: 12 }));
    act(() => result.current.pause());

    await act(() => result.current.seekTo(7));

    expect(player.seekTo).toHaveBeenCalledWith(7);
    expect(result.current.currentPosition.value).toBe(7);
    expect(player.play).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe('playing');
  });

  it('fails when the source cannot be prepared and retries on the next tap', async () => {
    mockPrepare.mockRejectedValueOnce(new Error('Download failed with status 404'));
    const { result } = renderHook('https://example.com/a.oga');

    act(() => result.current.toggle());
    await flush();
    expect(result.current.state).toBe('failed');
    expect(mockCreatePlayer).not.toHaveBeenCalled();

    act(() => result.current.toggle());
    await flush();
    expect(mockCreatePlayer).toHaveBeenCalledTimes(1);
  });

  it('fails when the native player reports an error', async () => {
    const { result } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();

    act(() => player.emit({ playbackState: 'failed' }));
    expect(result.current.state).toBe('failed');

    act(() => player.emit({ playbackState: 'readyToPlay', error: 'Source error' }));
    expect(result.current.state).toBe('failed');
  });

  it('releases only its own player on unmount', async () => {
    const { result, unmount } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();

    unmount();

    expect(player.remove).toHaveBeenCalledTimes(1);
  });

  it('drops the player when the bubble is reused for another attachment', async () => {
    const { result, rerender } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());
    await flush();
    act(() => player.emit({ playing: true, duration: 12, currentTime: 3 }));

    rerender('https://example.com/b.oga');

    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe('idle');
    expect(result.current.currentPosition.value).toBe(0);
  });

  it('ignores a preparation that finishes after the attachment changed', async () => {
    let resolvePrepare: (uri: string) => void = () => {};
    mockPrepare.mockImplementationOnce(
      () => new Promise<string>(resolve => (resolvePrepare = resolve)),
    );
    const { result, rerender } = renderHook('https://example.com/a.oga');
    act(() => result.current.toggle());

    rerender('https://example.com/b.oga');
    await act(async () => {
      resolvePrepare('file:///caches/audio_a.m4a');
    });

    expect(mockCreatePlayer).not.toHaveBeenCalled();
    expect(result.current.state).toBe('idle');
  });
});
