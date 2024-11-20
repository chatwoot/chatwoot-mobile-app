import React, { Ref, useRef, useState } from 'react';
import { TextInputProps } from 'react-native';

// Using Context because we need to access this shared value variable in various components
// and we cannot use the useSharedValue hook inside Zustand store
interface ChatWindowContextType {
  isAddMenuOptionSheetOpen: boolean;
  setAddMenuOptionSheetState: React.Dispatch<React.SetStateAction<boolean>>;

  textInputRef: Ref<TextInputProps>;

  isTextInputFocused: boolean;
  setIsTextInputFocused: React.Dispatch<React.SetStateAction<boolean>>;

  isVoiceRecorderOpen: boolean;
  setIsVoiceRecorderOpen: React.Dispatch<React.SetStateAction<boolean>>;

  pagerViewIndex: number;
  setPagerViewIndex: React.Dispatch<React.SetStateAction<number>>;
  conversationId: number;
}

const ChatWindowContext = React.createContext<ChatWindowContextType | undefined>(undefined);

const useChatWindowContext = (): ChatWindowContextType => {
  const context = React.useContext(ChatWindowContext);
  if (!context) {
    throw new Error(
      'ChatWindowContext: `ChatWindowContext` is undefined. Seems you forgot to wrap component within the CalendarProvider',
    );
  }

  return context;
};

const ChatWindowProvider: React.FC<
  Partial<ChatWindowContextType & { children: React.ReactNode }>
> = props => {
  const [isAddMenuOptionSheetOpen, setAddMenuOptionSheetState] = useState(false);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [pagerViewIndex, setPagerViewIndex] = useState(0);

  const textInputRef = useRef<TextInputProps>(null);

  const { children, conversationId = 0 } = props;

  return (
    <ChatWindowContext.Provider
      value={{
        isAddMenuOptionSheetOpen,
        setAddMenuOptionSheetState,
        textInputRef,
        isTextInputFocused,
        setIsTextInputFocused,
        isVoiceRecorderOpen,
        setIsVoiceRecorderOpen,
        pagerViewIndex,
        setPagerViewIndex,
        conversationId,
      }}>
      {children}
    </ChatWindowContext.Provider>
  );
};

export { ChatWindowProvider, useChatWindowContext };
