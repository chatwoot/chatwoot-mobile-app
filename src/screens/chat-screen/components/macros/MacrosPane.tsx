import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GlassCircleButton,
  HEADER_ICON_COLOR,
} from '@/components-next/side-toolbar/GlassCircleButton';
import { GlassPillButton } from '@/components-next/side-toolbar/GlassPillButton';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { PaneHeader } from '@/navigation/split/PaneHeader';
import { PageHeader } from '@/navigation/split/PageHeader';
import { useSplitView } from '@/navigation/split/SplitViewContext';
import { macroActions } from '@/store/macro/macroActions';
import { selectAllMacros } from '@/store/macro/macroSelectors';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Macro } from '@/types';
import { useHaptic } from '@/utils';
import { showToast } from '@/utils/toastUtils';

import { MacroList } from './MacroList';
import { MacroSteps } from './MacroSteps';

export const MacrosPane = ({
  conversationId,
  onClose,
}: {
  conversationId: number;
  onClose?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const splitView = useSplitView();
  const { bottom } = useSafeAreaInsets();
  const macros = useAppSelector(selectAllMacros);
  const [selected, setSelected] = useState<Macro | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);

  const runMacro = async (macro: Macro) => {
    haptic?.();
    setRunningId(macro.id);
    try {
      await dispatch(
        macroActions.executeMacro({ macroId: macro.id, conversationIds: [conversationId] }),
      ).unwrap();
      showToast({ message: i18n.t('MACRO.EXECUTION_SUCCESS') });
      if (onClose) onClose();
      else splitView?.closeSecondary();
    } catch {
      showToast({ message: i18n.t('MACRO.EXECUTION_ERROR') });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <View style={tailwind.style('flex-1')}>
      {selected ? (
        <PaneHeader
          title={selected.name}
          left={
            <GlassCircleButton
              icon={<ChevronLeft stroke={HEADER_ICON_COLOR} strokeWidth={1.5} />}
              onPress={() => setSelected(null)}
              accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
            />
          }
          right={
            <GlassPillButton
              label={i18n.t('MACRO.ACTIONS.RUN')}
              onPress={() => runMacro(selected)}
              disabled={runningId !== null}
            />
          }
        />
      ) : onClose ? (
        <PageHeader title={i18n.t('MACRO.TITLE')} onBack={onClose} />
      ) : (
        <PaneHeader title={i18n.t('MACRO.TITLE')} />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[tailwind.style('pt-2'), { paddingBottom: bottom + 24 }]}>
        {selected ? (
          <MacroSteps macro={selected} conversationId={conversationId} />
        ) : (
          <MacroList
            macros={macros}
            onSelect={setSelected}
            onRun={runMacro}
            runningId={runningId}
          />
        )}
      </ScrollView>
    </View>
  );
};
