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
 * The Action Cable endpoint for a host. Always derived from the extracted host,
 * since a scheme left in the value produces an endpoint that never connects.
 */
export const buildWebSocketUrl = (host: string) => `wss://${host}/cable`;

/**
 * Replaces a persisted websocket URL that disagrees with the stored host, which
 * cannot connect. `settings` survives logout, so such a value would otherwise
 * persist for the lifetime of the install.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const repairPersistedWebSocketUrl = (state: any) => {
  const { baseUrl, webSocketUrl } = state?.settings ?? {};
  if (!baseUrl) {
    return state;
  }

  const expectedUrl = buildWebSocketUrl(baseUrl);
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
