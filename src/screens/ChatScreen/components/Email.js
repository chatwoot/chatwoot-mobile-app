import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { View, StyleSheet } from 'react-native';

const propTypes = {
  emailContent: PropTypes.string,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }),
};

const createStyles = theme => {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
  });
};

const EmailComponent = ({ emailContent }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const FormattedEmail = emailContent.replace('height:100%;', '');
  return (
    <View>
      <AutoHeightWebView
        style={styles.container}
        scrollEnabled={false}
        customStyle={`
        * {
          font-family: system,-apple-system,".SFNSText-Regular","San Francisco",Roboto,"Segoe UI","Helvetica Neue","Lucida Grande",sans-serif;
          font-size: 14px;
        } 
        img{
          max-width: 100% !important;
        }
      `}
        source={{
          html: FormattedEmail,
        }}
        viewportContent={'width=device-width, user-scalable=no'}
      />
    </View>
  );
};

EmailComponent.propTypes = propTypes;
export default EmailComponent;
