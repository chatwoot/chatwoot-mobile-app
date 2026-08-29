import { AxiosError, AxiosHeaders } from 'axios';

import { isUnreportableError, isUnactionablePushError } from '../sentryUtils';

const axiosErrorWithStatus = (status: number) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', String(status), config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: null,
  });
};

describe('isUnreportableError', () => {
  it('drops a request that never reached the server', () => {
    expect(isUnreportableError(new AxiosError('Network Error'))).toBe(true);
  });

  it('drops an expired session', () => {
    expect(isUnreportableError(axiosErrorWithStatus(401))).toBe(true);
  });

  it('drops server-side failures', () => {
    expect(isUnreportableError(axiosErrorWithStatus(500))).toBe(true);
    expect(isUnreportableError(axiosErrorWithStatus(502))).toBe(true);
    expect(isUnreportableError(axiosErrorWithStatus(503))).toBe(true);
  });

  it('keeps client errors that point at the app', () => {
    expect(isUnreportableError(axiosErrorWithStatus(404))).toBe(false);
    expect(isUnreportableError(axiosErrorWithStatus(422))).toBe(false);
  });

  it('keeps errors that are not requests', () => {
    expect(isUnreportableError(new TypeError('Cannot read property of undefined'))).toBe(false);
  });
});

describe('isUnactionablePushError', () => {
  it.each([
    'MISSING_INSTANCEID_SERVICE',
    '[messaging/unknown] SERVICE_NOT_AVAILABLE',
    '[messaging/unknown] java.io.IOException: java.util.concurrent.ExecutionException: java.io.IOException: FIS_AUTH_ERROR',
    'A TLS error caused the secure connection to fail.',
    'An SSL error has occurred and a secure connection to the server cannot be made.',
    'A server with the specified hostname could not be found.',
    'No APNS token specified before fetching FCM Token',
  ])('drops %s', message => {
    expect(isUnactionablePushError(new Error(message))).toBe(true);
  });

  it('keeps a registration failure the app can act on', () => {
    expect(isUnactionablePushError(new Error('[messaging/invalid-argument]'))).toBe(false);
  });
});
