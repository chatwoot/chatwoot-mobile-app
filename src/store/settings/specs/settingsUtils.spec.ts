import {
  buildWebSocketUrl,
  checkValidInstallationUrl,
  checkValidUrl,
  extractDomain,
  extractScheme,
  extractUrlDetails,
  isLocalOrPrivateHost,
  repairPersistedWebSocketUrl,
} from '../settingsUtils';

describe('extractDomain', () => {
  it.each([
    ['app.chatwoot.com', 'app.chatwoot.com'],
    ['https://app.chatwoot.com', 'app.chatwoot.com'],
    ['http://app.chatwoot.com', 'app.chatwoot.com'],
    ['HTTPS://App.Chatwoot.COM', 'app.chatwoot.com'],
  ])('reads the host of %s', (url, expected) => {
    expect(extractDomain({ url })).toBe(expected);
  });

  it.each([
    ['https://app.chatwoot.com/', 'app.chatwoot.com'],
    ['app.chatwoot.com/', 'app.chatwoot.com'],
    ['https://app.chatwoot.com/app/accounts/1', 'app.chatwoot.com'],
    ['app.chatwoot.com/app/accounts/1', 'app.chatwoot.com'],
    ['https://app.chatwoot.com/#/app', 'app.chatwoot.com'],
  ])('drops the path of %s', (url, expected) => {
    expect(extractDomain({ url })).toBe(expected);
  });

  it.each([
    ['https://chatwoot.example.com:3000', 'chatwoot.example.com:3000'],
    ['chatwoot.example.com:3000', 'chatwoot.example.com:3000'],
    ['https://chatwoot.example.com:3000/', 'chatwoot.example.com:3000'],
  ])('keeps the port of %s', (url, expected) => {
    expect(extractDomain({ url })).toBe(expected);
  });

  it('keeps a www host, which is a different host from the bare domain', () => {
    expect(extractDomain({ url: 'https://www.chatwoot.com' })).toBe('www.chatwoot.com');
  });

  it.each([
    ['   https://app.chatwoot.com', 'app.chatwoot.com'],
    ['  app.chatwoot.com  ', 'app.chatwoot.com'],
    ['https://app.chatwoot.com\n', 'app.chatwoot.com'],
  ])('drops the whitespace around %j', (url, expected) => {
    expect(extractDomain({ url })).toBe(expected);
  });

  it.each([['https://'], ['https:// ']])('holds no host for the scheme %j alone', url => {
    expect(extractDomain({ url })).toBe('');
  });

  it('returns unparseable input for the validator to reject', () => {
    expect(extractDomain({ url: 'app chatwoot com' })).toBe('app chatwoot com');
  });

  it.each([
    ['trusted.example\n.evil.example'],
    ['trusted.example\t.evil.example'],
    ['trusted.example\r.evil.example'],
    ['https://trusted.example\n.evil.example'],
  ])('does not join %j around its whitespace into another host', url => {
    const host = extractDomain({ url });

    expect(host).toBe(url.trim());
    expect(checkValidUrl({ url: `https://${host}/` })).toBe(false);
  });
});

describe('extractScheme', () => {
  it.each([
    ['http://192.168.0.71:9668', 'http://'],
    ['HTTP://192.168.0.71:9668/', 'http://'],
    ['https://app.chatwoot.com', 'https://'],
    ['HTTPS://APP.CHATWOOT.COM/', 'https://'],
  ])('extracts %s as %s', (url, expected) => {
    expect(extractScheme({ url })).toBe(expected);
  });

  it.each(['192.168.0.71:9668', 'app.chatwoot.com', 'ftp://app.chatwoot.com', ''])(
    'returns null for %s without valid http(s) scheme',
    url => {
      expect(extractScheme({ url })).toBeNull();
    },
  );
});

describe('buildWebSocketUrl', () => {
  it.each([
    ['app.chatwoot.com', 'wss://app.chatwoot.com/cable'],
    ['chatwoot.example.com:3000', 'wss://chatwoot.example.com:3000/cable'],
  ])('builds the cable endpoint for %s', (host, expected) => {
    expect(buildWebSocketUrl(host)).toBe(expected);
  });

  it('builds insecure ws cable endpoint when protocol is ws', () => {
    expect(buildWebSocketUrl('192.168.0.71:9668', 'ws')).toBe('ws://192.168.0.71:9668/cable');
  });
});

describe('repairPersistedWebSocketUrl', () => {
  const stateWith = (settings: Record<string, string>) => ({ settings, auth: { user: 1 } });

  it('rebuilds a websocket URL that kept the scheme of the configured value', () => {
    const state = stateWith({
      baseUrl: 'app.chatwoot.com',
      installationUrl: 'https://app.chatwoot.com/',
      webSocketUrl: 'wss://https://app.chatwoot.com/cable',
    });

    expect(repairPersistedWebSocketUrl(state).settings).toEqual({
      baseUrl: 'app.chatwoot.com',
      installationUrl: 'https://app.chatwoot.com/',
      webSocketUrl: 'wss://app.chatwoot.com/cable',
    });
  });

  it('rebuilds a websocket URL with ws scheme when installationUrl is http', () => {
    const state = stateWith({
      baseUrl: '192.168.0.71:9668',
      installationUrl: 'http://192.168.0.71:9668/',
      webSocketUrl: 'wss://192.168.0.71:9668/cable',
    });

    expect(repairPersistedWebSocketUrl(state).settings).toEqual({
      baseUrl: '192.168.0.71:9668',
      installationUrl: 'http://192.168.0.71:9668/',
      webSocketUrl: 'ws://192.168.0.71:9668/cable',
    });
  });

  it('leaves the rest of the persisted state untouched', () => {
    const state = stateWith({ baseUrl: 'app.chatwoot.com', webSocketUrl: 'wss://stale/cable' });

    expect(repairPersistedWebSocketUrl(state).auth).toEqual(state.auth);
  });

  it('returns the same state when the websocket URL already matches the host', () => {
    const state = stateWith({
      baseUrl: 'app.chatwoot.com',
      webSocketUrl: 'wss://app.chatwoot.com/cable',
    });

    expect(repairPersistedWebSocketUrl(state)).toBe(state);
  });

  it('returns the same state when no host has been configured', () => {
    const state = stateWith({ baseUrl: '', webSocketUrl: '' });

    expect(repairPersistedWebSocketUrl(state)).toBe(state);
  });
});

describe('checkValidUrl', () => {
  it('accepts an absolute URL', () => {
    expect(checkValidUrl({ url: 'https://app.chatwoot.com/' })).toBe(true);
  });

  it('rejects a URL holding whitespace', () => {
    expect(checkValidUrl({ url: 'https://   https://app.chatwoot.com/' })).toBe(false);
  });

  it('rejects an unparseable URL', () => {
    expect(checkValidUrl({ url: 'app.chatwoot.com' })).toBe(false);
  });

  it('rejects an empty URL', () => {
    expect(checkValidUrl({ url: '' })).toBe(false);
  });
});

describe('isLocalOrPrivateHost', () => {
  it.each([
    ['localhost', true],
    ['chatwoot.localhost', true],
    ['chatwoot.local', true],
    ['chatwoot.lan', true],
    ['chatwoot.internal', true],
    ['localhost.', true],
    ['chatwoot.localhost.', true],
    ['chatwoot.local.', true],
    ['chatwoot.lan.', true],
    ['chatwoot.internal.', true],
    ['127.0.0.1', true],
    ['10.0.2.2', true],
    ['172.20.10.2', true],
    ['192.168.0.71', true],
    ['169.254.1.1', true],
    ['::1', true],
    ['[::1]', true],
    ['[fd12::1]', true],
    ['fd12::1', true],
    ['010.0.0.1', false],
    ['0x7f000001', true],
    ['chatwoot.example.com.', false],
    ['app.chatwoot.com', false],
    ['chatwoot.example.com', false],
    ['8.8.8.8', false],
    ['', false],
  ])('returns %s for host %s', (host, expected) => {
    expect(isLocalOrPrivateHost(host)).toBe(expected);
  });
});

describe('extractUrlDetails', () => {
  it('preserves explicit port 443 on bare host', () => {
    const details = extractUrlDetails({ url: '192.168.0.71:443' });
    expect(details).toEqual({
      hostname: '192.168.0.71',
      port: '443',
      scheme: null,
      hasWhitespace: false,
      isValid: true,
    });
  });

  it('preserves explicit port 80 on bare host', () => {
    const details = extractUrlDetails({ url: '192.168.0.71:80' });
    expect(details).toEqual({
      hostname: '192.168.0.71',
      port: '80',
      scheme: null,
      hasWhitespace: false,
      isValid: true,
    });
  });

  it('extracts complete pasted URL with path and fragment', () => {
    const details = extractUrlDetails({ url: 'https://app.chatwoot.com/#/app' });
    expect(details).toEqual({
      hostname: 'app.chatwoot.com',
      port: '',
      scheme: 'https://',
      hasWhitespace: false,
      isValid: true,
    });
  });

  it('extracts URL with query string', () => {
    const details = extractUrlDetails({
      url: 'https://app.chatwoot.com/app/accounts/1?token=abc%20123',
    });
    expect(details).toEqual({
      hostname: 'app.chatwoot.com',
      port: '',
      scheme: 'https://',
      hasWhitespace: false,
      isValid: true,
    });
  });

  it('rejects input with whitespace', () => {
    const details = extractUrlDetails({ url: 'app chatwoot com' });
    expect(details.isValid).toBe(false);
    expect(details.hasWhitespace).toBe(true);
  });

  it('extracts bracketed IPv6 with explicit port', () => {
    const details = extractUrlDetails({ url: 'http://[fd12::1]:3000' });
    expect(details).toEqual({
      hostname: '[fd12::1]',
      port: '3000',
      scheme: 'http://',
      hasWhitespace: false,
      isValid: true,
    });
  });

  it('extracts fully qualified domain with trailing dot', () => {
    const details = extractUrlDetails({ url: 'https://chatwoot.example.com./' });
    expect(details).toEqual({
      hostname: 'chatwoot.example.com.',
      port: '',
      scheme: 'https://',
      hasWhitespace: false,
      isValid: true,
    });
  });

  it('rejects unsupported schemes like ftp', () => {
    const details = extractUrlDetails({ url: 'ftp://app.chatwoot.com' });
    expect(details.isValid).toBe(false);
  });
});

describe('checkValidInstallationUrl', () => {
  it.each([
    ['app.chatwoot.com', true],
    ['https://app.chatwoot.com', true],
    ['https://app.chatwoot.com/', true],
    ['https://app.chatwoot.com/app', true],
    ['https://app.chatwoot.com/#/app', true],
    ['http://192.168.0.71:9668/', true],
    ['192.168.0.71:9668', true],
    ['http://[fd12::1]:3000', true],
    ['[fd12::1]:3000', true],
    ['https://chatwoot.example.com./', true],
    ['chatwoot.example.com.', true],
    ['localhost:3000', true],
    ['localhost', true],
    ['localhost.', true],
    ['http://localhost:3000', true],
    ['chatwoot.local', true],
    ['chatwoot.local.', true],
    ['custom-host:8080', true],
    ['app chatwoot com', false],
    ['https://', false],
    ['http://', false],
    ['', false],
    ['   ', false],
    ['ftp://app.chatwoot.com', false],
    ['javascript:alert(1)', false],
    [':::3000', false],
    ['random-string-no-dot-no-port', false],
  ])('returns %s for input %s', (input, expected) => {
    expect(checkValidInstallationUrl(input)).toBe(expected);
  });
});
