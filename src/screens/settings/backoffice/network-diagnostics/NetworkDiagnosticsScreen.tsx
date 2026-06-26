// NetworkDiagnosticsScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { StackActions, useNavigation } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import i18n from 'i18n';
import { useAppDispatch } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { showToast } from '@/utils/toastUtils';
import { useNetworkDiagnostics } from './useNetworkDiagnostics';
import { chipCounts, searchCases } from './data/reducer';
import { caseStatus } from './data/format';
import type { NetworkCase } from './data/types';
import { colors } from './ui/theme';
import { StatCards } from './ui/StatCards';
import { TrendChart } from './ui/TrendChart';
import { CaseCard } from './ui/CaseCard';
import { FilterSheet } from './ui/FilterSheet';
import { CommentSheet } from './ui/CommentSheet';

type Tab = 'casos' | 'resumo';
type Chip = { key: string; labelKey: string; count: number; active: boolean; onPress: () => void };

export default function NetworkDiagnosticsScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const nd = useNetworkDiagnostics();
  const {
    state,
    setRange,
    setFilter,
    clearFilters,
    loadMore,
    toggleStatus,
    saveComment,
    updatingSk,
  } = nd;

  const [tab, setTab] = useState<Tab>('casos');
  const [search, setSearch] = useState('');
  const [commentCase, setCommentCase] = useState<NetworkCase | null>(null);

  const filterRef = useRef<BottomSheetModal>(null);
  const commentRef = useRef<BottomSheetModal>(null);

  const counts = useMemo(() => chipCounts(state.stats), [state.stats]);
  const visibleCases = useMemo(() => searchCases(state.items, search), [state.items, search]);

  const filterActive =
    state.status !== '' ||
    state.outcome !== '' ||
    state.churnRisk !== '' ||
    state.transferido !== '' ||
    state.connectionIssueObserved !== '';

  const chips: Chip[] = [
    {
      key: 'all',
      labelKey: 'CHIP_ALL',
      count: counts.all,
      active: state.status === '' && state.churnRisk === '',
      onPress: () => {
        setFilter('status', '');
        setFilter('churnRisk', '');
      },
    },
    {
      key: 'pending',
      labelKey: 'CHIP_PENDING',
      count: counts.pending,
      active: state.status === 'pendente',
      onPress: () => setFilter('status', 'pendente'),
    },
    {
      key: 'risk',
      labelKey: 'CHIP_RISK',
      count: counts.risk,
      active: state.churnRisk === 'true',
      onPress: () => setFilter('churnRisk', state.churnRisk === 'true' ? '' : 'true'),
    },
    {
      key: 'resolved',
      labelKey: 'CHIP_RESOLVED',
      count: counts.resolved,
      active: state.status === 'resolvido',
      onPress: () => setFilter('status', 'resolvido'),
    },
  ];

  const onToggleStatus = useCallback(
    async (item: NetworkCase) => {
      if (!nd.ready) {
        showToast({ message: i18n.t('NETWORK_DIAGNOSTICS.ERROR_NO_SESSION') });
        return;
      }
      const current = caseStatus(item);
      try {
        await toggleStatus(item.sk, current);
        showToast({
          message: i18n.t(
            current === 'resolvido'
              ? 'NETWORK_DIAGNOSTICS.TOAST_PENDING'
              : 'NETWORK_DIAGNOSTICS.TOAST_RESOLVED',
          ),
        });
      } catch {
        showToast({ message: i18n.t('NETWORK_DIAGNOSTICS.ERROR_UPDATE') });
      }
    },
    [nd.ready, toggleStatus],
  );

  const onOpenCase = useCallback(
    async (item: NetworkCase) => {
      if (!item.conversation_id) return;
      await dispatch(conversationActions.fetchConversation(item.conversation_id));
      navigation.dispatch(
        StackActions.push('ChatScreen', {
          conversationId: item.conversation_id,
          isConversationOpenedExternally: true,
        } as never),
      );
    },
    [dispatch, navigation],
  );

  const openComment = useCallback((item: NetworkCase) => {
    setCommentCase(item);
    commentRef.current?.present();
  }, []);

  const onSaveComment = useCallback(
    async (text: string) => {
      if (!nd.ready) {
        showToast({ message: i18n.t('NETWORK_DIAGNOSTICS.ERROR_NO_SESSION') });
        return;
      }
      if (!commentCase) return;
      try {
        await saveComment(commentCase.sk, text);
        commentRef.current?.dismiss();
        showToast({
          message: i18n.t(
            text
              ? 'NETWORK_DIAGNOSTICS.TOAST_COMMENT_SAVED'
              : 'NETWORK_DIAGNOSTICS.TOAST_COMMENT_CLEARED',
          ),
        });
      } catch {
        showToast({ message: i18n.t('NETWORK_DIAGNOSTICS.ERROR_UPDATE') });
      }
    },
    [nd.ready, commentCase, saveComment],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>{i18n.t('NETWORK_DIAGNOSTICS.EYEBROW')}</Text>
            <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.TITLE')}</Text>
          </View>
          <Pressable style={styles.filterBtn} onPress={() => filterRef.current?.present()}>
            <Text style={styles.filterGlyph}>⚙</Text>
            {filterActive && <View style={styles.filterDot} />}
          </Pressable>
        </View>
        <View style={styles.tabs}>
          <Pressable onPress={() => setTab('casos')}>
            <Text style={[styles.tab, tab === 'casos' && styles.tabActive]}>
              {i18n.t('NETWORK_DIAGNOSTICS.TAB_CASES')}
            </Text>
          </Pressable>
          <Pressable onPress={() => setTab('resumo')}>
            <Text style={[styles.tab, tab === 'resumo' && styles.tabActive]}>
              {i18n.t('NETWORK_DIAGNOSTICS.TAB_SUMMARY')}
            </Text>
          </Pressable>
        </View>
      </View>

      {!!state.error && (
        <Pressable style={styles.errorBar} onPress={nd.refresh}>
          <Text style={styles.errorText}>
            {i18n.t('NETWORK_DIAGNOSTICS.ERROR_LOAD')} · {i18n.t('NETWORK_DIAGNOSTICS.RETRY')}
          </Text>
        </Pressable>
      )}

      {tab === 'casos' && (
        <>
          <View style={styles.searchRow}>
            <Text style={styles.searchGlyph}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={i18n.t('NETWORK_DIAGNOSTICS.SEARCH_PLACEHOLDER')}
              placeholderTextColor="#5C6680"
            />
            {!!search && (
              <Pressable onPress={() => setSearch('')}>
                <Text style={styles.clearGlyph}>✕</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.chipsRow}>
            {chips.map(chip => (
              <Pressable
                key={chip.key}
                style={[styles.chip, chip.active && styles.chipActive]}
                onPress={chip.onPress}>
                <Text style={[styles.chipText, chip.active && styles.chipTextActive]}>
                  {i18n.t(`NETWORK_DIAGNOSTICS.${chip.labelKey}`)}
                </Text>
                <Text style={styles.chipCount}>{chip.count}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.countLine}>
            {i18n
              .t('NETWORK_DIAGNOSTICS.CASES_COUNT')
              .replace('{count}', String(visibleCases.length))}
          </Text>
        </>
      )}

      <View style={styles.listWrap}>
        {tab === 'casos' ? (
          <FlashList
            data={visibleCases}
            keyExtractor={item => item.sk}
            estimatedItemSize={140}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <CaseCard
                  item={item}
                  busy={updatingSk === item.sk}
                  onToggleStatus={() => onToggleStatus(item)}
                  onComment={() => openComment(item)}
                  onOpen={item.conversation_id ? () => onOpenCase(item) : undefined}
                />
              </View>
            )}
            onEndReachedThreshold={0.5}
            onEndReached={loadMore}
            ListEmptyComponent={
              !state.loadingList ? (
                <Text style={styles.empty}>{i18n.t('NETWORK_DIAGNOSTICS.EMPTY')}</Text>
              ) : null
            }
            ListFooterComponent={
              state.loadingList ? (
                <ActivityIndicator color={colors.brand} style={styles.footer} />
              ) : null
            }
          />
        ) : (
          <FlashList
            data={[0]}
            keyExtractor={() => 'resumo'}
            estimatedItemSize={500}
            renderItem={() => (
              <View>
                <StatCards stats={state.stats} loading={state.loadingStats} />
                <TrendChart stats={state.stats} from={state.from} to={state.to} />
              </View>
            )}
          />
        )}
      </View>

      <FilterSheet
        ref={filterRef}
        state={state}
        setRange={setRange}
        setFilter={setFilter}
        clearFilters={clearFilters}
        total={state.total}
        onClose={() => filterRef.current?.dismiss()}
      />
      <CommentSheet
        ref={commentRef}
        item={commentCase}
        saving={updatingSk === commentCase?.sk}
        onSave={onSaveComment}
        onClose={() => commentRef.current?.dismiss()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  listWrap: { flex: 1 },
  header: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  eyebrow: { fontSize: 11, letterSpacing: 1, color: colors.eyebrow, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 3 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterGlyph: { color: '#C7D0E0', fontSize: 18 },
  filterDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  tabs: { flexDirection: 'row', gap: 24, paddingHorizontal: 20 },
  tab: {
    fontSize: 14.5,
    fontWeight: '600',
    paddingVertical: 9,
    color: '#8A93A8',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { color: colors.text, borderBottomColor: colors.brand },
  errorBar: { backgroundColor: 'rgba(240,82,77,0.14)', paddingVertical: 10, paddingHorizontal: 20 },
  errorText: { color: '#FF7A75', fontSize: 12.5 },
  listContent: { paddingBottom: 32 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 13,
    marginHorizontal: 20,
    marginTop: 14,
  },
  searchGlyph: { color: '#5C6680', fontSize: 15 },
  searchInput: { flex: 1, color: '#E8ECF4', fontSize: 14.5, paddingVertical: 12 },
  clearGlyph: { color: '#5C6680', fontSize: 16 },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: { backgroundColor: 'rgba(75,141,248,0.18)', borderColor: 'rgba(75,141,248,0.55)' },
  chipText: { fontSize: 12.5, fontWeight: '600', color: '#8A93A8' },
  chipTextActive: { color: '#A8C8FF' },
  chipCount: {
    fontSize: 11,
    color: colors.textDim,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  countLine: {
    fontSize: 13,
    color: '#8A93A8',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  cardWrap: { paddingHorizontal: 20, paddingTop: 11 },
  empty: {
    textAlign: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    color: colors.eyebrow,
    fontSize: 13.5,
    lineHeight: 22,
  },
  footer: { paddingVertical: 20 },
});
