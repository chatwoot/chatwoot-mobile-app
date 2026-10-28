import { PressableProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export type SendMessageButtonProps = PressableProps & {
  variant?: 'default' | 'copilot';
};

export type AddCommandButtonProps = PressableProps & {
  derivedAddMenuOptionStateValue: SharedValue<number>;
  // iPhone Duo reply bar: round Liquid Glass button.
  glass?: boolean;
};

export type PhotosCommandButtonProps = PressableProps & {};

export type VoiceRecordButtonProps = PressableProps & {
  // iPhone Duo reply bar: round Liquid Glass button next to the text field.
  glass?: boolean;
};
