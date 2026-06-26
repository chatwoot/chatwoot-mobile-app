import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import i18n from 'i18n';
import { isoDate } from '../data/format';
import { DEFAULT_RANGE_DAYS, type DiagnosticsState, type FilterKey } from '../data/reducer';
import { colors } from './theme';

interface Props {
  state: DiagnosticsState;
  setRange: (from: string, to: string) => void;
  setFilter: (key: FilterKey, value: string) => void;
  clearFilters: () => void;
  total: number;
  onClose: () => void;
}

type Opt = { value: string; label: string };

const boolOptions: Opt[] = [
  { value: '', label: 'NETWORK_DIAGNOSTICS.FILTER_ALL' },
  { value: 'true', label: 'NETWORK_DIAGNOSTICS.FILTER_YES' },
  { value: 'false', label: 'NETWORK_DIAGNOSTICS.FILTER_NO' },
];
const statusOptions: Opt[] = [
  { value: '', label: 'NETWORK_DIAGNOSTICS.FILTER_ALL' },
  { value: 'pendente', label: 'NETWORK_DIAGNOSTICS.STATUS_PENDING' },
  { value: 'resolvido', label: 'NETWORK_DIAGNOSTICS.STATUS_RESOLVED' },
];
const outcomeOptions: Opt[] = [
  { value: '', label: 'NETWORK_DIAGNOSTICS.FILTER_OUTCOME_ALL' },
  {
    value: 'instavel_transferido_suporte',
    label: 'NETWORK_DIAGNOSTICS.OUTCOME_INSTAVEL',
  },
  {
    value: 'offline_transferido_suporte',
    label: 'NETWORK_DIAGNOSTICS.OUTCOME_OFFLINE',
  },
  {
    value: 'problema_conexao_observado',
    label: 'NETWORK_DIAGNOSTICS.OUTCOME_CONEXAO',
  },
];

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <View style={styles.segment}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
            onPress={() => onChange(opt.value)}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {i18n.t(opt.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const FilterSheet = forwardRef<BottomSheetModal, Props>(function FilterSheet(
  { state, setRange, setFilter, clearFilters, total, onClose },
  ref,
) {
  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose
      snapPoints={['85%']}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}>
      <BottomSheetScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_TITLE')}</Text>

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_PERIOD')}</Text>
        <Segmented
          value={state.from === isoDate(29) ? '30' : '7'}
          options={[
            { value: '7', label: 'NETWORK_DIAGNOSTICS.FILTER_PERIOD_7' },
            { value: '30', label: 'NETWORK_DIAGNOSTICS.FILTER_PERIOD_30' },
          ]}
          onChange={v => setRange(isoDate(v === '30' ? 29 : DEFAULT_RANGE_DAYS - 1), isoDate(0))}
        />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_STATUS')}</Text>
        <Segmented
          value={state.status}
          options={statusOptions}
          onChange={v => setFilter('status', v)}
        />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_OUTCOME')}</Text>
        <Segmented
          value={state.outcome}
          options={outcomeOptions}
          onChange={v => setFilter('outcome', v)}
        />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_CONNECTION')}</Text>
        <Segmented
          value={state.connectionIssueObserved}
          options={boolOptions}
          onChange={v => setFilter('connectionIssueObserved', v)}
        />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_TRANSFERIDO')}</Text>
        <Segmented
          value={state.transferido}
          options={boolOptions}
          onChange={v => setFilter('transferido', v)}
        />

        <Pressable
          style={styles.toggleRow}
          onPress={() => setFilter('churnRisk', state.churnRisk === 'true' ? '' : 'true')}>
          <Text style={styles.toggleLabel}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_CHURN_ONLY')}</Text>
          <View style={[styles.track, state.churnRisk === 'true' && styles.trackOn]}>
            <View style={[styles.knob, state.churnRisk === 'true' && styles.knobOn]} />
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearText}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_CLEAR')}</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyText}>
              {i18n.t('NETWORK_DIAGNOSTICS.FILTER_APPLY').replace('{count}', String(total))}
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: colors.sheet },
  handle: { backgroundColor: 'rgba(255,255,255,0.18)', width: 38 },
  body: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  section: {
    fontSize: 12,
    color: colors.textDim,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 16,
  },
  segment: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segmentItemActive: {
    backgroundColor: 'rgba(75,141,248,0.18)',
    borderColor: 'rgba(75,141,248,0.55)',
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#8A93A8' },
  segmentTextActive: { color: '#A8C8FF' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 11,
    padding: 14,
    marginTop: 24,
  },
  toggleLabel: { color: '#EAEFF8', fontSize: 13.5, fontWeight: '500' },
  track: {
    width: 44,
    height: 25,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.brand },
  knob: { width: 19, height: 19, borderRadius: 999, backgroundColor: '#fff', marginLeft: 3 },
  knobOn: { marginLeft: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  clearBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
  },
  clearText: { color: '#C7D0E0', fontSize: 14, fontWeight: '600' },
  applyBtn: {
    flex: 2,
    backgroundColor: colors.brand,
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
  },
  applyText: { color: '#06122B', fontSize: 14, fontWeight: '700' },
});
