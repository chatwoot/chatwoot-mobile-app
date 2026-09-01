import { getStateFromPath } from '@react-navigation/native';

import { CHATWOOT_APP_URL, SSO_CALLBACK_URL } from '@/constants';
import { getLinkingPrefixes, linkingConfig } from '@/navigation/linking';

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

    expect(getStateFromPath(path, linkingConfig)).toMatchObject({
      routes: [
        {
          name: 'ChatScreen',
          params: {
            accountId: 42,
            conversationId: 314,
          },
        },
      ],
    });
  });

  it('ignores custom-scheme links outside the configured conversation route', () => {
    expect(getStateFromPath('settings', linkingConfig)).toBeUndefined();
  });
});
