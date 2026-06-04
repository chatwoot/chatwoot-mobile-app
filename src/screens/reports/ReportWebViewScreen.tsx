import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

import { Icon } from '@/components-next';
import { useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { selectAuthHeaders } from '@/store/auth/authSelectors';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';

type ReportWebViewRouteParams = {
  title: string;
  url: string;
};

const mobileViewportScript = `
  (function() {
    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1';
  })();
  true;
`;

const ReportWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webviewRef = useRef<WebView>(null);
  const authHeaders = useAppSelector(selectAuthHeaders);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { title, url } = route.params as ReportWebViewRouteParams;
  const webviewHeaders = useMemo(() => {
    if (!authHeaders) {
      return {};
    }

    return {
      'access-token': authHeaders['access-token'],
      client: authHeaders.client,
      expiry: authHeaders.expiry,
      uid: authHeaders.uid,
      'token-type': authHeaders['token-type'] || 'Bearer',
    };
  }, [authHeaders]);

  const authCookieScript = useMemo(() => {
    if (!authHeaders) {
      return mobileViewportScript;
    }

    const cookiePayload = JSON.stringify({
      ...webviewHeaders,
    });

    return `
      document.cookie = "cw_d_session_info=" + encodeURIComponent(${JSON.stringify(
        cookiePayload,
      )}) + "; path=/; SameSite=Lax";
      ${mobileViewportScript}
      true;
    `;
  }, [authHeaders, webviewHeaders]);

  const handleReload = () => {
    setLoadError(null);
    webviewRef.current?.reload();
  };

  const handleError = (event: WebViewErrorEvent) => {
    setLoadError(event.nativeEvent.description || i18n.t('ERRORS.CANNOT_FETCH'));
  };

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <View
        style={tailwind.style(
          'flex-row items-center justify-between border-b border-blackA-A3 px-4 py-3',
        )}>
        <Pressable hitSlop={16} onPress={() => navigation.goBack()}>
          <Icon icon={<ChevronLeft />} size={24} />
        </Pressable>
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'mx-3 flex-1 text-center text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
          )}>
          {title}
        </Animated.Text>
        <View style={tailwind.style('h-6 w-6')} />
      </View>
      <View style={tailwind.style('flex-1')}>
        {loadError ? (
          <View style={tailwind.style('flex-1 items-center justify-center px-8')}>
            <Animated.Text
              style={tailwind.style(
                'text-center text-base font-inter-medium-24 leading-[22px] text-gray-950',
              )}>
              {i18n.t('REPORTS.LOAD_ERROR')}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style('mt-2 text-center text-sm leading-[20px] text-gray-700')}>
              {loadError}
            </Animated.Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleReload}
              style={tailwind.style(
                'mt-5 h-11 items-center justify-center rounded-[13px] bg-blue-700 px-5',
              )}>
              <Animated.Text style={tailwind.style('text-base font-inter-medium-24 text-white')}>
                {i18n.t('REPORTS.RELOAD')}
              </Animated.Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ uri: url, headers: webviewHeaders }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={tailwind.style('flex-1 items-center justify-center')}>
                <ActivityIndicator color={tailwind.color('text-blue-700')} />
              </View>
            )}
            javaScriptEnabled={true}
            contentMode="mobile"
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            injectedJavaScriptBeforeContentLoaded={authCookieScript}
            onLoadStart={() => setLoadError(null)}
            onError={handleError}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ReportWebViewScreen;
