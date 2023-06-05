import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { Icon, Text, Pressable } from 'components';
import PropTypes from 'prop-types';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    section: {
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
  });
};

const propTypes = {
  name: PropTypes.string,
  thumbnail: PropTypes.string,
  text: PropTypes.string,
  checked: PropTypes.bool,
  iconName: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
};

const AttachmentActionItem = ({ text, itemType, iconName, onPressItem }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <React.Fragment>
      <Pressable style={styles.section} onPress={() => onPressItem({ itemType })}>
        <Icon icon={iconName} color={colors.primaryColor} size={22} />
        <Text sm medium color={colors.textDark} style={styles.sectionText}>
          {text}
        </Text>
      </Pressable>
    </React.Fragment>
  );
};

AttachmentActionItem.propTypes = propTypes;
export default AttachmentActionItem;
