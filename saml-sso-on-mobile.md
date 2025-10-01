# SAML SSO on Mobile (React Native + Expo)

This document describes how to extend Chatwoot’s existing SAML SSO support (web dashboard) to the mobile apps built with **React Native + Expo**.

---

## 1. Expo Config

Add a **custom scheme** to support deep linking back from the IdP to the app:

```ts
// app.config.ts
export default {
  scheme: 'chatwootapp', // 👈 custom redirect scheme
  ios: {
    bundleIdentifier: 'com.chatwoot.app',
    associatedDomains: ['applinks:app.chatwoot.com'], // optional universal links
  },
  android: {
    package: 'com.chatwoot.app',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: 'app.chatwoot.com', pathPrefix: '/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
};
```

- **Custom scheme:** `chatwootapp://`
- **Redirect URI example:** `chatwootapp://sso/callback`

---

## 2. Mobile Login Flow

### Step 1: User clicks "Login via SSO"

The app opens the SSO endpoint with a `redirect_uri`:

```
GET https://<installation_url>/app/login/sso?redirect_uri=chatwootapp://sso/callback
```

### Step 2: Expo opens browser

Use `AuthSession` to manage the SSO flow:

```tsx
import * as AuthSession from 'expo-auth-session';

async function loginWithSSO() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'chatwootapp' });

  const result = await AuthSession.startAsync({
    authUrl: `${installationUrl}/app/login/sso?redirect_uri=${encodeURIComponent(redirectUri)}`,
  });

  if (result.type === 'success') {
    const { email, sso_auth_token } = result.params;
    await fetch(`${installationUrl}/api/v1/accounts/sign_in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sso_auth_token }),
    });
  }
}
```

---

## 3. Backend Adjustments

Update the backend to accept `redirect_uri` and redirect accordingly after SAML login.

```rb
def sso_callback
  email = saml_response.email
  token = generate_sso_auth_token(email)

  redirect_uri = params[:redirect_uri].presence || default_web_redirect
  redirect_to "#{redirect_uri}?email=#{CGI.escape(email)}&sso_auth_token=#{token}"
end
```

- If `redirect_uri` starts with `chatwootapp://` → redirect back to the app
- Otherwise → fallback to web dashboard login (`/app/login?...`)

---

## 4. Security Considerations

- Maintain an **allowlist** of valid redirect URIs (e.g., `chatwootapp://sso/callback`, `https://app.chatwoot.com/...`).
- Do not allow arbitrary redirects.
- `sso_auth_token` must be short-lived and single-use.
- Exchange `sso_auth_token` immediately with `/api/v1/accounts/sign_in`.

---

## 5. End-to-End Example

1. Mobile app opens:

   ```
   https://app.chatwoot.com/app/login/sso?redirect_uri=chatwootapp://sso/callback
   ```

2. IdP → Chatwoot backend → successful login → backend redirects:

   ```
   chatwootapp://sso/callback?email=john@doe.com&sso_auth_token=xyz123
   ```

3. Expo captures redirect → passes params to the app.
4. App calls API:

   ```
   POST /api/v1/accounts/sign_in
   { email: "john@doe.com", sso_auth_token: "xyz123" }
   ```

5. Backend returns API session → user logged in.

✅ With this setup, SAML SSO works seamlessly on both web dashboard and mobile apps.
