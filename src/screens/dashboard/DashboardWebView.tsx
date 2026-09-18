import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import snakecaseKeys from 'snakecase-keys';

import { useAppSelector } from '@/hooks';
import {
  buildNutriplusBootstrapScript,
  isNutriplusDashboardReadyMessage,
  isNutriplusDashboardUrl,
} from '@/store/dashboard-app/nutriplusDashboardBridge';
import { NutriplusDashboardService } from '@/store/dashboard-app/nutriplusDashboardService';
import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import { Conversation } from '@/types';
import { User } from '@/types/User';

type DashboardWebViewProps = {
  conversation: Conversation;
  currentUser: User;
  url: string;
};

export const DashboardWebView = ({ conversation, currentUser, url }: DashboardWebViewProps) => {
  const webviewRef = useRef<WebView>(null);
  const nutriplusBootstrapInFlight = useRef(false);
  const installationUrl = useAppSelector(selectInstallationUrl);

  const contact = conversation?.meta?.sender;

  const data = snakecaseKeys(
    {
      conversation,
      contact,
      currentAgent: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
    },
    { deep: true },
  );

  const injectedJavaScript = `window.postMessage(JSON.stringify({"event":"appContext","data":${JSON.stringify(
    data,
  )}}));`;

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={['*']}
      source={{ uri: url }}
      startInLoadingState={true}
      javaScriptEnabled={true}
      onLoadEnd={() => {
        webviewRef.current?.injectJavaScript(injectedJavaScript);
      }}
      onMessage={async event => {
        const { data: messageData, url: messageUrl } = event.nativeEvent;

        if (messageData === 'chatwoot-dashboard-app:fetch-info') {
          webviewRef.current?.injectJavaScript(injectedJavaScript);
          return;
        }

        if (
          !isNutriplusDashboardUrl(url) ||
          !isNutriplusDashboardReadyMessage(messageUrl, messageData) ||
          nutriplusBootstrapInFlight.current
        ) {
          return;
        }

        nutriplusBootstrapInFlight.current = true;

        try {
          const { token } = await NutriplusDashboardService.bootstrap(conversation.id);

          if (!token) return;

          webviewRef.current?.injectJavaScript(
            buildNutriplusBootstrapScript(token, installationUrl),
          );
        } catch {
          return;
        } finally {
          nutriplusBootstrapInFlight.current = false;
        }
      }}
    />
  );
};
