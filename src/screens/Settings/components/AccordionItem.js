import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import { getTextSubstringWithEllipsis } from 'helpers';
import { StyleSheet } from 'react-native';

const propTypes = {
  leftIcon: PropTypes.string,
  title: PropTypes.string,
  activeValue: PropTypes.string,
  rightIcon: PropTypes.string,
  onPress: PropTypes.func,
  routeName: PropTypes.string,
};

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    accordionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    activeItemView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '40%',
    },
    accordionItemText: {
      marginLeft: spacing.smaller,
      marginRight: spacing.smaller,
      textTransform: 'capitalize',
    },
  });
};

const AccordionItem = ({ title, activeValue, rightIcon, leftIcon, routeName, onPress }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable key={title} style={styles.accordionItem} onPress={() => onPress({ routeName })}>
      <View style={styles.itemView}>
        <Icon icon={leftIcon} color={colors.textDark} size={18} />
        <Text medium sm color={colors.textDark} style={styles.accordionItemText}>
          {title}
        </Text>
      </View>
      <View style={styles.activeItemView}>
        {activeValue && (
          <Text medium sm color={colors.textLight} style={styles.accordionItemText}>
            {getTextSubstringWithEllipsis(activeValue, 12)}
          </Text>
        )}
        <Icon icon={rightIcon} color={colors.textDark} size={18} />
      </View>
    </Pressable>
  );
};

AccordionItem.propTypes = propTypes;
export default AccordionItem;
