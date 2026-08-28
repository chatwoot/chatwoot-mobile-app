import { checkValidUrl, extractDomain } from '../settingsUtils';

describe('extractDomain', () => {
  it.each([
    ['app.chatwoot.com', 'app.chatwoot.com'],
    ['https://app.chatwoot.com', 'app.chatwoot.com'],
    ['https://app.chatwoot.com/', 'app.chatwoot.com'],
    ['https://www.chatwoot.com', 'chatwoot.com'],
  ])('reads the host of %s', (url, expected) => {
    expect(extractDomain({ url })).toBe(expected);
  });

  it.each([
    ['   https://app.chatwoot.com', 'app.chatwoot.com'],
    ['  app.chatwoot.com  ', 'app.chatwoot.com'],
    ['https://app.chatwoot.com\n', 'app.chatwoot.com'],
  ])('drops the whitespace around %j', (url, expected) => {
    expect(extractDomain({ url })).toBe(expected);
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
