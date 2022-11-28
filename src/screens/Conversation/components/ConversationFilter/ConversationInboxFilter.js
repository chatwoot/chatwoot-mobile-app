import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import { getInboxIconByType } from 'helpers/inboxHelpers';

const createStyles = theme => {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    bottomSheet: {
      flex: 1,
      paddingHorizontal: spacing.small,
    },
    iconNameWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bottomSheetView: {
      paddingBottom: spacing.large,
    },
    bottomSheetItem: {
      flexDirection: 'row',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.half,
      borderBottomWidth: 0.4,
      borderRadius: borderRadius.small,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconWrapper: {
      marginRight: spacing.smaller,
    },
  });
};

const propTypes = {
  title: PropTypes.string,
  activeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hasLeftIcon: PropTypes.bool,
  items: PropTypes.array,
  closeFilter: PropTypes.func,
  onChangeFilter: PropTypes.func,
  colors: PropTypes.object,
};

const ConversationInboxFilter = ({ colors, activeValue, hasLeftIcon, items, onChangeFilter }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const iconNameByInboxType = item => {
    const { channel_type: channelType, phone_number: phoneNumber } = item;
    if (!channelType) {
      return '';
    }
    return getInboxIconByType({ channelType, phoneNumber });
  };

  const fullWidth = '100%';
  const notFullWidth = '86%';

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetView}>
        {items.map(item => (
          <Pressable
            key={item.id}
            style={[
              {
                borderBottomColor: colors.borderLight,
                backgroundColor: activeValue === item.id ? colors.primaryColorLight : colors.white,
              },
              styles.bottomSheetItem,
            ]}
            onPress={() => {
              onChangeFilter(item);
            }}>
            <View
              style={[
                styles.iconNameWrapper,
                { width: activeValue === item.id ? notFullWidth : fullWidth },
              ]}>
              {hasLeftIcon && (
                <View style={styles.iconWrapper}>
                  <Icon icon={iconNameByInboxType(item)} color={colors.text} size={16} />
                </View>
              )}
              <Text sm medium color={colors.text}>
                {item.name === 'All' ? 'All Inboxes' : item.name}
              </Text>
            </View>
            <View>
              {activeValue === item.id && (
                <Icon icon="checkmark-outline" color={colors.textDark} size={16} />
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

ConversationInboxFilter.propTypes = propTypes;
export default ConversationInboxFilter;
