import { Platform } from 'react-native';

import {
  ImageBubble as AndroidImageBubble,
  ImageBubbleContainer as AndroidImageBubbleContainer,
} from './ImageBubble.android';
import {
  ImageBubble as IosImageBubble,
  ImageBubbleContainer as IosImageBubbleContainer,
} from './ImageBubble.ios';

export const ImageBubbleContainer =
  Platform.OS === 'ios' ? IosImageBubbleContainer : AndroidImageBubbleContainer;

export const ImageBubble = Platform.OS === 'ios' ? IosImageBubble : AndroidImageBubble;
