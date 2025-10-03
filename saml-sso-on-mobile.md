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

The app opens the SSO endpoint with a `target=mobile` parameter:

```
GET https://<installation_url>/app/login/sso?target=mobile
```

### Step 2: Expo opens browser

Use `AuthSession` to manage the SSO flow:

```tsx
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

async function loginWithSSO(installationUrl: string) {
  const redirectUri = AuthSession.makeRedirectUri({ 
    scheme: 'chatwootapp',
    path: 'sso/callback'
  });

  // Use WebBrowser instead of AuthSession for better compatibility
  const result = await WebBrowser.openAuthSessionAsync(
    `${installationUrl}/app/login/sso?target=mobile`,
    redirectUri
  );

  if (result.type === 'success' && result.url) {
    // Parse callback parameters
    const urlObj = new URL(result.url);
    const email = decodeURIComponent(urlObj.searchParams.get('email') || '');
    const sso_auth_token = urlObj.searchParams.get('sso_auth_token') || '';

    // Call the auth endpoint
    await fetch(`${installationUrl}/auth/sign_in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sso_auth_token }),
    });
  }
}
```

---

## 3. Android Deep Link Configuration (Expo CNG)

Since you're using Expo CNG, add the custom scheme intent filter in your `app.config.ts` instead of manually editing AndroidManifest.xml:

```ts
// app.config.ts
export default {
  android: {
    intentFilters: [
      // Existing intent filters...
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'chatwootapp',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
};
```

**Note:** This automatically generates the correct AndroidManifest.xml when you build with `npx expo run:android` or `eas build`, ensuring your deep links persist across native regenerations.

## 4. Mobile Deep Link Handling

Handle SSO callbacks in your navigation setup:

```tsx
// src/navigation/index.tsx
const linking = {
  prefixes: [installationUrl, 'chatwootapp://'],
  
  getStateFromPath: (path: string, config: any) => {
    // Handle SSO callback - support both sso/callback and auth/saml paths
    if (path.includes('chatwootapp://sso/callback') || path.includes('auth/saml')) {
      const ssoParams = SsoUtils.parseCallbackUrl(`chatwootapp://${path}`);
      if (ssoParams.email && ssoParams.sso_auth_token) {
        SsoUtils.handleSsoCallback(ssoParams, dispatch);
      }
      return undefined; // Prevent navigation change
    }
    // ... other navigation logic
  },
  
  // Also handle in getInitialURL and subscribe methods
};
```

## 5. Login Screen Integration

Position the SSO button prominently above the standard login form:

```tsx
// src/screens/auth/LoginScreen.tsx
<Button
  text="Login via SSO"
  variant="outline"
  handlePress={handleSsoLogin}
  disabled={isLoggingIn}
  style={tailwind.style('mt-8')}
/>

<View style={tailwind.style('flex-row items-center my-6')}>
  <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
  <Text style={tailwind.style('px-4 text-sm text-gray-600')}>or</Text>
  <View style={tailwind.style('flex-1 h-px bg-gray-300')} />
</View>

{/* Standard email/password form follows */}
```

## 6. Security Considerations

- `sso_auth_token` must be short-lived and single-use
- Exchange `sso_auth_token` immediately with `/auth/sign_in`
- Email parameters are URL-encoded and must be properly decoded
- Backend handles mobile detection via `target=mobile` parameter

---

## 7. End-to-End Example

1. Mobile app opens:

   ```
   https://app.chatwoot.com/app/login/sso?target=mobile
   ```

2. IdP → Chatwoot backend → successful login → backend redirects:

   ```
   chatwootapp://sso/callback?email=john@doe.com&sso_auth_token=xyz123
   ```

3. Expo captures redirect → passes params to the app.
4. App calls API:

   ```
   POST /auth/sign_in
   { email: "john@doe.com", sso_auth_token: "xyz123" }
   ```

5. Backend returns API session → user logged in.

✅ With this setup, SAML SSO works seamlessly on both web dashboard and mobile apps.
