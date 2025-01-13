import React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

// Using Context because we need to access this shared value variable in various components
// and we cannot use the useSharedValue hook inside redux store
interface ConversationListStateContextType {
  openedRowIndex: SharedValue<number>;
}

const ConversationListStateContext = React.createContext<
  ConversationListStateContextType | undefined
>(undefined);

const useConversationListStateContext = (): ConversationListStateContextType => {
  const context = React.useContext(ConversationListStateContext);
  if (!context) {
    throw new Error(
      'ConversationListStateContext: `ConversationListStateContext` is undefined. Seems you forgot to wrap component within the ConversationListStateProvider',
    );
  }

  return context;
};

const ConversationListStateProvider: React.FC<
  Partial<ConversationListStateContextType & { children: React.ReactNode }>
> = props => {
  const openedRowIndex = useSharedValue<number>(-1);

  const { children } = props;

  return (
    <ConversationListStateContext.Provider value={{ openedRowIndex }}>
      {children}
    </ConversationListStateContext.Provider>
  );
};

export { ConversationListStateProvider, useConversationListStateContext };
