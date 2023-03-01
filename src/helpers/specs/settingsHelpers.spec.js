import { extractDomain, checkValidUrl } from '../settingsHelper';

describe('SettingsHelper', () => {
  describe('extractDomain', () => {
    it('should return the domain from a https url', () => {
      const url = 'https://www.app.chatwoot.com';
      const domain = extractDomain({ url });
      expect(domain).toEqual('app.chatwoot.com');
    });

    it('should return the domain', () => {
      const url = 'app.chatwoot.com';
      const domain = extractDomain({ url });
      expect(domain).toEqual('app.chatwoot.com');
    });

    it('should return the domain from subdomain 1', () => {
      const url = 'https://app.chatwoot.com';
      const domain = extractDomain({ url });
      expect(domain).toEqual('app.chatwoot.com');
    });

    it('should return the domain from subdomain 2', () => {
      const url = 'https://mobile.chatwoot.app';
      const domain = extractDomain({ url });
      expect(domain).toEqual('mobile.chatwoot.app');
    });

    it('should return true for valid url 3', () => {
      const url = 'mobile.chatwoot.app';
      const domain = extractDomain({ url });
      expect(domain).toEqual('mobile.chatwoot.app');
    });

    it('should return the domain from subdomain 4', () => {
      const url = 'subdomain.domain.tld';
      const domain = extractDomain({ url });
      expect(domain).toEqual('subdomain.domain.tld');
    });

    it('should return the domain from subdomain 5', () => {
      const url = 'sub1.sub2.domain.tld';
      const domain = extractDomain({ url });
      expect(domain).toEqual('sub1.sub2.domain.tld');
    });
  });

  describe('checkValidUrl', () => {
    it('should return true for valid url 1', () => {
      const url = 'https://www.chatwoot.com';
      const domain = checkValidUrl({ url });
      expect(domain).toEqual(true);
    });

    it('should return true for valid url 2', () => {
      const url = 'http://.chatwoot.com';
      const domain = checkValidUrl({ url });
      expect(domain).toEqual(true);
    });

    it('should return true for valid url 4', () => {
      const url = 'ht://app.chatwoot.com';
      const domain = checkValidUrl({ url });
      expect(domain).toEqual(true);
    });

    it('should return false for invalid url 1', () => {
      const url = 'app.chatwoot.com';
      const domain = checkValidUrl({ url });
      expect(domain).toEqual(false);
    });

    it('should return false for invalid url 2', () => {
      const url = 'mobile.chatwoot.app';
      const domain = checkValidUrl({ url });
      expect(domain).toEqual(false);
    });
  });
});
