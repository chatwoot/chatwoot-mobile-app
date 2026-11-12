const { withMainApplication, createRunOncePlugin } = require('@expo/config-plugins');

const MARKER = 'Cloudflare Access: do not forward WebSocket credentials on redirects';

function configureWebSocketRedirects(contents, language) {
  if (language !== 'kt')
    throw new Error('Cloudflare WebSocket protection requires Kotlin MainApplication');
  if (contents.includes(MARKER)) return contents;
  const anchor = 'super.onCreate()';
  if (!contents.includes(anchor))
    throw new Error('Cannot install Cloudflare WebSocket protection before React Native starts');
  return contents.replace(
    anchor,
    `${anchor}
    // ${MARKER}
    com.facebook.react.modules.websocket.WebSocketModule.setCustomClientBuilder { builder ->
      builder.followRedirects(false)
      builder.followSslRedirects(false)
    }`,
  );
}

const plugin = createRunOncePlugin(
  config =>
    withMainApplication(config, cfg => {
      cfg.modResults.contents = configureWebSocketRedirects(
        cfg.modResults.contents,
        cfg.modResults.language,
      );
      return cfg;
    }),
  'with-cloudflare-websocket',
  '1.0.0',
);

module.exports = plugin;
module.exports.configureWebSocketRedirects = configureWebSocketRedirects;
