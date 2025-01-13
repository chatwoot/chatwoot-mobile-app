import React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

// Using Context because we need to access this shared value variable in various components
// and we cannot use the useSharedValue hook inside Zustand store
interface InboxListStateContextType {
  openedRowIndex: SharedValue<number>;
}

const InboxListStateContext = React.createContext<InboxListStateContextType | undefined>(undefined);

const useInboxListStateContext = (): InboxListStateContextType => {
  const context = React.useContext(InboxListStateContext);
  if (!context) {
    throw new Error(
      'InboxListStateContext: `InboxListStateContext` is undefined. Seems you forgot to wrap component within the InboxListStateProvider',
    );
  }

  return context;
};

const InboxListStateProvider: React.FC<
  Partial<InboxListStateContextType & { children: React.ReactNode }>
> = props => {
  const openedRowIndex = useSharedValue<number>(-1);

  const { children } = props;

  return (
    <InboxListStateContext.Provider value={{ openedRowIndex }}>
      {children}
    </InboxListStateContext.Provider>
  );
};

export { InboxListStateProvider, useInboxListStateContext };
