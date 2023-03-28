import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    bottomSheetItem: {
      flexDirection: 'column',
      paddingVertical: spacing.half,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitleView: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.small,
      width: 80,
      height: 68,
      backgroundColor: colors.backgroundLight,
    },
    sectionTitle: {
      marginLeft: spacing.micro,
      marginTop: spacing.tiny,
    },
  });
};

const propTypes = {
  iconName: PropTypes.string,
  text: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
  colors: PropTypes.object,
};

const ConversationActionItem = ({ text, iconName, itemType, onPressItem, colors }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <React.Fragment>
      <Pressable
        key={text}
        style={styles.bottomSheetItem}
        onPress={() => {
          onPressItem({ itemType });
        }}>
        <View style={styles.sectionTitleView}>
          <Icon icon={iconName} color={colors.text} size={20} />
          <Text sm medium color={colors.text} style={styles.sectionTitle}>
            {text}
          </Text>
        </View>
      </Pressable>
    </React.Fragment>
  );
};

ConversationActionItem.propTypes = propTypes;
export default ConversationActionItem;
