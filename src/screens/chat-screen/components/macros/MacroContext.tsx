import React, { createContext, useContext, useState } from 'react';
import { Macro } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { macroActions } from '@/store/macro/macroActions';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useRequiredAttributes } from '@/screens/resolve-attributes/useRequiredAttributes';
import { resolvesConversation } from '@/utils/macroUtils';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';

type MacroContextType = {
  selectedMacro: Macro | null;
  setSelectedMacro: (macro: Macro | null) => void;
  executeMacro: (macro: Macro) => void;
  isExecuting: boolean;
  executingMacroId: number | null;
  conversationId: number;
};

const MacroContext = createContext<MacroContextType | undefined>(undefined);

export const MacroProvider: React.FC<{
  children: React.ReactNode;
  conversationId: number;
  onClose: () => void;
}> = ({ children, conversationId, onClose }) => {
  const [selectedMacro, setSelectedMacro] = useState<Macro | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingMacroId, setExecutingMacroId] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const { hasMissingAttributes, openResolveForm } = useRequiredAttributes();

  const executeMacro = async (macro: Macro) => {
    if (resolvesConversation(macro) && hasMissingAttributes(conversation)) {
      onClose();
      openResolveForm({ conversationId, macroId: macro.id });
      return;
    }
    try {
      setIsExecuting(true);
      setExecutingMacroId(macro.id);
      await dispatch(
        macroActions.executeMacro({ macroId: macro.id, conversationIds: [conversationId] }),
      ).unwrap();

      showToast({
        message: i18n.t('MACRO.EXECUTION_SUCCESS'),
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToast({
        message: i18n.t('MACRO.EXECUTION_ERROR'),
      });
    } finally {
      onClose();
      setIsExecuting(false);
      setExecutingMacroId(null);
    }
  };

  return (
    <MacroContext.Provider
      value={{
        selectedMacro,
        setSelectedMacro,
        executeMacro,
        isExecuting,
        conversationId,
        executingMacroId,
      }}>
      {children}
    </MacroContext.Provider>
  );
};

export const useMacroContext = () => {
  const context = useContext(MacroContext);
  if (context === undefined) {
    throw new Error('useMacroContext must be used within a MacroProvider');
  }
  return context;
};

export default MacroContext;
