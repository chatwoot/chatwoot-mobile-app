import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Icon, Text, Pressable } from 'components';

import { openNumber } from 'src/helpers/UrlHelper';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: spacing.smaller,
      marginBottom: spacing.micro,
    },
    detailText: {
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

  const onClickOpen = () => {
    if (type === 'phoneNumber') {
      openNumber({ phoneNumber: value });
    } else {
      return;
    }
  };
  return (
    <Pressable style={styles.detailsContainer} onPress={() => onClickOpen()}>
      <Icon icon={iconName} color={colors.primaryColor} size={14} />
      <Text sm color={colors.textDark} style={styles.detailText}>
        {value}
      </Text>
    </Pressable>
  );
};

ContactDetails.propTypes = propTypes;
export default ContactDetails;
