import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon } from 'components';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import { evaluateSLAStatus } from 'helpers/SLAHelper';
import { SLA_MISS_TYPES } from 'src/constants/index';
import SLAEventItem from './SLAEventItem';

const REFRESH_INTERVAL = 60000;

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    cardLabelWrap: {
      marginTop: spacing.micro,
      paddingTop: spacing.tiny,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    labelView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginRight: 4,
      marginBottom: 4,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: colors.borderLight,
      gap: 4,
    },
    line: {
      height: 12,
      width: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 4,
    },
  });
};

const propTypes = {
  slaMissedEvents: PropTypes.array,
};

const SLAMisses = ({ slaMissedEvents }) => {
  const frtMisses = slaMissedEvents.filter(slaEvent => slaEvent.event_type === SLA_MISS_TYPES.FRT);
  const nrtMisses = () => {
    return slaMissedEvents.filter(slaEvent => slaEvent.event_type === SLA_MISS_TYPES.NRT);
  };
  const rtMisses = slaMissedEvents.filter(slaEvent => slaEvent.event_type === SLA_MISS_TYPES.RT);

  return (
    <View>
      {frtMisses.length > 0 && <SLAEventItem label="FRT Misses" items={frtMisses} />}
      {nrtMisses.length > 0 && <SLAEventItem label="NRT Misses" items={nrtMisses} />}
      {rtMisses.length > 0 && <SLAEventItem label="RT Misses" items={rtMisses} />}
    </View>
  );
};

SLAMisses.propTypes = propTypes;
export default SLAMisses;
