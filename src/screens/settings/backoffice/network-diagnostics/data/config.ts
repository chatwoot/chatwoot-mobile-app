const DEFAULT_BASE_URL = 'https://services.synapz.tech/webhook';

const ROUTE = 'casos-diagnostico-rede';

/** Appends the webhook route to a base URL, stripping a trailing slash. */
export function buildDiagnosticsUrl(base: string): string {
  return `${base.replace(/\/$/, '')}/${ROUTE}`;
}

/**
 * Full URL of the network-diagnostics webhook (`POST`). The base comes from
 * `EXPO_PUBLIC_N8N_BASE_URL`, which Expo inlines at build time (default
 * `https://services.synapz.tech/webhook`).
 */
export function getNetworkDiagnosticsUrl(): string {
  return buildDiagnosticsUrl(process.env.EXPO_PUBLIC_N8N_BASE_URL || DEFAULT_BASE_URL);
}
