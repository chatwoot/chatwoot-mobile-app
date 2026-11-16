import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { useCloudflareMedia } from '../useCloudflareMedia';
import { resolveCloudflareMedia } from '@/utils/cloudflareMedia';

jest.mock('@/services/cloudflareAccess', () => ({
  getCloudflareAccessRevision: () => 0,
  subscribeCloudflareAccess: () => () => {},
}));

jest.mock('@/utils/cloudflareMedia', () => ({
  requiresCloudflareMedia: (url: string) => url?.startsWith('https://chat.example.com/'),
  resolveCloudflareMedia: jest.fn(),
}));

let observed: ReturnType<typeof useCloudflareMedia>;
const Probe = ({ url, enabled = true }: { url: string; enabled?: boolean }) => {
  observed = useCloudflareMedia(url, 0, enabled);
  return null;
};
const protectedUrl = 'https://chat.example.com/video.mp4';
const mockResolve = resolveCloudflareMedia as jest.Mock;
let renderer: TestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.clearAllMocks();
  mockResolve.mockResolvedValue('file:///cache/video.mp4');
});

afterEach(async () => {
  await act(async () => renderer?.unmount());
});

it('does not download or expose a protected source before it is enabled', async () => {
  await act(async () => {
    renderer = TestRenderer.create(<Probe url={protectedUrl} enabled={false} />);
  });
  expect(mockResolve).not.toHaveBeenCalled();
  expect(observed).toEqual({ uri: null, loading: false, failed: false });
});

it('keeps external streaming sources available while protected downloads are deferred', async () => {
  const url = 'https://external.example.com/video.mp4';
  await act(async () => {
    renderer = TestRenderer.create(<Probe url={url} enabled={false} />);
  });
  expect(mockResolve).not.toHaveBeenCalled();
  expect(observed).toEqual({ uri: url, loading: false, failed: false });
});

it('shows loading only after enabling and exposes only the resolved local source', async () => {
  let finish: (value: string) => void = () => {};
  mockResolve.mockReturnValue(
    new Promise<string>(resolve => {
      finish = resolve;
    }),
  );
  await act(async () => {
    renderer = TestRenderer.create(<Probe url={protectedUrl} enabled={false} />);
  });
  await act(async () => {
    renderer.update(<Probe url={protectedUrl} enabled />);
  });
  expect(mockResolve).toHaveBeenCalledTimes(1);
  expect(observed).toEqual({ uri: null, loading: true, failed: false });

  await act(async () => finish('file:///cache/ready.mp4'));
  expect(observed).toEqual({ uri: 'file:///cache/ready.mp4', loading: false, failed: false });
});

it('does not fall back to the protected remote URL when its download fails', async () => {
  mockResolve.mockRejectedValue(new Error('Unable to load protected media'));
  await act(async () => {
    renderer = TestRenderer.create(<Probe url={protectedUrl} />);
  });
  expect(observed).toEqual({ uri: null, loading: false, failed: true });
});
