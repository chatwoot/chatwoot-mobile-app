import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
// import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';

let Galeria: any = ({ children }: any) => <View>{children}</View>;
// Add static properties that might be used
Galeria.Image = ({ children }: any) => <View>{children}</View>;

try {
  Galeria = require('@nandorojo/galeria').Galeria;
} catch (e) {
  console.warn('@nandorojo/galeria not available');
}

type ImageCellProps = {
  imageSrc: string;
};

type ImageContainerProps = Pick<ImageCellProps, 'imageSrc'> & {
  width?: number;
  height?: number;
};

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, height = 215, width = 400 } = props;

  return (
    <Galeria urls={[imageSrc]}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="cover"
          style={[
            tailwind.style('h-full w-full bg-gray-100 overflow-hidden'),
            { width: width, height: height },
          ]}
        />
      </Galeria.Image>
    </Galeria>
  );
};

export const ImageBubble = (props: ImageCellProps) => {
  const { imageSrc } = props;

  return (
    <React.Fragment>
      <ImageBubbleContainer {...{ imageSrc }} />
    </React.Fragment>
  );
};
