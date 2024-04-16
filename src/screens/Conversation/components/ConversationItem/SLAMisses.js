import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { SLA_MISS_TYPES } from 'src/constants/index';
import SLAMissItem from './SLAMissItem';
import i18n from 'i18n';
const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.smaller,
      paddingTop: spacing.smaller,
      paddingBottom: 100,
    },
  });
};

const propTypes = {
  slaMissedEvents: PropTypes.array,
};

const SLAMisses = ({ slaMissedEvents }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const frtMisses = slaMissedEvents.filter(slaEvent => slaEvent.event_type === SLA_MISS_TYPES.FRT);
  const nrtMisses = slaMissedEvents.filter(slaEvent => slaEvent.event_type === SLA_MISS_TYPES.NRT);
  const rtMisses = slaMissedEvents.filter(slaEvent => slaEvent.event_type === SLA_MISS_TYPES.RT);

  return (
    <View style={styles.container}>
      {frtMisses.length > 0 && <SLAMissItem label={i18n.t('SLA.MISSES.FRT')} items={frtMisses} />}
      {nrtMisses.length > 0 && <SLAMissItem label={i18n.t('SLA.MISSES.NRT')} items={nrtMisses} />}
      {rtMisses.length > 0 && <SLAMissItem label={i18n.t('SLA.MISSES.RT')} items={rtMisses} />}
    </View>
  );
};

SLAMisses.propTypes = propTypes;
export default SLAMisses;
