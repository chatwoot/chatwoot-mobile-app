import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, BottomSheetModalHeader, Pressable } from 'components';
import { getInboxIconByType } from 'helpers/inbox';

const createStyles = theme => {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    iconNameWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bottomSheet: {
      //TODO: to be removed when we use in bottom sheet
      width: '90%',
    },
    bottomSheetView: {
      //TODO: to be changed to '100%' when we use in bottom sheet
      height: 100,
      paddingVertical: spacing.small,
      paddingBottom: spacing.large,
    },
    bottomSheetItem: {
      flexDirection: 'row',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
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

const ConversationInboxFilter = ({
  title,
  colors,
  activeValue,
  hasLeftIcon,
  items,
  closeFilter,
  onChangeFilter,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const iconNameByInboxType = item => {
    const { channel_type: channelType, phone_number: phoneNumber } = item;
    if (!channelType) {
      return '';
    }
    return getInboxIconByType({ channelType, phoneNumber });
  };

  return (
    <View style={styles.bottomSheet}>
      <View>
        <BottomSheetModalHeader title={title} closeModal={closeFilter} colors={colors} />
        <View style={styles.bottomSheetView}>
          {items.map(item => (
            <Pressable
              key={item.id}
              style={[
                {
                  borderBottomColor: colors.borderLight,
                  backgroundColor:
                    activeValue === item.id ? colors.primaryColorLight : colors.white,
                },
                styles.bottomSheetItem,
              ]}
              onPress={() => {
                onChangeFilter(item);
              }}>
              <View style={styles.iconNameWrapper}>
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
    </View>
  );
};

ConversationInboxFilter.propTypes = propTypes;
export default ConversationInboxFilter;
