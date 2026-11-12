/** @jest-environment node */
/* eslint-env jest */
const { configureWebSocketRedirects } = require('../with-cloudflare-websocket');

const application = `class MainApplication : Application() {
  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}`;

test('installs the native redirect policy before React Native starts and is idempotent', () => {
  const generated = configureWebSocketRedirects(application, 'kt');
  expect(generated.indexOf('WebSocketModule.setCustomClientBuilder')).toBeLessThan(
    generated.indexOf('loadReactNative(this)'),
  );
  expect(generated).toContain('builder.followRedirects(false)');
  expect(generated).toContain('builder.followSslRedirects(false)');
  expect(configureWebSocketRedirects(generated, 'kt')).toBe(generated);
});

test('fails the build when protection cannot be installed instead of silently omitting it', () => {
  expect(() => configureWebSocketRedirects('class MainApplication {}', 'kt')).toThrow(
    'Cannot install',
  );
  expect(() => configureWebSocketRedirects(application, 'java')).toThrow('requires Kotlin');
});
