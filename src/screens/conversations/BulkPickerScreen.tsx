import { useTailwind } from '@/theme/useTailwind';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Avatar, Icon } from '@/components-next';
import {
  GlassCircleButton,
  GlassPillButton,
} from '@/components-next/side-toolbar/GlassCircleButton';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { PaneHeader } from '@/navigation/split/PaneHeader';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { IOSSearchField } from '@/screens/search/components/header/IOSSearchField';
import { assignableAgentActions } from '@/store/assignable-agent/assignableAgentActions';
import { selectAssignableAgentsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import {
  selectSelectedIds,
  selectSelectedInboxes,
} from '@/store/conversation/conversationSelectedSlice';
import { filterLabels } from '@/store/label/labelSelectors';
import { CloseIcon, TickIcon } from '@/svg-icons';
import { useHaptic } from '@/utils';
import { showToast } from '@/utils/toastUtils';

type BulkPickerScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'BulkPicker'>;

const ROW = 'flex-row items-center min-h-11 py-[9px] pr-4 gap-3';

type PickerRow = {
  key: string;
  title: string;
  thumbnail: string | null | undefined;
  color: string | null;
  onPress: () => void;
  checked: boolean;
};
const DIVIDER = 'border-b-[0.5px] border-b-blackA-A6';

// Full-height sheet for bulk Assign and Label on iOS: a search field and the list (agent
// photos, label colors). Assign applies on tap and closes; labels are added on tap (checked)
// so several can be added, then Done.
const BulkPickerScreen = ({ route, navigation }: BulkPickerScreenProps) => {
  const tailwind = useTailwind();
  const { kind } = route.params;
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<string[]>([]);
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedInboxes = useAppSelector(selectSelectedInboxes);
  const agents = useAppSelector(state =>
    selectAssignableAgentsByInboxId(state, selectedInboxes, query),
  );
  const labels = useAppSelector(state => filterLabels(state, query));

  useEffect(() => {
    if (kind === 'assign' && selectedInboxes.length > 0) {
      dispatch(assignableAgentActions.fetchAgents({ inboxIds: selectedInboxes }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assign = async (agentId: number) => {
    haptic?.();
    await dispatch(
      conversationActions.bulkAction({
        type: 'Conversation',
        ids: selectedIds,
        fields: { assignee_id: agentId },
      }),
    );
    showToast({ message: i18n.t('CONVERSATION.ASSIGN_CHANGE') });
    navigation.goBack();
  };

  const addLabel = (title: string) => {
    if (added.includes(title)) return;
    haptic?.();
    setAdded(current => [...current, title]);
    dispatch(
      conversationActions.bulkAction({
        type: 'Conversation',
        ids: selectedIds,
        labels: { add: [title] },
      }),
    );
  };

  const rows = useMemo<PickerRow[]>(
    () =>
      kind === 'assign'
        ? agents.map(agent => ({
            key: `agent-${agent.id}`,
            title: agent.name ?? '',
            thumbnail: 'thumbnail' in agent ? agent.thumbnail : null,
            color: null as string | null,
            onPress: () => {
              assign(agent.id);
            },
            checked: false,
          }))
        : labels.map(label => ({
            key: `label-${label.id}`,
            title: label.title,
            thumbnail: null,
            color: label.color,
            onPress: () => addLabel(label.title),
            checked: added.includes(label.title),
          })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, agents, labels, added],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={tailwind.style('flex-1 bg-white')}>
      <PaneHeader
        title={i18n.t(
          kind === 'assign' ? 'CONVERSATION.BULK.ASSIGN_TO' : 'CONVERSATION.BULK.ADD_LABEL',
        )}
        left={
          <GlassCircleButton
            icon={<CloseIcon stroke={tailwind.color('text-gray-950')} strokeWidth={1.5} />}
            onPress={navigation.goBack}
            accessibilityLabel={i18n.t('CONVERSATION.COMPOSE.CLOSE')}
          />
        }
        right={
          kind === 'label' ? (
            <GlassPillButton
              label={i18n.t('CONVERSATION.HEADER.DONE')}
              onPress={navigation.goBack}
            />
          ) : undefined
        }
      />
      <View style={tailwind.style('flex-row px-4 pb-2')}>
        <IOSSearchField
          value={query}
          isLoading={false}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={i18n.t(
            kind === 'assign'
              ? 'CONVERSATION.BULK.SEARCH_AGENTS'
              : 'CONVERSATION.BULK.SEARCH_LABELS',
          )}
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={row => row.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('pb-10')}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityState={{ checked: item.checked }}
            style={({ pressed }) => tailwind.style('pl-4', pressed && 'bg-gray-100')}>
            <View style={tailwind.style(ROW, index < rows.length - 1 && DIVIDER)}>
              {kind === 'assign' ? (
                <Avatar
                  size="xl"
                  initialsClassName="text-[11px]"
                  src={item.thumbnail ? { uri: item.thumbnail } : undefined}
                  name={item.title}
                />
              ) : (
                <View
                  style={[
                    tailwind.style('h-3 w-3 rounded-full ml-1'),
                    { backgroundColor: item.color ?? '#999' },
                  ]}
                />
              )}
              <Text
                numberOfLines={1}
                style={tailwind.style(
                  'flex-1 text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
                )}>
                {item.title}
              </Text>
              {item.checked ? <Icon icon={<TickIcon />} size={20} /> : null}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

export default BulkPickerScreen;
