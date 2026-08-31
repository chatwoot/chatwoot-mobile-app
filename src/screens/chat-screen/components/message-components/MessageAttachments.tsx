import React from 'react';
import Animated from 'react-native-reanimated';
import { differenceInHours } from 'date-fns';

import { FileErrorIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { ImageMetadata, Message } from '@/types';
import { Icon } from '@/components-next';
import { ATTACHMENT_TYPES, ORIENTATION, TEXT_MAX_WIDTH } from '@/constants';
import { groupAttachmentsByType } from '@/utils/attachmentUtils';
import i18n from '@/i18n';

import { ImageBubbleContainer, ImageThumbnail } from './ImageBubble';
import { FileBubblePreview } from './FileBubble';
import { AudioBubble } from './AudioBubble';
import { VideoBubble, VideoThumbnail } from './VideoBubble';
import { LocationBubble } from './LocationBubble';

type MessageAttachmentsProps = {
  item: Message;
  variant: string;
  orientation?: string;
  /** Email bubbles show fixed-size thumbnails, chat bubbles show full-width media. */
  mediaSize?: 'default' | 'thumbnail';
};

const isInstagramStoryExpired = (messageTimestamp: number) => {
  const currentTime = new Date();
  const messageTime = new Date(messageTimestamp * 1000);

  return differenceInHours(currentTime, messageTime) > 24;
};

export const MessageAttachments = (props: MessageAttachmentsProps) => {
  const { item, variant, orientation = ORIENTATION.LEFT, mediaSize = 'default' } = props;
  const { attachments, private: isPrivate, contentAttributes, createdAt } = item;

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const isAnInstagramStory = contentAttributes?.imageType === ATTACHMENT_TYPES.STORY_MENTION;
  const imageWidth = TEXT_MAX_WIDTH - 24 - (isPrivate ? 13 : 0);
  const isThumbnail = mediaSize === 'thumbnail';
  // Rows stay stretched so percentage-width media resolves against the bubble; the
  // contents are aligned inside each row instead.
  const rowAlignment = orientation === ORIENTATION.RIGHT ? 'justify-end' : 'justify-start';
  const { media, recordings, files, locations } = groupAttachmentsByType(attachments);

  // Thumbnails sit side by side and wrap; full-width media stacks.
  const mediaItemStyle = isThumbnail ? '' : `flex flex-row my-2 ${rowAlignment}`;

  const renderMedia = (attachment: ImageMetadata, index: number) => {
    const key = `${attachment.fileType}-${attachment.id ?? index}`;

    if (attachment.fileType === ATTACHMENT_TYPES.IMAGE) {
      if (isAnInstagramStory && isInstagramStoryExpired(createdAt)) {
        return (
          <Animated.View
            key={key}
            style={tailwind.style(
              'flex flex-row items-center justify-center py-8 bg-slate-100 gap-1 rounded-lg',
            )}>
            <Icon icon={<FileErrorIcon fill={tailwind.color('text-gray-900')} />} />
            <Animated.Text
              style={tailwind.style('text-cxs font-inter-420-20 text-gray-900 mt-[1px]')}>
              {i18n.t('CONVERSATION.STORY_NOT_AVAILABLE')}
            </Animated.Text>
          </Animated.View>
        );
      }

      if (!attachment.dataUrl) {
        return null;
      }

      return (
        <Animated.View key={key} style={tailwind.style(mediaItemStyle)}>
          {isThumbnail ? (
            <ImageThumbnail imageSrc={attachment.dataUrl} />
          ) : (
            <ImageBubbleContainer imageSrc={attachment.dataUrl} maxWidth={imageWidth} />
          )}
        </Animated.View>
      );
    }

    if (!attachment.dataUrl) {
      return null;
    }

    return (
      <Animated.View key={key} style={tailwind.style('items-center', mediaItemStyle)}>
        {isThumbnail ? (
          <VideoThumbnail videoSrc={attachment.dataUrl} />
        ) : (
          <VideoBubble videoSrc={attachment.dataUrl} />
        )}
      </Animated.View>
    );
  };

  return (
    <Animated.View>
      {media.length > 0 ? (
        <Animated.View
          style={tailwind.style(
            isThumbnail ? `flex flex-row flex-wrap gap-1 my-2 ${rowAlignment}` : '',
          )}>
          {media.map(renderMedia)}
        </Animated.View>
      ) : null}

      {recordings.map((attachment, index) => (
        <Animated.View
          key={`audio-${attachment.id ?? index}`}
          style={tailwind.style('flex flex-row items-center my-2', rowAlignment)}>
          <AudioBubble audioSrc={attachment.dataUrl} variant={variant} />
        </Animated.View>
      ))}

      {files.map((attachment, index) => (
        <Animated.View
          key={`file-${attachment.id ?? index}`}
          style={tailwind.style(
            'flex flex-row items-center relative max-w-[300px] my-2',
            rowAlignment,
          )}>
          <FileBubblePreview fileSrc={attachment.dataUrl} isComposed variant={variant} />
        </Animated.View>
      ))}

      {locations.map((attachment, index) => (
        <Animated.View
          key={`location-${attachment.id ?? index}`}
          style={tailwind.style('flex flex-row items-center my-2', rowAlignment)}>
          <LocationBubble
            latitude={attachment.coordinatesLat}
            longitude={attachment.coordinatesLong}
            variant={variant}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
};
