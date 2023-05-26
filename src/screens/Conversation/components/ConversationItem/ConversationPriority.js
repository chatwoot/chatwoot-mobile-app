import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Icon } from 'components';
import { View, StyleSheet } from 'react-native';
import { CONVERSATION_PRIORITY } from 'constants';

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    priorityItemView: {
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: spacing.small,
      height: spacing.small,
      borderRadius: borderRadius.micro,
    },
  });
};

const propTypes = {
  priority: PropTypes.string,
};

const ConversationPriority = ({ priority }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const priorityValue = priority?.toLowerCase();
  const isUrgent = priorityValue === CONVERSATION_PRIORITY.URGENT;

  return (
    <View
      style={[styles.priorityItemView, isUrgent && { backgroundColor: colors.dangerColorLight }]}>
      <Icon
        icon={`priority-${priorityValue}`}
        viewBox="0 0 14 14"
        size={14}
        color={!isUrgent ? colors.text : colors.dangerColor}
      />
    </View>
  );
};

ConversationPriority.propTypes = propTypes;
export default ConversationPriority;
