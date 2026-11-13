import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import type { ImageCellProps, ImageContainerProps } from '@/hooks/useImageDimensions';
import { useCloudflareMedia } from '@/hooks/useCloudflareMedia';
import { Spinner } from '@/components-next/spinner';
import i18n from '@/i18n';

const MediaPlaceholder = ({ loading }: { loading: boolean }) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('flex-1 items-center justify-center')}>
      {loading ? <Spinner size={16} /> : <Text>{i18n.t('CONVERSATION.FILE_LOAD_ERROR')}</Text>}
    </View>
  );
};

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const tailwind = useTailwind();
  const { imageSrc, maxWidth = 300, maxHeight = 360 } = props;
  const media = useCloudflareMedia(imageSrc);
  const imageStyle = useImageDimensions(media.uri ?? '', maxWidth, maxHeight);

  if (!media.uri) {
    return (
      <View style={[tailwind.style('bg-gray-100 rounded-xl overflow-hidden'), imageStyle]}>
        <MediaPlaceholder loading={media.loading} />
      </View>
    );
  }

  return (
    <Galeria urls={[media.uri]}>
      <Galeria.Image>
        <Image
          source={{ uri: media.uri }}
          contentFit="contain"
          style={[tailwind.style('bg-gray-100 overflow-hidden'), imageStyle]}
        />
      </Galeria.Image>
    </Galeria>
  );
};

// Fixed-size media thumbnail.
export const ImageThumbnail = (props: ImageCellProps) => {
  const tailwind = useTailwind();
  const { imageSrc } = props;
  const media = useCloudflareMedia(imageSrc);

  if (!media.uri) {
    return (
      <View style={tailwind.style('h-[72px] w-[72px] rounded-xl bg-gray-100 overflow-hidden')}>
        <MediaPlaceholder loading={media.loading} />
      </View>
    );
  }

  return (
    <Galeria urls={[media.uri]}>
      <Galeria.Image>
        <Image
          source={{ uri: media.uri }}
          contentFit="cover"
          style={tailwind.style('h-[72px] w-[72px] rounded-xl bg-gray-100 overflow-hidden')}
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
