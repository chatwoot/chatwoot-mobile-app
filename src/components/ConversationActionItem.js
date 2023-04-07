import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable, UserAvatar } from 'components';
import i18n from 'i18n';

const createStyles = theme => {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    bottomSheetItem: {
      flexDirection: 'row',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
      borderBottomWidth: 0.4,
      height: 48,
      borderRadius: borderRadius.small,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitleView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    sectionTitle: {
      marginLeft: spacing.smaller,
      marginRight: spacing.half,
    },
    sectionActiveTitle: {
      marginLeft: spacing.micro,
      marginRight: spacing.smaller,
    },
    sectionActionView: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      flex: 4,
    },
  });
};

const propTypes = {
  name: PropTypes.string,
  thumbnail: PropTypes.string,
  iconName: PropTypes.string,
  text: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
  availabilityStatus: PropTypes.string,
  colors: PropTypes.object,
};

const ConversationActionItem = ({
  text,
  iconName,
  itemType,
  name,
  thumbnail,
  onPressItem,
  availabilityStatus,
  colors,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const shouldShowUserAvatar = itemType === 'assignee' && name !== i18n.t('AGENT.TITLE');

  return (
    <React.Fragment>
      <Pressable
        key={text}
        style={[
          {
            borderBottomColor: colors.borderLight,
          },
          styles.bottomSheetItem,
        ]}
        onPress={() => {
          onPressItem({ itemType });
        }}>
        <View style={styles.sectionTitleView}>
          <Icon icon={iconName} color={colors.textDark} size={16} />
          <Text sm medium color={colors.textDark} style={styles.sectionTitle}>
            {text}
          </Text>
        </View>
        <View style={styles.sectionActionView}>
          {shouldShowUserAvatar && (
            <UserAvatar thumbnail={thumbnail} userName={name} size={18} fontSize={8} />
          )}
          <Text sm medium color={colors.textLight} style={styles.sectionActiveTitle}>
            {name}
          </Text>
          {(itemType === 'assignee' || itemType === 'team' || itemType === 'snooze') && (
            <Icon icon="arrow-chevron-right-outline" color={colors.text} size={16} />
          )}
        </View>
      </Pressable>
    </React.Fragment>
  );
};

ConversationActionItem.propTypes = propTypes;
export default ConversationActionItem;
