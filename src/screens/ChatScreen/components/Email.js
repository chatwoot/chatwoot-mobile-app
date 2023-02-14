import React from 'react';
import PropTypes from 'prop-types';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { withStyles } from '@ui-kitten/components';
import { View } from 'react-native';

const propTypes = {
  emailContent: PropTypes.string,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }),
};

const styles = () => ({
  container: {
    width: '100%',
  },
});

const Email = ({ emailContent, eva: { style, theme } }) => {
  return (
    <View>
      <AutoHeightWebView
        style={style.container}
        customStyle={`
        * {
          color: '#3c4858',
        }
        p {
          font-size: 12px;
        }
        img{
          width: 50px !important; height: 50px !important;
        }
      `}
        source={{
          html: emailContent,
        }}
        viewportContent={'width=device-width, user-scalable=no'}
      />
    </View>
  );
};

Email.propTypes = propTypes;

const EmailComponent = React.memo(withStyles(Email, styles));

export default EmailComponent;
