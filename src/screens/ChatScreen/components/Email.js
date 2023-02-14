import React from 'react';
import PropTypes from 'prop-types';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { withStyles } from '@ui-kitten/components';

const propTypes = {
  emailContent: PropTypes.string,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }),
};

const styles = () => ({
  container: {
    width: 225,
  },
});

const Email = ({ emailContent, eva: { style, theme } }) => {
  return (
    <AutoHeightWebView
      style={style.container}
      scrollEnabled={true}
      customStyle={`
      * {
        color: '#3c4858',
      }
      p {
        font-size: 14px;
      }
    `}
      source={{
        html: emailContent,
      }}
      scalesPageToFit={false}
      viewportContent={'width=device-width, user-scalable=no'}
    />
  );
};

Email.propTypes = propTypes;

const EmailComponent = React.memo(withStyles(Email, styles));

export default EmailComponent;
