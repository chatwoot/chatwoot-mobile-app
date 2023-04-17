import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import { StyleSheet } from 'react-native';

const propTypes = {
  accounts: PropTypes.array.isRequired,
  colors: PropTypes.object,
  activeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPress: PropTypes.func,
};

const createStyles = theme => {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    bottomSheet: {
      flex: 1,
      paddingHorizontal: spacing.small,
    },
    bottomSheetContent: {
      marginTop: spacing.small,
      height: '100%',
      marginBottom: spacing.large,
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
    accountDetailsWrapper: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    nameIdWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.tiny,
    },
    accountIdWrapper: {
      marginLeft: spacing.smaller,
      borderRadius: borderRadius.micro,
      paddingVertical: spacing.tiny,
      paddingHorizontal: spacing.micro,
    },
    headerLoader: {
      marginLeft: spacing.smaller,
    },
    role: {
      textTransform: 'capitalize',
    },
  });
};

const AccountsSelector = ({ accounts, activeValue, onPress, colors }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetContent}>
        {accounts.map(account => (
          <Pressable
            key={account.id}
            style={[
              {
                backgroundColor:
                  activeValue === account.id ? colors.primaryColorLight : colors.white,
                borderBottomColor: colors.borderLight,
              },
              styles.bottomSheetItem,
            ]}
            onPress={() => {
              onPress(account.id);
            }}>
            <View style={styles.accountDetailsWrapper}>
              <View style={styles.nameIdWrapper}>
                <Text md semiBold color={colors.textDark}>
                  {account.name}
                </Text>
                <View
                  style={[styles.accountIdWrapper, { backgroundColor: colors.primaryColorLight }]}>
                  <Text xs medium color={colors.text} style={styles.accountId}>
                    {`#${account.id}`}
                  </Text>
                </View>
              </View>
              <Text xs color={colors.text} style={styles.role}>
                {account.role}
              </Text>
            </View>
            <View>
              {activeValue === account.id && (
                <Icon icon="checkmark-outline" color={colors.textDark} size={16} />
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

AccountsSelector.propTypes = propTypes;
export default AccountsSelector;
