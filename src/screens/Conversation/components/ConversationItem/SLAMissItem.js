import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { format, fromUnixTime } from 'date-fns';
import { Text } from 'components';
const propTypes = {
  label: PropTypes.string,
  items: PropTypes.array,
};

const createStyles = theme => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      padding: 8,
    },
    itemView: {
      flex: 1,
      flexDirection: 'column',
      gap: 2,
    },
    label: {
      textAlign: 'left',
      fontVariant: ['tabular-nums'],
    },
    date: {
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
  });
};

const SLAMissItem = ({ label, items }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const formatDate = timestamp => format(fromUnixTime(timestamp), 'MMM dd, yyyy, hh:mm a');

  return (
    <View style={styles.container}>
      <Text sm color={colors.textLight} style={styles.label}>
        {label}
      </Text>
      <View style={styles.itemView}>
        {items.map(item => (
          <Text sm semiBold color={colors.text} key={item.id} style={styles.date}>
            {formatDate(item.created_at)}
          </Text>
        ))}
      </View>
    </View>
  );
};
SLAMissItem.propTypes = propTypes;

export default SLAMissItem;
