import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, Text, Pressable } from 'components';

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
    iconView: {
      paddingRight: spacing.smaller,
    },
  });
};

const propTypes = {
  name: PropTypes.string,
  text: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
};

const ChatMessageActionItem = ({ text, itemType, onPressItem }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <React.Fragment>
      <Pressable style={styles.section} onPress={() => onPressItem({ itemType })}>
        {itemType === 'copy' && (
          <View style={styles.iconView}>
            <Icon icon="copy-outline" color={colors.primaryColor} size={22} />
          </View>
        )}
        {itemType === 'delete' && (
          <View style={styles.iconView}>
            <Icon icon="delete-outline" color={colors.primaryColor} size={22} />
          </View>
        )}
        <View>
          <Text sm medium color={colors.textDark}>
            {text}
          </Text>
        </View>
      </Pressable>
    </React.Fragment>
  );
};

ChatMessageActionItem.propTypes = propTypes;
export default ChatMessageActionItem;
