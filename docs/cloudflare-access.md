# Cloudflare Access

The server URL screen supports an optional Cloudflare Access service token. This authenticates the installation at Cloudflare; the user still signs in to Chatwoot normally.

## Configure Cloudflare

1. In Cloudflare Zero Trust, open **Access controls → Service credentials → Service Tokens** and create a token with a name identifying the device and an appropriate expiration date. Save its **Client ID** and **Client Secret** securely; Cloudflare only displays the secret when it is generated.
2. Open the Access application protecting the Chatwoot hostname. Add a policy with action **Service Auth**, selector **Service Token**, and select that specific token. Keep the existing email PIN and IP policies if they are still needed for browser access.
3. Use a separate token per installation when individual revocation is required. This is an Access service token, distinct from the Cloudflare API token and the `cloudflared` connector token.

Reference: [Cloudflare service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/).

## Configure the app

1. On the server URL screen, enter the Chatwoot hostname, for example `chat.example.com`.
2. Enable **Cloudflare Access (optional)** and enter the Client ID and Client Secret.
3. Tap **Connect**. The app checks the server's `/api` version response before saving the credentials and continuing to Chatwoot login.

The values are stored in Expo SecureStore (Keychain on iOS, encrypted storage backed by Android Keystore). They are not saved in Redux/AsyncStorage or included in Redux actions. The secret field is masked. Editing the server origin clears the form's credentials so they cannot accidentally follow a server change.

To replace an expired/revoked token, return to the server URL screen and update the values. Turning off the option and successfully connecting removes the saved service token. Normal Chatwoot logout keeps the installation configuration for the next login.

## Request behavior

- Only the exact configured HTTPS origin and its WSS endpoint receive `CF-Access-Client-Id` and `CF-Access-Client-Secret`. HTTP, other ports, subdomains, third-party URLs and URLs containing userinfo do not receive them.
- Verification, version checks, login, API requests and Action Cable use the service token. Protected API requests do not follow HTTP redirects, including redirects to an Access login page. The Android config plugin also disables native WebSocket redirects before React Native starts.
- Protected images, avatars, audio, video and files are downloaded to the app cache before native viewers receive a local file URL. Media redirects are handled explicitly, with at most five hops over HTTPS. Each hop gets only the credentials appropriate to its origin, so an external object store receives no Access headers.
- Videos protected by Access download when the user taps Play and must finish downloading before playback. Files are cached for the current app process/configuration; the OS may clear its cache. Media from previous processes is cleared before the first protected download. External media retains its existing behavior.
- Links opened in an external browser use that browser's normal Access session. The app does not inject its token into browsers or HTML email content.

This feature adds the `expo-secure-store` native module and an Android WebSocket config plugin. Run Expo prebuild and rebuild the development client or standalone app before testing an existing native installation. A JavaScript-only update cannot install these native changes.

## Validate on a device

Use a network whose IP does not already bypass Access, such as mobile data. A successful request from an allowlisted computer cannot prove that the token or Service Auth policy works.

Check connection, Chatwoot login, real-time conversation updates, an image and its full-screen gallery, a video, audio playback, and a file attachment. Also check media redirected to object storage, reopening the app, an invalid/expired token, replacing the token and changing servers. Confirm that an ordinary browser still uses the intended PIN/IP policy.

The automated tests cover origin boundaries, secure-store failures, safe redirects, multipart upload transport, HTML login-page rejection and keeping secrets out of dispatched actions/errors. They do not replace a real-device test with a configured Service Auth policy.
