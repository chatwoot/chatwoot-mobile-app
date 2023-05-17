import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { Text, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    section: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      padding: spacing.small,
      height: 54,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    sectionText: {
      paddingLeft: spacing.smaller,
    },
    sectionActionView: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  });
};

const propTypes = {
  name: PropTypes.string,
  text: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
  availabilityStatus: PropTypes.string,
};

const NotificationActionItem = ({ text, itemType, name, onPressItem }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  return (
    <React.Fragment>
      <Pressable style={styles.section} onPress={() => onPressItem({ itemType })}>
        <View style={styles.sectionTitleView}>
          <Text sm medium color={colors.textDark} style={styles.sectionText}>
            {text}
          </Text>
        </View>
        <View style={styles.sectionActionView}>
          <Text sm medium color={colors.textDark} style={styles.sectionText}>
            {name}
          </Text>
        </View>
      </Pressable>
    </React.Fragment>
  );
};

NotificationActionItem.propTypes = propTypes;

export default NotificationActionItem;
