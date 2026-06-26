const DEFAULT_BASE_URL = 'https://services.synapz.tech/webhook';

/** n8n webhook base, env-overridable. Trailing slash stripped. */
function baseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_N8N_BASE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/$/, '');
}

/** Full URL of the network-diagnostics webhook (`POST`). */
export function getNetworkDiagnosticsUrl(): string {
  return `${baseUrl()}/casos-diagnostico-rede`;
}
