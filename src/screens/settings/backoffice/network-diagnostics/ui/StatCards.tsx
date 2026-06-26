import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from 'i18n';
import type { NetworkStats } from '../data/types';
import { colors, tone, type Tone } from './theme';

interface Props {
  stats: NetworkStats | null;
  loading: boolean;
}

const CARDS: { key: keyof NetworkStats | 'total'; toneName: Tone; label: string }[] = [
  { key: 'total', toneName: 'brand', label: 'STAT_TOTAL' },
  { key: 'instaveis', toneName: 'warning', label: 'STAT_INSTAVEIS' },
  { key: 'offline', toneName: 'danger', label: 'STAT_OFFLINE' },
  { key: 'transferidos', toneName: 'info', label: 'STAT_TRANSFERIDOS' },
  { key: 'conexao_observada', toneName: 'success', label: 'STAT_CONEXAO' },
  { key: 'churn_risk', toneName: 'churn', label: 'STAT_CHURN' },
  { key: 'pendentes', toneName: 'warning', label: 'STAT_PENDENTES' },
  { key: 'resolvidos', toneName: 'success', label: 'STAT_RESOLVIDOS' },
];

export function StatCards({ stats, loading }: Props): JSX.Element {
  return (
    <View style={styles.grid}>
      {CARDS.map(card => {
        const color = tone(card.toneName);
        const value = stats
          ? (stats[card.key as keyof NetworkStats] as number | undefined)
          : undefined;
        return (
          <View key={String(card.key)} style={[styles.card, { borderLeftColor: color }]}>
            <Text style={styles.label}>{i18n.t(`NETWORK_DIAGNOSTICS.${card.label}`)}</Text>
            <Text style={[styles.value, { color }]}>
              {loading || value === undefined ? '—' : value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, paddingHorizontal: 20, paddingTop: 18 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 11.5, color: colors.textDim, fontWeight: '500' },
  value: { fontSize: 27, fontWeight: '700' },
});
