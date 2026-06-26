import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import i18n from 'i18n';
import type { NetworkCase } from '../data/types';
import { caseDate, caseStatus, outcomeLabelKey, outcomeTone } from '../data/format';
import { colors } from './theme';

interface Props {
  item: NetworkCase;
  busy: boolean;
  onToggleStatus: () => void;
  onComment: () => void;
  onOpen?: () => void;
}

const TONE_BG: Record<string, string> = {
  warning: 'rgba(242,169,59,0.14)',
  danger: 'rgba(240,82,77,0.14)',
  info: 'rgba(75,141,248,0.14)',
  neutral: 'rgba(255,255,255,0.05)',
};
const TONE_FG: Record<string, string> = {
  warning: colors.amber,
  danger: colors.red,
  info: '#7FB0FF',
  neutral: colors.textDim,
};

export function CaseCard({ item, busy, onToggleStatus, onComment, onOpen }: Props): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = caseStatus(item);
  const resolved = status === 'resolvido';
  const t = outcomeTone(item.outcome);
  const label = outcomeLabelKey(item.outcome);
  const close = () => setMenuOpen(false);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.name}>
            {item.cliente_nome || i18n.t('NETWORK_DIAGNOSTICS.ANONYMOUS')}
          </Text>
          {item.churn_risk && (
            <Text style={styles.churn}>⚠ {i18n.t('NETWORK_DIAGNOSTICS.CHURN_RISK')}</Text>
          )}
          <Text style={[styles.outcome, { backgroundColor: TONE_BG[t], color: TONE_FG[t] }]}>
            {label.startsWith('NETWORK_DIAGNOSTICS.') ? i18n.t(label) : label}
          </Text>
        </View>
        <Pressable
          style={styles.menuBtn}
          onPress={() => setMenuOpen(o => !o)}
          accessibilityLabel="Ações">
          <Text style={styles.menuGlyph}>⋯</Text>
        </Pressable>
      </View>

      <Text style={styles.reason}>{item.connection_issue_reason || '—'}</Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{caseDate(item)}</Text>
        <View style={styles.footerRight}>
          {!!item.comentario && <Text style={styles.commentDot}>💬</Text>}
          <Text
            style={[styles.statusBadge, resolved ? styles.statusResolved : styles.statusPending]}>
            {resolved
              ? i18n.t('NETWORK_DIAGNOSTICS.STATUS_RESOLVED')
              : i18n.t('NETWORK_DIAGNOSTICS.STATUS_PENDING')}
          </Text>
        </View>
      </View>

      {menuOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={styles.menu}>
            <MenuItem
              color={colors.green}
              glyph={resolved ? '↺' : '✓'}
              label={
                resolved
                  ? i18n.t('NETWORK_DIAGNOSTICS.MENU_REOPEN')
                  : i18n.t('NETWORK_DIAGNOSTICS.MENU_RESOLVE')
              }
              disabled={busy}
              onPress={() => {
                close();
                onToggleStatus();
              }}
            />
            <MenuItem
              color={colors.text}
              glyph="💬"
              label={i18n.t('NETWORK_DIAGNOSTICS.MENU_COMMENT')}
              disabled={busy}
              onPress={() => {
                close();
                onComment();
              }}
            />
            {onOpen && (
              <MenuItem
                color={colors.text}
                glyph="↗"
                label={i18n.t('NETWORK_DIAGNOSTICS.MENU_OPEN')}
                disabled={false}
                onPress={() => {
                  close();
                  onOpen();
                }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

function MenuItem({
  color,
  glyph,
  label,
  disabled,
  onPress,
}: {
  color: string;
  glyph: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable style={styles.menuItem} onPress={onPress} disabled={disabled}>
      <Text style={[styles.menuItemGlyph, { color }]}>{glyph}</Text>
      <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 14,
    gap: 11,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  identity: { flex: 1, gap: 9, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '600', color: '#EAEFF8', lineHeight: 19 },
  churn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(240,82,77,0.14)',
    color: '#FF7A75',
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 7,
    overflow: 'hidden',
  },
  outcome: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 7,
    overflow: 'hidden',
  },
  menuBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGlyph: { color: '#AEB8CC', fontSize: 18, lineHeight: 18 },
  reason: { fontSize: 12.5, lineHeight: 18, color: colors.textDim },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 3,
  },
  date: { fontSize: 11.5, color: colors.textMuted },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentDot: { fontSize: 11 },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusPending: { backgroundColor: 'rgba(242,169,59,0.14)', color: colors.amber },
  statusResolved: { backgroundColor: 'rgba(43,212,106,0.14)', color: colors.green },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 8 },
  menu: {
    position: 'absolute',
    top: 46,
    right: 14,
    zIndex: 9,
    width: 220,
    backgroundColor: colors.menu,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    padding: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemGlyph: { width: 18, textAlign: 'center', fontSize: 14 },
  menuItemLabel: { fontSize: 13.5, fontWeight: '500' },
});
