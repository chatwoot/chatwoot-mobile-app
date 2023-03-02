import React, { useMemo } from 'react';
import { View } from 'react-native';
import i18n from 'i18n';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import { StyleSheet } from 'react-native';
import { LANGUAGES } from 'constants';

const propTypes = {
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
      paddingTop: spacing.smaller,
      height: '100%',
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
    languageView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
const languages = Object.keys(i18n.translations);

const LanguageSelector = ({ activeValue, onPress, colors }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetContent}>
        {languages.map(language => (
          <Pressable
            key={language}
            style={[
              {
                backgroundColor: activeValue === language ? colors.primaryColorLight : colors.white,
                borderBottomColor: colors.borderLight,
              },
              styles.bottomSheetItem,
            ]}
            onPress={() => {
              onPress(language);
            }}>
            <View style={styles.languageView}>
              <Text sm medium color={colors.text}>
                {LANGUAGES[language]}
              </Text>
            </View>
            <View>
              {activeValue === language && (
                <Icon icon="checkmark-outline" color={colors.textDark} size={16} />
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

LanguageSelector.propTypes = propTypes;
export default LanguageSelector;
