import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

const BackIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RefreshIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 005.64 5.64L1 10M22.99 14L18.36 18.36A9 9 0 013.51 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LockIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChatWithUsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  const baseUrl = process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL || 'https://cx.aloochat.ai';
  const websiteToken = process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'xepyhKkhoZm13wA3PMCRwcR9';
  const chatwootUrl = `${baseUrl}/widget?website_token=${websiteToken}`;

  const displayUrl = currentUrl || chatwootUrl;
  const isSecure = displayUrl.startsWith('https://');
  
  // Extract domain for display
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable 
          onPress={handleGoBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <BackIcon color={colors.text} />
        </Pressable>
        
        <Text style={[styles.title, { color: colors.text }]}>Chat with Us</Text>
        
        <Pressable 
          onPress={handleRefresh}
          style={({ pressed }) => [styles.refreshButton, pressed && { opacity: 0.6 }]}
        >
          <RefreshIcon color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Address Bar */}
      <View style={[styles.addressBarContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.addressBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isSecure && (
            <View style={styles.lockContainer}>
              <LockIcon color={colors.success} />
            </View>
          )}
          <Text 
            style={[styles.urlText, { color: colors.textSecondary }]} 
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {getDomain(displayUrl)}
          </Text>
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
          )}
        </View>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: chatwootUrl }}
          style={styles.webView}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(navState) => {
            setCurrentUrl(navState.url);
            setCanGoBack(navState.canGoBack);
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  addressBarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  lockContainer: {
    marginRight: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatWithUsScreen;
