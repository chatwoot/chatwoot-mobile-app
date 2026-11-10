import {
  buildWebSocketUrl,
  checkValidUrl,
  extractDomain,
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

describe('buildWebSocketUrl', () => {
  it.each([
    ['app.chatwoot.com', 'wss://app.chatwoot.com/cable'],
    ['chatwoot.example.com:3000', 'wss://chatwoot.example.com:3000/cable'],
  ])('builds the cable endpoint for %s', (host, expected) => {
    expect(buildWebSocketUrl(host)).toBe(expected);
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
