import axios, { AxiosAdapter, AxiosError, AxiosHeaders, CanceledError } from 'axios';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  cloudflareAccessHeaders,
  cloudflareAccessOrigin,
  type CloudflareAccessCredentials,
} from './cloudflareAccess';

type NativeFormPart = {
  fieldName: string;
  string?: string;
  uri?: string;
  name?: string;
  type?: string;
};

// The native XHR adapter follows redirects and may retain custom headers.
// Protected API requests use this adapter, which never follows redirects.
// Credentials stay in this closure, outside Axios configs and error reports.
export const createCloudflareAccessAdapter =
  (origin: string, credentials: CloudflareAccessCredentials): AxiosAdapter =>
  async config => {
    const url = axios.getUri(config);
    if (cloudflareAccessOrigin(url) !== origin) {
      throw new AxiosError('Cloudflare Access server does not match', 'ERR_BAD_REQUEST');
    }
    if (config.signal?.aborted) throw new CanceledError();
    config.cancelToken?.throwIfRequested();

    const headers = AxiosHeaders.from(config.headers);
    let body = config.data;
    if (body && typeof body.getParts === 'function') {
      // BlobUtil builds the multipart boundary. Preserve repeated field names.
      headers.setContentType('multipart/form-data');
      body = body.getParts().map((part: NativeFormPart) => {
        if (!part.uri) return { name: part.fieldName, data: part.string ?? '' };
        const uri = part.uri.startsWith('file://') ? part.uri.slice(7) : part.uri;
        return {
          name: part.fieldName,
          filename: part.name ?? 'attachment',
          type: part.type ?? 'application/octet-stream',
          data: ReactNativeBlobUtil.wrap(uri),
        };
      });
    }

    const requestHeaders: Record<string, string> = {};
    Object.entries(headers.toJSON()).forEach(([key, value]) => {
      if (value != null && value !== false) requestHeaders[key] = String(value);
    });
    Object.assign(requestHeaders, cloudflareAccessHeaders(credentials));

    let task: ReturnType<typeof ReactNativeBlobUtil.fetch>;
    try {
      task = ReactNativeBlobUtil.config({
        followRedirect: false,
        timeout: config.timeout || 30000,
      }).fetch(
        (config.method ?? 'GET').toUpperCase() as Parameters<typeof ReactNativeBlobUtil.fetch>[0],
        url,
        requestHeaders,
        body,
      );
    } catch {
      throw new AxiosError('Cloudflare Access request failed', AxiosError.ERR_NETWORK, config);
    }

    const cancel = () => {
      task.cancel();
    };
    config.signal?.addEventListener?.('abort', cancel);
    // Axios implements these methods, but omits them from CancelToken's type.
    const cancelToken = config.cancelToken as typeof config.cancelToken & {
      subscribe: (listener: () => void) => void;
      unsubscribe: (listener: () => void) => void;
    };
    cancelToken?.subscribe(cancel);
    if (config.onUploadProgress) {
      task.uploadProgress((sent, total) =>
        config.onUploadProgress?.({
          loaded: Number(sent),
          total: Number(total),
          lengthComputable: Number(total) > 0,
          bytes: Number(sent),
          upload: true,
        }),
      );
    }
    if (config.onDownloadProgress) {
      task.progress((received, total) =>
        config.onDownloadProgress?.({
          loaded: Number(received),
          total: Number(total),
          lengthComputable: Number(total) > 0,
          bytes: Number(received),
          download: true,
        }),
      );
    }

    try {
      const nativeResponse = await task;
      const info = nativeResponse.info();
      const response = {
        data: await nativeResponse.text(),
        status: info.status,
        statusText: String(info.status),
        headers: AxiosHeaders.from(info.headers),
        config,
      };
      // Axios applies its normal JSON transform after the adapter returns.
      if (
        (info.status >= 300 && info.status < 400) ||
        (config.validateStatus && !config.validateStatus(info.status))
      ) {
        throw new AxiosError(
          `Request failed with status code ${info.status}`,
          info.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
          config,
          undefined,
          response,
        );
      }
      return response;
    } catch (error) {
      if (config.signal?.aborted || axios.isCancel(error)) throw new CanceledError();
      config.cancelToken?.throwIfRequested();
      if (axios.isAxiosError(error)) throw error;
      // Native errors are deliberately not attached: they may contain request data.
      throw new AxiosError('Cloudflare Access request failed', AxiosError.ERR_NETWORK, config);
    } finally {
      config.signal?.removeEventListener?.('abort', cancel);
      cancelToken?.unsubscribe(cancel);
    }
  };
