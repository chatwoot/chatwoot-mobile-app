import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from 'i18n';
import type { NetworkStats } from '../data/types';
import { zeroFillByDay } from '../data/format';
import { colors } from './theme';

interface Props { stats: NetworkStats | null; from: string; to: string; }

const CHART_HEIGHT = 130;

/** `YYYY-MM-DD` -> `DD/MM`. */
function dayLabel(date: string): string {
  const [, m, d] = date.split('-');
  return d && m ? `${d}/${m}` : date;
}

export function TrendChart({ stats, from, to }: Props): JSX.Element {
  const days = useMemo(() => zeroFillByDay(from, to, stats?.by_day), [from, to, stats?.by_day]);
  const max = Math.max(1, ...days.map(d => d.total));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.TREND_TITLE')}</Text>
      <Text style={styles.subtitle}>{i18n.t('NETWORK_DIAGNOSTICS.TREND_SUBTITLE')}</Text>
      <View style={styles.legend}>
        <Legend color={colors.red} label={i18n.t('NETWORK_DIAGNOSTICS.LEGEND_OFFLINE')} />
        <Legend color={colors.amber} label={i18n.t('NETWORK_DIAGNOSTICS.LEGEND_INSTAVEIS')} />
        <Legend color={colors.green} label={i18n.t('NETWORK_DIAGNOSTICS.LEGEND_CONEXAO')} />
      </View>
      <View style={styles.bars}>
        {days.map(day => {
          const h = (n: number) => Math.round((n / max) * CHART_HEIGHT);
          return (
            <View key={day.date} style={styles.barColumn}>
              <View style={{ height: h(day.conexao_observada), backgroundColor: colors.green, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
              <View style={{ height: h(day.instaveis), backgroundColor: colors.amber }} />
              <View style={{ height: h(day.offline), backgroundColor: colors.red, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {days.map(day => (
          <Text key={day.date} style={styles.dayLabel} numberOfLines={1}>{dayLabel(day.date)}</Text>
        ))}
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginHorizontal: 20, marginTop: 14, marginBottom: 32 },
  title: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 11.5, color: colors.textDim, marginTop: 3 },
  legend: { flexDirection: 'row', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 10.5, color: colors.textDim },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: CHART_HEIGHT, marginTop: 16 },
  barColumn: { flex: 1, flexDirection: 'column', justifyContent: 'flex-end', height: '100%' },
  labels: { flexDirection: 'row', gap: 8, marginTop: 9 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.eyebrow },
});
