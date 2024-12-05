import { PressableProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export type SendMessageButtonProps = PressableProps & {};

export type AddCommandButtonProps = PressableProps & {
  derivedAddMenuOptionStateValue: SharedValue<number>;
};

export type PhotosCommandButtonProps = PressableProps & {};
