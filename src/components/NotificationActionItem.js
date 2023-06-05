import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { Text, Pressable, Icon } from 'components';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    section: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: spacing.small,
      height: 52,
      borderBottomWidth: 0.4,
      borderColor: colors.borderLight,
    },
    sectionText: {
      marginLeft: spacing.smaller,
    },
    sectionTitleView: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  });
};

const propTypes = {
  text: PropTypes.string,
  iconName: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
  availabilityStatus: PropTypes.string,
};

const NotificationActionItem = ({ text, iconName, itemType, onPressItem }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  return (
    <React.Fragment>
      <Pressable style={styles.section} onPress={() => onPressItem({ itemType })}>
        <View style={styles.sectionTitleView}>
          <Icon icon={iconName} color={colors.primaryColor} size={22} style={styles.iconWrapper} />
          <Text sm medium color={colors.text} style={styles.sectionText}>
            {text}
          </Text>
        </View>
      </Pressable>
    </React.Fragment>
  );
};

NotificationActionItem.propTypes = propTypes;

export default NotificationActionItem;
