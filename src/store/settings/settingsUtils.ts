import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';

export const handleApiError = (error: unknown, customErrorMsg?: string) => {
  const errorMessage = error instanceof Error ? error.message : I18n.t('CONFIGURE_URL.ERROR');
  showToast({ message: errorMessage });
  return errorMessage;
};

/**
 * The host of a Chatwoot installation. The field accepts a bare host, and a
 * keyboard or a paste can add surrounding whitespace, so the input is trimmed
 * before any scheme is stripped.
 */
export const extractDomain = ({ url }: { url: string }) => {
  const trimmedUrl = url.trim();
  const domain = trimmedUrl.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (
    domain != null &&
    domain.length > 2 &&
    typeof domain[2] === 'string' &&
    domain[2].length > 0
  ) {
    return domain[2];
  }
  return trimmedUrl;
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
