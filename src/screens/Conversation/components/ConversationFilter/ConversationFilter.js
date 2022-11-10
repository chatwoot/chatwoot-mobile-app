import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon } from 'components';
import BottomSheetModalHeader from 'components/BottomSheetHeader/BottomSheetHeader';

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
  leftIcon: PropTypes.string,
  items: PropTypes.array,
  closeFilter: PropTypes.func,
  onChangeFilter: PropTypes.func,
  colors: PropTypes.object,
};

const ConversationFilter = ({
  title,
  colors,
  activeValue,
  leftIcon,
  items,
  closeFilter,
  onChangeFilter,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.bottomSheet}>
      <View>
        <BottomSheetModalHeader title={title} closeModal={closeFilter} colors={colors} />
        <View style={styles.bottomSheetView}>
          {items.map(item => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.6 : 1,
                  borderBottomColor: colors.borderLight,
                  backgroundColor:
                    activeValue === item.key ? colors.primaryColorLight : colors.white,
                },
                styles.bottomSheetItem,
              ]}
              onPress={() => {
                onChangeFilter(item);
              }}>
              <View style={styles.iconNameWrapper}>
                {leftIcon && (
                  <View style={styles.iconWrapper}>
                    <Icon icon={leftIcon} color={colors.text} size={16} />
                  </View>
                )}
                <Text sm medium color={colors.text}>
                  {item.name}
                </Text>
              </View>
              <View>
                {activeValue === item.key && (
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

ConversationFilter.propTypes = propTypes;
export default ConversationFilter;
