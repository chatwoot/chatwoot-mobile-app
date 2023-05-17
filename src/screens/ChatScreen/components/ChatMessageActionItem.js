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
      padding: spacing.small,
      height: 54,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    iconView: {
      paddingLeft: spacing.micro,
    },
    sectionText: {
      paddingLeft: 8,
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
};

const ChatMessageActionItem = ({ text, itemType, name, onPressItem }) => {
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
        <View style={styles.sectionTitleView}>
          <Text sm medium color={colors.textDark} style={styles.sectionText}>
            {text}
          </Text>
        </View>
      </Pressable>
    </React.Fragment>
  );
};

ChatMessageActionItem.propTypes = propTypes;
export default ChatMessageActionItem;
