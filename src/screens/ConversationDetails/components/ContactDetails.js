import React, { useMemo } from 'react';
import i18n from 'i18n';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Icon, Text, Pressable } from 'components';
import Clipboard from '@react-native-clipboard/clipboard';

import { openNumber } from 'src/helpers/UrlHelper';
import { showToast } from 'helpers/ToastHelper';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: spacing.smaller,
      marginBottom: spacing.micro,
      gap: spacing.micro,
    },
    copyButton: {
      marginLeft: spacing.micro,
    },
  });
};

const propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
};

const ContactDetails = ({ type, value, iconName }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Avoid rendering if the value is empty or whitespace (Case: identifier)
  if (!value || value === ' ') {
    return null;
  }

  const onClickOpen = () => {
    if (type === 'phoneNumber') {
      openNumber({ phoneNumber: value });
    } else {
      return;
    }
  };

  const showCopyButton = type === 'phoneNumber' || type === 'email';

  const onClickCopy = () => {
    Clipboard.setString(value);
    showToast({ message: i18n.t('CONVERSATION_DETAILS.CLIPBOARD_SUCCESS') });
  };
  return (
    <View style={styles.detailsContainer}>
      <Icon icon={iconName} color={colors.primaryColor} size={14} />
      <Pressable onPress={() => onClickOpen()}>
        <Text sm color={colors.textDark}>
          {value}
        </Text>
      </Pressable>
      {showCopyButton && (
        <Pressable style={styles.copyButton} onPress={() => onClickCopy()}>
          <Icon icon="copy-outline" color={colors.text} size={14} />
        </Pressable>
      )}
    </View>
  );
};

ContactDetails.propTypes = propTypes;
export default ContactDetails;
