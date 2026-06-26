import React, { forwardRef, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import i18n from 'i18n';
import type { NetworkCase, NetworkCaseEditEntry } from '../data/types';
import { formatDateTime, parseEditHistory } from '../data/format';
import { colors } from './theme';

const MAX = 2000;

interface Props {
  item: NetworkCase | null;
  saving: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}

function actionLabel(entry: NetworkCaseEditEntry): string {
  if (entry.action === 'status') {
    return entry.to === 'resolvido'
      ? i18n.t('NETWORK_DIAGNOSTICS.HISTORY_MARKED_RESOLVED')
      : i18n.t('NETWORK_DIAGNOSTICS.HISTORY_MARKED_PENDING');
  }
  return i18n.t('NETWORK_DIAGNOSTICS.HISTORY_COMMENT_EDITED');
}

export const CommentSheet = forwardRef<BottomSheetModal, Props>(function CommentSheet(
  { item, saving, onSave, onClose },
  ref,
) {
  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft(item?.comentario ?? '');
  }, [item?.sk, item?.comentario]);

  const history = item ? parseEditHistory(item.edit_history).slice().reverse() : [];

  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose
      snapPoints={['70%']}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
      keyboardBehavior="interactive">
      <BottomSheetScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_TITLE')}</Text>
        <Text style={styles.client}>
          {item?.cliente_nome || i18n.t('NETWORK_DIAGNOSTICS.ANONYMOUS')}
        </Text>

        <BottomSheetTextInput
          style={styles.textarea}
          multiline
          maxLength={MAX}
          value={draft}
          onChangeText={setDraft}
          editable={!saving}
          placeholder={i18n.t('NETWORK_DIAGNOSTICS.COMMENT_PLACEHOLDER')}
          placeholderTextColor="#5C6680"
        />
        <View style={styles.metaRow}>
          <Text style={styles.hint}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_CLEAR_HINT')}</Text>
          <Text style={styles.counter}>
            {i18n
              .t('NETWORK_DIAGNOSTICS.COMMENT_COUNTER')
              .replace('{count}', String(draft.length))
              .replace('{max}', String(MAX))}
          </Text>
        </View>

        {item?.comentario_updated_at && (
          <Text style={styles.updatedAt}>
            {i18n
              .t('NETWORK_DIAGNOSTICS.COMMENT_UPDATED_AT')
              .replace('{date}', formatDateTime(item.comentario_updated_at))}
          </Text>
        )}

        {history.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.historyTitle}>{i18n.t('NETWORK_DIAGNOSTICS.HISTORY_TITLE')}</Text>
            {history.map((entry, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.historyAction}>{actionLabel(entry)}</Text>
                <Text style={styles.historyMeta}>
                  {i18n
                    .t('NETWORK_DIAGNOSTICS.HISTORY_ENTRY_META')
                    .replace('{by}', entry.by || '—')
                    .replace('{date}', formatDateTime(entry.at))}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
            <Text style={styles.cancelText}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_CANCEL')}</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={() => onSave(draft.trim())} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#06122B" />
            ) : (
              <Text style={styles.saveText}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_SAVE')}</Text>
            )}
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
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  client: { fontSize: 12.5, color: colors.textDim, marginTop: 5, marginBottom: 14 },
  textarea: {
    minHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 13,
    padding: 14,
    color: '#E8ECF4',
    fontSize: 14.5,
    textAlignVertical: 'top',
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  hint: { fontSize: 11.5, color: colors.textMuted },
  counter: { fontSize: 11.5, color: colors.textMuted },
  updatedAt: { fontSize: 11.5, color: colors.textMuted, marginTop: 10 },
  history: { marginTop: 18, gap: 8 },
  historyTitle: { fontSize: 12, fontWeight: '600', color: colors.textDim },
  historyItem: { gap: 2 },
  historyAction: { fontSize: 13, color: '#E8ECF4' },
  historyMeta: { fontSize: 11, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: { color: '#C7D0E0', fontSize: 14, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.brand,
    borderRadius: 13,
    padding: 15,
    alignItems: 'center',
  },
  saveText: { color: '#06122B', fontSize: 14, fontWeight: '700' },
});
