import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';

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
  leftIcon: PropTypes.string,
  items: PropTypes.array,
  closeFilter: PropTypes.func,
  onChangeFilter: PropTypes.func,
  colors: PropTypes.object,
};

const ConversationFilter = ({ colors, activeValue, leftIcon, items, onChangeFilter }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetView}>
        {items.map(item => (
          <Pressable
            key={item.key}
            style={[
              {
                borderBottomColor: colors.borderLight,
                backgroundColor: activeValue === item.key ? colors.primaryColorLight : colors.white,
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
  );
};

ConversationFilter.propTypes = propTypes;
export default ConversationFilter;
