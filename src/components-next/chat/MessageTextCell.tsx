import React from 'react';
import { Animated, Text } from 'react-native';

import { tailwind } from '@/theme';
import { Channel, MessageStatus, MessageType } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';

import { MarkdownDisplay } from './markdown';
import { TEXT_MAX_WIDTH } from '@/constants';
import { DeliveryStatus } from './message-components/DeliveryStatus';

type MessageTextCellProps = {
  text: string;
  timeStamp: number;
  isIncoming: boolean;
  isOutgoing: boolean;
  isActivity: boolean;
  status: MessageStatus;
  isAvatarRendered: boolean;
  channel?: Channel;
  messageType: MessageType;
  sourceId?: string;
  isPrivate: boolean;
};

export const MessageTextCell = (props: MessageTextCellProps) => {
  const {
    text,
    timeStamp,
    isIncoming,
    isOutgoing,
    status,
    isAvatarRendered,
    channel,
    messageType,
    sourceId,
    isPrivate,
  } = props;

  // const [singleLineLongText, setSingleLineLongText] = useState(false);
  // const [singleLineShortText, setSingleLineShortText] = useState(false);
  // const [isMultiLine, setIsMultiLine] = useState(false);
  // const [multiLineShortText, setMultiLineShortText] = useState(false);

  // const handleTextLayout = (
  //   event: NativeSyntheticEvent<TextLayoutEventData>,
  // ) => {
  //   const textLines = event.nativeEvent.lines;
  //   if (textLines.length === 1) {
  //     // The Text is Single Line
  //     if (textLines[textLines.length - 1].width < (2 * TEXT_MAX_WIDTH) / 3) {
  //       // The Text width is less than half of max width so rendering the
  //       // Timestamp inline
  //       setSingleLineShortText(true);
  //     } else {
  //       // The text width is more than the max widthd
  //       setSingleLineLongText(true);
  //     }
  //   } else {
  //     // There are multiple lines for the Text
  //     setIsMultiLine(true);
  //     if (textLines[textLines.length - 1].width < (2 * TEXT_MAX_WIDTH) / 3) {
  //       // There last line is not full width meaning we can move the
  //       //   time stamp indicator
  //       setMultiLineShortText(true);
  //     } else {
  //     }
  //   }
  // };

  return (
    <Animated.View
      style={[
        tailwind.style(
          'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
          `max-w-[${TEXT_MAX_WIDTH}px]`,
          isIncoming ? 'bg-blue-700' : '',
          isOutgoing ? 'bg-gray-100' : '',
          isAvatarRendered
            ? isOutgoing
              ? 'rounded-br-none'
              : isIncoming
                ? 'rounded-bl-none'
                : ''
            : '',
        ),
      ]}>
      <MarkdownDisplay {...{ isIncoming, isOutgoing }} messageContent={text} />
      {/* <Text
        // onTextLayout={handleTextLayout}
        style={tailwind.style(
          isIncoming || isOutgoing
            ? "text-base tracking-[0.32px] leading-[22px] font-inter-normal-24"
            : "",
          isIncoming ? "text-white" : "",
          isOutgoing ? "text-gray-950" : "",
        )} 
      >
        {text}
      </Text> */}
      <Animated.View
        style={tailwind.style(
          'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
          // singleLineShortText ? "pl-1.5" : "",
          // singleLineLongText || isMultiLine ? "justify-end" : "",
          // multiLineShortText ? " absolute bottom-0.5 right-2.5" : "",
        )}>
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
            isIncoming ? 'text-whiteA-A11' : '',
            isOutgoing ? 'text-gray-700' : '',
          )}>
          {unixTimestampToReadableTime(timeStamp)}
        </Text>
        <DeliveryStatus
          isPrivate={isPrivate}
          status={status}
          messageType={messageType}
          channel={channel}
          sourceId={sourceId}
          deliveredColor="text-gray-700"
          sentColor="text-gray-700"
        />
        {/* {isOutgoing ? (
          <Icon
            icon={
              <DoubleCheckIcon
                renderSecondTick={status !== 'sent'}
                stroke={
                  status === 'read'
                    ? tailwind.color('text-blue-800')
                    : tailwind.color('text-gray-700')
                }
              />
            }
            size={14}
          />
        ) : null} */}
      </Animated.View>
    </Animated.View>
  );
};
