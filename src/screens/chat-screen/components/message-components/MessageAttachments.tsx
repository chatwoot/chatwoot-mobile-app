import React from 'react';
import Animated from 'react-native-reanimated';
import { differenceInHours } from 'date-fns';

import { FileErrorIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { ImageMetadata, Message } from '@/types';
import { Icon } from '@/components-next';
import { ATTACHMENT_TYPES, TEXT_MAX_WIDTH } from '@/constants';
import i18n from '@/i18n';

import { ImageBubbleContainer } from './ImageBubble';
import { FileBubblePreview } from './FileBubble';
import { AudioBubble } from './AudioBubble';
import { VideoBubble } from './VideoBubble';
import { LocationBubble } from './LocationBubble';

type MessageAttachmentsProps = {
  item: Message;
  variant: string;
};

const isInstagramStoryExpired = (messageTimestamp: number) => {
  const currentTime = new Date();
  const messageTime = new Date(messageTimestamp * 1000);

  return differenceInHours(currentTime, messageTime) > 24;
};

// Attachments render grouped by type rather than in payload order: media, then audio,
// then files.
const MEDIA_TYPES = [ATTACHMENT_TYPES.IMAGE, ATTACHMENT_TYPES.VIDEO, ATTACHMENT_TYPES.IG_REEL];

const groupByType = (attachments: ImageMetadata[]) => {
  const ofType = (...types: string[]) =>
    attachments.filter(attachment => types.includes(attachment.fileType));

  const media = ofType(...MEDIA_TYPES).sort(
    (a, b) => MEDIA_TYPES.indexOf(a.fileType) - MEDIA_TYPES.indexOf(b.fileType),
  );

  return [
    ...media,
    ...ofType(ATTACHMENT_TYPES.AUDIO),
    ...ofType(ATTACHMENT_TYPES.FILE),
    ...ofType(ATTACHMENT_TYPES.LOCATION),
  ];
};

export const MessageAttachments = (props: MessageAttachmentsProps) => {
  const { item, variant } = props;
  const { attachments, private: isPrivate, contentAttributes, createdAt } = item;

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const isAnInstagramStory = contentAttributes?.imageType === ATTACHMENT_TYPES.STORY_MENTION;
  const imageWidth = TEXT_MAX_WIDTH - 24 - (isPrivate ? 13 : 0);

  return (
    <React.Fragment>
      {groupByType(attachments).map((attachment, index) => {
        const key = attachment.fileType + index;

        if (attachment.fileType === ATTACHMENT_TYPES.IMAGE) {
          return isAnInstagramStory && isInstagramStoryExpired(createdAt) ? (
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
          ) : (
            <Animated.View key={key} style={tailwind.style('my-2')}>
              <ImageBubbleContainer imageSrc={attachment.dataUrl} maxWidth={imageWidth} />
            </Animated.View>
          );
        }

        if (attachment.fileType === ATTACHMENT_TYPES.FILE) {
          return (
            <Animated.View
              key={key}
              style={tailwind.style('flex flex-row items-center relative max-w-[300px] my-2')}>
              <FileBubblePreview fileSrc={attachment.dataUrl} isComposed variant={variant} />
            </Animated.View>
          );
        }

        if (
          attachment.fileType === ATTACHMENT_TYPES.VIDEO ||
          attachment.fileType === ATTACHMENT_TYPES.IG_REEL
        ) {
          return (
            <Animated.View key={key} style={tailwind.style('flex flex-row items-center my-2')}>
              <VideoBubble videoSrc={attachment.dataUrl} />
            </Animated.View>
          );
        }

        if (attachment.fileType === ATTACHMENT_TYPES.AUDIO) {
          return (
            <Animated.View key={key} style={tailwind.style('flex flex-row items-center my-2')}>
              <AudioBubble audioSrc={attachment.dataUrl} variant={variant} />
            </Animated.View>
          );
        }

        if (attachment.fileType === ATTACHMENT_TYPES.LOCATION) {
          return (
            <Animated.View key={key} style={tailwind.style('flex flex-row items-center my-2')}>
              <LocationBubble
                latitude={attachment.coordinatesLat}
                longitude={attachment.coordinatesLong}
                variant={variant}
              />
            </Animated.View>
          );
        }

        return null;
      })}
    </React.Fragment>
  );
};
