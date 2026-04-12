declare module 'react-native-image-modal' {
  import type { ComponentType } from 'react';
  import type { ImageProps, ImageStyle, StyleProp } from 'react-native';

  type ImageModalProps = ImageProps & {
    modalImageResizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
    overlayBackgroundColor?: string;
    imageBackgroundColor?: string;
    isTranslucent?: boolean;
    style?: StyleProp<ImageStyle>;
  };

  const ImageModal: ComponentType<ImageModalProps>;
  export default ImageModal;
}
