import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';
import { SafeAreaView, View } from 'react-native';
import { Spinner, TopNavigation, TopNavigationAction, withStyles } from '@ui-kitten/components';

import Icon from '../../components/Icon';

const styles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  loaderView: {
    flex: 1,
    alignItems: 'center',
  },
});

// eslint-disable-next-line react/prop-types
const BackIcon = ({ style: { tintColor } }) => {
  return <Icon name="close-outline" color={tintColor} />;
};
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,

  route: PropTypes.shape({
    params: PropTypes.shape({
      url: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const WebViewScreen = ({ eva: { style }, navigation, route }) => {
  const [loader, showLoader] = useState(false);
  const renderLeftControl = () => <TopNavigationAction onPress={onBackPress} icon={BackIcon} />;

  const onBackPress = () => {
    navigation.goBack();
  };
  const { url } = route.params;

  return (
    <SafeAreaView style={style.container}>
      <TopNavigation accessoryLeft={renderLeftControl} />
      {loader && (
        <View style={style.loaderView}>
          <Spinner size="medium" />
        </View>
      )}
      <WebView
        source={{ uri: url }}
        onLoadStart={() => showLoader(true)}
        onLoad={() => showLoader(false)}
      />
    </SafeAreaView>
  );
};

WebViewScreen.propTypes = propTypes;

export default withStyles(WebViewScreen, styles);
