import ReactNativeBlobUtil from 'react-native-blob-util';
import * as Crypto from 'expo-crypto';

import {
  getCloudflareAccessHeaders,
  getCloudflareAccessRevision,
} from '@/services/cloudflareAccess';

const MAX_REDIRECTS = 5;
const downloads = new Map<string, { promise: Promise<string>; completed: boolean }>();
// Cache names are unique to this process. A new session never reuses files
// downloaded by an earlier installation/token configuration.
const sessionId = Crypto.randomUUID();
const sessionPrefix = `cf_media_${sessionId}_`;
let cacheCleanup: Promise<void> | undefined;
const mediaError = () => new Error('Unable to load protected media');

const isRemote = (url: string) => /^https?:\/\//i.test(url);

const parseRemoteUrl = (url: string): URL => {
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password || !['https:', 'http:'].includes(parsed.protocol)) {
      throw mediaError();
    }
    return parsed;
  } catch {
    throw mediaError();
  }
};

/** True when a source must be resolved before a native media component sees it. */
export const requiresCloudflareMedia = (url?: string | null): boolean => {
  if (!url || !isRemote(url)) return false;
  try {
    parseRemoteUrl(url);
    return Object.keys(getCloudflareAccessHeaders(url)).length > 0;
  } catch {
    // Invalid/userinfo URLs must fail through the resolver, never fall back to
    // an unauthenticated request by an image, player or gallery component.
    return true;
  }
};

const unlinkQuietly = async (path: string) => {
  try {
    await ReactNativeBlobUtil.fs.unlink(path);
  } catch {
    // A cancelled/redirected request may not have written a file.
  }
};

const cleanPreviousSessions = async () => {
  try {
    const directory = ReactNativeBlobUtil.fs.dirs.CacheDir;
    const files = await ReactNativeBlobUtil.fs.ls(directory);
    await Promise.all(
      files
        .filter(name => name.startsWith('cf_media_') && !name.startsWith(sessionPrefix))
        .map(name => unlinkQuietly(`${directory}/${name}`)),
    );
  } catch {
    // Cache eviction is best effort; download errors remain fail-closed below.
  }
};

const downloadMedia = async (url: string, revision: number): Promise<string> => {
  // All downloads wait for this shared sweep. It runs before any of this
  // process's partial files are written and excludes the current session.
  cacheCleanup ??= cleanPreviousSessions();
  await cacheCleanup;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${sessionId}:${revision}:${url}`,
  );
  // Retain a safe filename extension for native players and file preview apps.
  const extension = parseRemoteUrl(url).pathname.match(/\.[a-z0-9]{1,10}$/i)?.[0] ?? '';
  const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${sessionPrefix}${hash}${extension}`;
  const partialPath = `${path}.partial`;
  let currentUrl = url;

  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      if (getCloudflareAccessRevision() !== revision) throw mediaError();
      const parsed = parseRemoteUrl(currentUrl);
      // A protected download may leave the origin for signed object storage,
      // but never downgrade to plaintext HTTP.
      if (parsed.protocol !== 'https:') throw mediaError();
      const response = await ReactNativeBlobUtil.config({
        path: partialPath,
        overwrite: true,
        followRedirect: false,
        timeout: 60000,
      }).fetch('GET', parsed.href, getCloudflareAccessHeaders(parsed.href));
      const { status, headers } = response.info();
      if (getCloudflareAccessRevision() !== revision) throw mediaError();

      if ([301, 302, 303, 307, 308].includes(status)) {
        await unlinkQuietly(partialPath);
        const locationKey = Object.keys(headers).find(key => key.toLowerCase() === 'location');
        const location = locationKey ? headers[locationKey] : undefined;
        if (!location || redirects === MAX_REDIRECTS) throw mediaError();
        currentUrl = new URL(String(location), parsed.href).href;
        // Each hop gets fresh origin-scoped headers. Do not carry any headers
        // from the previous request or the Chatwoot login session.
        continue;
      }

      if (status < 200 || status >= 300) throw mediaError();
      await ReactNativeBlobUtil.fs.mv(partialPath, path);
      if (getCloudflareAccessRevision() !== revision) throw mediaError();
      return `file://${path}`;
    }
    throw mediaError();
  } catch {
    await unlinkQuietly(partialPath);
    await unlinkQuietly(path);
    // Native errors may contain request options. Never pass those to logging,
    // React state or error reporting.
    throw mediaError();
  }
};

/** Resolves protected media to a local file; external/local sources pass through. */
export const resolveCloudflareMedia = async (url: string): Promise<string> => {
  if (!url || !isRemote(url)) return url;
  parseRemoteUrl(url);
  if (!requiresCloudflareMedia(url)) return url;

  const revision = getCloudflareAccessRevision();
  const key = `${revision}:${url}`;
  const existing = downloads.get(key);
  if (existing) {
    if (!existing.completed) return existing.promise;
    try {
      const uri = await existing.promise;
      const exists = await ReactNativeBlobUtil.fs.exists(uri.slice('file://'.length));
      if (getCloudflareAccessRevision() !== revision) throw mediaError();
      if (exists) return uri;
    } catch {
      if (downloads.get(key) === existing) downloads.delete(key);
      throw mediaError();
    }
    // OS cache eviction can remove a file while the app is still running.
    // A concurrent caller may already have replaced this entry; preserve it.
    if (downloads.get(key) === existing) downloads.delete(key);
    return resolveCloudflareMedia(url);
  }
  const entry = { promise: downloadMedia(url, revision), completed: false };
  downloads.set(key, entry);
  try {
    const uri = await entry.promise;
    entry.completed = true;
    return uri;
  } catch {
    if (downloads.get(key) === entry) downloads.delete(key);
    throw mediaError();
  }
};
