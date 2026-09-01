import { CHATWOOT_APP_URL, SSO_CALLBACK_URL } from '@/constants';
import { getConversationParamsFromPath, getLinkingPrefixes } from '@/navigation/linking';

describe('navigation linking', () => {
  const installationUrl = 'https://chat.example.com/';

  it('accepts web links from the configured installation and custom-scheme links', () => {
    expect(getLinkingPrefixes(installationUrl)).toEqual([installationUrl, CHATWOOT_APP_URL]);
  });

  it('keeps the SSO callback on the custom scheme', () => {
    expect(SSO_CALLBACK_URL).toBe(`${CHATWOOT_APP_URL}auth/saml`);
  });

  it('parses a custom-scheme conversation link', () => {
    const url = `${CHATWOOT_APP_URL}app/accounts/42/conversations/314`;
    const path = url.slice(CHATWOOT_APP_URL.length);

    expect(getConversationParamsFromPath(path)).toMatchObject({
      accountId: 42,
      conversationId: 314,
    });
  });

  it.each(['settings', 'settings/conversations/314', 'foo/conversations/314'])(
    'ignores custom-scheme path %s outside the configured conversation route',
    path => {
      expect(getConversationParamsFromPath(path)).toBeNull();
    },
  );
});
