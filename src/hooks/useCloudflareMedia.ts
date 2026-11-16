import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  getCloudflareAccessRevision,
  subscribeCloudflareAccess,
} from '@/services/cloudflareAccess';
import { requiresCloudflareMedia, resolveCloudflareMedia } from '@/utils/cloudflareMedia';

type MediaResult = {
  url: string;
  revision: number;
  uri: string | null;
  failed: boolean;
  retry: number;
};

export const useCloudflareMedia = (url?: string | null, retry = 0, enabled = true) => {
  const revision = useSyncExternalStore(
    subscribeCloudflareAccess,
    getCloudflareAccessRevision,
    getCloudflareAccessRevision,
  );
  const protectedSource = requiresCloudflareMedia(url);
  const [result, setResult] = useState<MediaResult | null>(null);
  const current =
    result?.url === url && result?.revision === revision && result?.retry === retry ? result : null;

  useEffect(() => {
    if (!url || !protectedSource || !enabled) return;
    let active = true;
    resolveCloudflareMedia(url).then(
      uri => active && setResult({ url, revision, uri, failed: false, retry }),
      () => active && setResult({ url, revision, uri: null, failed: true, retry }),
    );
    return () => {
      active = false;
    };
  }, [url, revision, protectedSource, retry, enabled]);

  return {
    uri: protectedSource ? (enabled ? (current?.uri ?? null) : null) : (url ?? null),
    loading: protectedSource && enabled && !current,
    failed: protectedSource && enabled && !!current?.failed,
  };
};
