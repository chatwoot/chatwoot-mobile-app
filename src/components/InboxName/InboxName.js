import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import Icon from 'components/Icon/Icon';
import Text from 'components/Text/Text';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { getInboxIconByType } from 'helpers/inbox';
const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    inboxDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    channelText: {
      marginLeft: spacing.micro,
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
            {inboxName}
          </Text>
        ) : null}
      </View>
    </React.Fragment>
  );
};
InboxName.propTypes = propTypes;
export default InboxName;
