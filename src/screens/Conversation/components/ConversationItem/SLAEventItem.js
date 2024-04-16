import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { format, fromUnixTime } from 'date-fns';

const propTypes = {
  label: PropTypes.string,
  items: PropTypes.array,
};

const SLAEventItem = ({ label, items }) => {
  const formatDate = timestamp => format(fromUnixTime(timestamp), 'MMM dd, yyyy, hh:mm a');

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <Text
        style={{
          fontSize: 14,
          position: 'sticky',
          top: 0,
          fontFamily: 'System',
          fontWeight: 'normal',
          letterSpacing: -0.6,
          minWidth: 140,
          color: '#374151', // text-slate-600
        }}>
        {label}
      </Text>
      <View style={{ flex: 1, flexDirection: 'column', gap: 2 }}>
        {items.map(item => (
          <Text
            key={item.id}
            style={{
              fontSize: 14,
              fontFamily: 'System',
              fontWeight: 'normal',
              color: '#1F2937', // text-slate-900
              textAlign: 'right',
              fontVariant: ['tabular-nums'],
            }}>
            {formatDate(item.created_at)}
          </Text>
        ))}
      </View>
    </View>
  );
};
SLAEventItem.propTypes = propTypes;

export default SLAEventItem;
