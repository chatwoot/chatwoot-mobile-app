import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';
import { URL_TYPE } from '@/constants/url';

export const handleApiError = (error: unknown, customErrorMsg?: string) => {
  const errorMessage = error instanceof Error ? error.message : I18n.t('CONFIGURE_URL.ERROR');
  showToast({ message: errorMessage });
  return errorMessage;
};

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * The host of a Chatwoot installation, including a port when one is given.
 *
 * The field takes a bare host, but a paste can carry a scheme, a path, a
 * trailing slash or surrounding whitespace. Parsing as a URL normalizes all of
 * them; input without a scheme gets one so it parses as a host rather than a
 * path. Input carrying a scheme it cannot be parsed with holds no host and
 * resolves to an empty string; anything else is returned trimmed, for
 * `checkValidUrl` to reject.
 */
export const extractDomain = ({ url }: { url: string }) => {
  const trimmedUrl = url.trim();
  const hasScheme = SCHEME.test(trimmedUrl);

  // The URL parser strips tabs and line breaks out of its input, which joins the
  // text around them into a host that was never entered. Such a value is returned
  // unparsed, for `checkValidUrl` to reject.
  if (/\s/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  try {
    const { host } = new URL(hasScheme ? trimmedUrl : `${URL_TYPE}${trimmedUrl}`);
    return host;
  } catch {
    return hasScheme ? '' : trimmedUrl;
  }
};

/**
 * Extracts http:// or https:// scheme if present in the input url.
 */
export const extractScheme = ({ url }: { url: string }): 'http://' | 'https://' | null => {
  const trimmedUrl = url.trim();
  const match = trimmedUrl.match(/^([a-z][a-z0-9+.-]*):\/\//i);
  if (match) {
    const scheme = match[1].toLowerCase();
    if (scheme === 'http') {
      return 'http://';
    }
    if (scheme === 'https') {
      return 'https://';
    }
  }
  return null;
};

/**
 * The Action Cable endpoint for a host. Always derived from the extracted host,
 * since a scheme left in the value produces an endpoint that never connects.
 */
export const buildWebSocketUrl = (host: string, protocol: 'ws' | 'wss' = 'wss') =>
  `${protocol}://${host}/cable`;

/**
 * Replaces a persisted websocket URL that disagrees with the stored host, which
 * cannot connect. `settings` survives logout, so such a value would otherwise
 * persist for the lifetime of the install.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const repairPersistedWebSocketUrl = (state: any) => {
  const { baseUrl, webSocketUrl, installationUrl } = state?.settings ?? {};
  if (!baseUrl) {
    return state;
  }

  const protocol = installationUrl?.startsWith('http://') ? 'ws' : 'wss';
  const expectedUrl = buildWebSocketUrl(baseUrl, protocol);
  if (webSocketUrl === expectedUrl) {
    return state;
  }

  return { ...state, settings: { ...state.settings, webSocketUrl: expectedUrl } };
};

/**
 * Takes an absolute URL. Whitespace is rejected on its own, since the URL
 * constructor accepts more than the platform's networking stack does.
 */
export const checkValidUrl = ({ url }: { url: string }): boolean => {
  if (!url || /\s/.test(url)) {
    return false;
  }
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

/**
 * Checks whether a hostname refers to a local or private network address (RFC 1918 / RFC 3927 / localhost / loopback).
 */
export const isLocalOrPrivateHost = (hostname: string): boolean => {
  if (!hostname) {
    return false;
  }
  let canonicalHost = hostname;
  try {
    const wrapped =
      hostname.includes(':') && !hostname.startsWith('[') ? `[${hostname}]` : hostname;
    // Canonicalize IPv4 octets / IPv6 using the standard WHATWG URL parser
    canonicalHost = new URL(`http://${wrapped}`).hostname;
  } catch {
    // Fallback if not directly parseable
  }
  const clean = canonicalHost
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase();
  if (
    clean === 'localhost' ||
    clean.endsWith('.localhost') ||
    clean.endsWith('.local') ||
    clean.endsWith('.lan') ||
    clean.endsWith('.internal')
  ) {
    return true;
  }

  const ipv4Match = clean.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b, c, d] = ipv4Match.map(Number);
    if ([a, b, c, d].some(n => n < 0 || n > 255)) {
      return false;
    }
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16
    return false;
  }

  if (clean === '::1' || clean === '0:0:0:0:0:0:0:1') {
    return true;
  }
  if (/^(fc|fd)[0-9a-f]{2}:/i.test(clean)) {
    return true;
  }
  if (/^fe[89ab][0-9a-f]:/i.test(clean)) {
    return true;
  }

  return false;
};

export interface UrlDetails {
  hostname: string;
  port: string;
  scheme: 'http://' | 'https://' | null;
  hasWhitespace: boolean;
  isValid: boolean;
}

/**
 * Parses raw field input without stripping explicit ports like 443 before protocol selection.
 */
export const extractUrlDetails = ({ url }: { url: string }): UrlDetails => {
  const trimmedUrl = url.trim();
  const hasWhitespace = /\s/.test(trimmedUrl);
  const scheme = extractScheme({ url: trimmedUrl });
  const hasUnsupportedScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedUrl) && !scheme;

  if (!trimmedUrl || hasWhitespace || hasUnsupportedScheme) {
    return {
      hostname: '',
      port: '',
      scheme: null,
      hasWhitespace,
      isValid: false,
    };
  }

  try {
    const rawWithoutScheme = trimmedUrl.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    const parsed = new URL(`http://${rawWithoutScheme}`);
    const hostname = parsed.hostname;
    const explicitPortMatch = rawWithoutScheme.split(/[/?#]/)[0].match(/:(\d+)$/);
    const port = explicitPortMatch ? explicitPortMatch[1] : parsed.port;

    return {
      hostname,
      port,
      scheme,
      hasWhitespace: false,
      isValid: Boolean(hostname),
    };
  } catch {
    return {
      hostname: '',
      port: '',
      scheme: null,
      hasWhitespace: false,
      isValid: false,
    };
  }
};

/**
 * Validates whether the user input can be parsed into a valid installation URL or host.
 */
export const checkValidInstallationUrl = (input: string): boolean => {
  if (!input) {
    return false;
  }
  const details = extractUrlDetails({ url: input });
  if (!details.isValid || details.hasWhitespace || !details.hostname) {
    return false;
  }
  const host = details.hostname.replace(/\.$/, '');
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('[') ||
    host.includes('.') ||
    Boolean(details.port)
  );
};

/**
 * Resolves the initial URL to display in the URL configuration editor.
 * Retains explicit http:// schemes (to prevent public HTTP setups from being rejected on resubmission)
 * as well as https:// schemes for local endpoints (to prevent silent cleartext HTTP fallback on failure).
 */
export const getInitialUrl = ({
  baseUrl,
  installationUrl,
  appName,
}: {
  baseUrl?: string | null;
  installationUrl?: string | null;
  appName?: string | null;
}): string => {
  if (installationUrl) {
    if (installationUrl.startsWith('http://')) {
      return installationUrl.replace(/\/$/, '');
    }
    try {
      const parsedHost = new URL(installationUrl).hostname;
      if (isLocalOrPrivateHost(parsedHost)) {
        return installationUrl.replace(/\/$/, '');
      }
    } catch {
      // Fallback to baseUrl
    }
  }
  if (baseUrl) {
    return baseUrl;
  }
  if (installationUrl) {
    return installationUrl.replace(/\/$/, '');
  }
  return appName === 'Chatwoot' ? 'app.chatwoot.com' : '';
};
