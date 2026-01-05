import React, { useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { AttachFileIcon, CameraIcon, VideoCall, VoiceNote } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { isMarkdown } from '@/utils';
import { Icon } from '@/components-next';
import { MarkdownDisplay } from './MarkdownDisplay';
import { TEXT_MAX_WIDTH } from '@/constants';

type ReplyMessageCellProps = {
  replyMessage: Message;
  isIncoming: boolean;
  isOutgoing: boolean;
};

export const ReplyMessageCell = (props: ReplyMessageCellProps) => {
  const replyMessageItem = props.replyMessage as Message;

  const { isIncoming, isOutgoing } = props;

  const { messageListRef } = useRefsContext();

  const hasAttachments = useMemo(
    () => replyMessageItem?.attachments?.length > 0,
    [replyMessageItem?.attachments],
  );

  const renderAttachmentSection = () => {
    switch (replyMessageItem.attachments[0].fileType) {
      case 'audio':
        return <Icon size={15} icon={<VoiceNote />} />;
      case 'video':
        return <Icon size={15} icon={<VideoCall />} />;
      case 'image':
        return <Icon size={15} icon={<CameraIcon />} />;
      case 'file':
        return <Icon size={15} icon={<AttachFileIcon />} />;
      default:
        return null;
    }
  };

  const handleScrollToMessage = useCallback(() => {
    messageListRef.current?.scrollToItem({
      item: replyMessageItem,
      animated: true,
      viewPosition: 0.5,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable
      onPress={handleScrollToMessage}
      style={[
        tailwind.style(
          'relative max-w-[300px] pl-2 pr-2.5 py-2 mb-2 rounded-[10px] overflow-hidden -ml-[5px]',
          `max-w-[${TEXT_MAX_WIDTH}px]`,
          isIncoming ? 'bg-blackA-A7' : '',
          isOutgoing ? 'bg-white' : '',
          // singleLineShortText ? "flex flex-row" : "",
        ),
      ]}
    >
      <Animated.View style={tailwind.style('flex flex-row')}>
        <Animated.View style={tailwind.style('w-[3px] bg-gray-300 h-auto rounded-[4px]')} />
        <Animated.View style={tailwind.style('pl-2.5')}>
          <Animated.Text
            style={tailwind.style(
              'text-cxs font-inter-420-20 leading-[14.95px] tracking-[0.32px] text-blackA-A11',
            )}
          >
            Replying to {replyMessageItem?.sender?.name}
          </Animated.Text>
          {hasAttachments ? (
            <Animated.View style={tailwind.style('py-[3px] flex flex-row items-center')}>
              {renderAttachmentSection()}
              <Animated.Text
                style={tailwind.style(
                  'text-[14px] font-inter-normal-20 leading-[19.6px] tracking-[0.16px] text-gray-950 capitalize pl-1.5',
                )}
              >
                {replyMessageItem?.attachments[0].fileType}
              </Animated.Text>
            </Animated.View>
          ) : null}

          {replyMessageItem?.content ? (
            isMarkdown(replyMessageItem?.content) ? (
              <MarkdownDisplay
                // style={tailwind.style(
                //   "text-[14px] font-inter-normal-20 leading-[19.6px] tracking-[0.16px] text-gray-950",
                // )}
                messageContent={replyMessageItem?.content?.split('\n')?.[0]}
              />
            ) : (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-[14px] font-inter-normal-20 leading-[19.6px] tracking-[0.16px] text-gray-950 capitalize',
                )}
              >
                {replyMessageItem?.content}
              </Animated.Text>
            )
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
