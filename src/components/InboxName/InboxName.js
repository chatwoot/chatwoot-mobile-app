import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import Icon from 'components/Icon/Icon';
import { Text } from 'components';
import { View, StyleSheet } from 'react-native';
import { getInboxIconByType } from 'src/helpers/inboxHelpers';
import { getTextSubstringWithEllipsis } from 'helpers';
const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    inboxDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    channelText: {
      marginLeft: spacing.tiny,
    },
  });
};

const propTypes = {
  inboxName: PropTypes.string,
  phoneNumber: PropTypes.string,
  channelType: PropTypes.string,
};

const InboxName = ({ inboxName, phoneNumber, channelType }) => {
  const iconName = getInboxIconByType({ channelType, phoneNumber });
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <React.Fragment>
      <View style={styles.inboxDetails}>
        {iconName ? <Icon color={colors.textLight} size={10} icon={iconName} /> : null}
        {inboxName ? (
          <Text xxs medium color={colors.textLight} style={styles.channelText}>
            {getTextSubstringWithEllipsis(inboxName, 32)}
          </Text>
        ) : null}
      </View>
    </React.Fragment>
  );
};
InboxName.propTypes = propTypes;
export default InboxName;
