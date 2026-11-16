import * as SecureStore from 'expo-secure-store';

export interface CloudflareAccessCredentials {
  clientId: string;
  clientSecret: string;
}

interface StoredAccess extends CloudflareAccessCredentials {
  origin: string;
}

const STORAGE_KEY = 'chatwoot.cloudflare-access.v1';
const STORAGE_OPTIONS = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

let access: StoredAccess | null = null;
let loading: Promise<void> | undefined;
let storageFailed = false;
let revision = 0;
const listeners = new Set<() => void>();

// WSS uses the same credentials as HTTPS, but no other scheme or origin does.
export const cloudflareAccessOrigin = (url: string): string | null => {
  try {
    if (/\s/.test(url)) return null;
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return null;
    if (parsed.protocol === 'wss:') parsed.protocol = 'https:';
    return parsed.protocol === 'https:' ? parsed.origin : null;
  } catch {
    return null;
  }
};

export const validateCloudflareAccessCredentials = (
  credentials: CloudflareAccessCredentials,
): CloudflareAccessCredentials => {
  const clientId = credentials.clientId.trim();
  const clientSecret = credentials.clientSecret.trim();
  // Do not assume a fixed secret format; Cloudflare supports multiple formats.
  if (!clientId || !clientSecret || /\s/.test(clientId + clientSecret)) {
    throw new Error('Invalid Cloudflare Access credentials');
  }
  return { clientId, clientSecret };
};

export const loadCloudflareAccess = (): Promise<void> => {
  loading ??= Promise.resolve().then(async () => {
    const initialRevision = revision;
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY, STORAGE_OPTIONS);
      let next: StoredAccess | null = null;
      if (stored) {
        const parsed: StoredAccess = JSON.parse(stored);
        if (cloudflareAccessOrigin(parsed.origin) !== parsed.origin) throw new Error();
        next = { origin: parsed.origin, ...validateCloudflareAccessCredentials(parsed) };
      }
      // An explicit save may have completed while this native read was pending.
      if (revision !== initialRevision) return;
      access = next;
      storageFailed = false;
      revision += 1;
      listeners.forEach(listener => listener());
    } catch {
      if (revision !== initialRevision) return;
      storageFailed = true;
      loading = undefined;
      throw new Error('Cloudflare Access secure storage is unavailable');
    }
  });
  return loading;
};

export const getCloudflareAccessCredentials = (url: string): CloudflareAccessCredentials | null => {
  if (storageFailed) throw new Error('Cloudflare Access secure storage is unavailable');
  if (!access || cloudflareAccessOrigin(url) !== access.origin) return null;
  return { clientId: access.clientId, clientSecret: access.clientSecret };
};

export const cloudflareAccessHeaders = (
  credentials: CloudflareAccessCredentials | null,
): Record<string, string> =>
  credentials
    ? {
        'CF-Access-Client-Id': credentials.clientId,
        'CF-Access-Client-Secret': credentials.clientSecret,
      }
    : {};

export const getCloudflareAccessHeaders = (url: string): Record<string, string> =>
  cloudflareAccessHeaders(getCloudflareAccessCredentials(url));

export const saveCloudflareAccess = async (
  url: string,
  credentials: CloudflareAccessCredentials | null,
): Promise<void> => {
  const origin = cloudflareAccessOrigin(url);
  if (!origin) throw new Error('Cloudflare Access requires an HTTPS server');
  const next = credentials ? { origin, ...validateCloudflareAccessCredentials(credentials) } : null;
  try {
    if (next) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next), STORAGE_OPTIONS);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY, STORAGE_OPTIONS);
    }
  } catch {
    throw new Error('Cloudflare Access secure storage is unavailable');
  }
  // Publish only after persistence succeeds. No secret enters Redux or actions.
  access = next;
  storageFailed = false;
  loading = Promise.resolve();
  revision += 1;
  listeners.forEach(listener => listener());
};

export const getCloudflareAccessRevision = () => revision;
export const subscribeCloudflareAccess = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
