import React from 'react';
import { Animated, Text } from 'react-native';

import { tailwind } from '@/theme';
import { Channel, MessageStatus, MessageType } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';

import { MarkdownDisplay } from './MarkdownDisplay';
import { TEXT_MAX_WIDTH } from '@/constants';
import { DeliveryStatus } from './DeliveryStatus';

type BotTextCellProps = {
  text: string;
  timeStamp: number;
  status: MessageStatus;
  isAvatarRendered?: boolean;
  channel?: Channel;
  messageType: MessageType;
  sourceId?: string;
  isPrivate: boolean;
  errorMessage?: string;
};
export const BotTextCell = (props: BotTextCellProps) => {
  const {
    text,
    timeStamp,
    status,
    isAvatarRendered,
    channel,
    messageType,
    sourceId,
    isPrivate,
    errorMessage,
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
  //       // The text width is more than the max width
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
          'relative max-w-[300px] pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden bg-blue-100',
          `max-w-[${TEXT_MAX_WIDTH}px]`,
          // singleLineShortText ? "flex flex-row" : "",
          isAvatarRendered ? 'rounded-br-none' : '',
        ),
      ]}
    >
      {/* <Text
        // onTextLayout={handleTextLayout}
        style={tailwind.style(
          "text-base tracking-[0.32px] leading-[22px] font-inter-normal-20 text-gray-950",
        )}
      >
        {text} 
      </Text> */}
      <MarkdownDisplay isBotText messageContent={text} />

      <Animated.View
        style={tailwind.style(
          'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
          // singleLineShortText ? "pl-1.5" : "",
          // singleLineLongText || isMultiLine ? "justify-end" : "",
          // multiLineShortText ? " absolute bottom-0.5 right-2.5" : "",
        )}
      >
        <Text
          style={tailwind.style('text-xs font-inter-420-20 tracking-[0.32px] pr-1 text-gray-700')}
        >
          {unixTimestampToReadableTime(timeStamp)}
        </Text>
        <DeliveryStatus
          isPrivate={isPrivate}
          status={status}
          messageType={messageType}
          channel={channel}
          sourceId={sourceId || ''}
          errorMessage={errorMessage || ''}
          deliveredColor="text-gray-700"
          sentColor="text-gray-700"
        />
      </Animated.View>
    </Animated.View>
  );
};
