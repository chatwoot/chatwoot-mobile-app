import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

const createStyles = theme => {
  const { colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundChat,
    },
    spinnerView: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
    },
  });
};

const propTypes = {
  route: PropTypes.shape({
    content: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
      }),
    ),
    conversation: PropTypes.object,
    currentUser: PropTypes.object,
  }),
};

const DashboardApp = ({ route }) => {
  const { content, conversation, currentUser } = route;
  const [urlDetails] = content;
  const webviewRef = useRef(null);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const contact = conversation?.meta?.sender;
  const data = {
    conversation,
    contact,
    currentAgent: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    },
  };

  const INJECTED_JAVASCRIPT = `window.postMessage(JSON.stringify({"event":"appContext","data":${JSON.stringify(
    data,
  )}}));`;

  const Spinner = () => (
    <View style={styles.spinnerView}>
      <ActivityIndicator size="small" />
    </View>
  );

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={['*']}
      style={styles.container}
      source={{ uri: urlDetails.url }}
      startInLoadingState={true}
      renderLoading={Spinner}
      injectedJavaScript={INJECTED_JAVASCRIPT}
      onMessage={event => {
        webviewRef.current.injectJavaScript(INJECTED_JAVASCRIPT);
      }}
    />
  );
};

DashboardApp.propTypes = propTypes;
export default DashboardApp;
