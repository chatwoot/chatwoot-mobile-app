import React from 'react';
import { Animated, Text } from 'react-native';

import { LockIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { unixTimestampToReadableTime } from '@/utils';
import { Icon } from '@/components-next/common';

import { MarkdownDisplay } from './MarkdownDisplay';
import { TEXT_MAX_WIDTH } from '@/constants';

type PrivateTextCellProps = {
  text: string;
  timeStamp: number;
};

export const PrivateTextCell = (props: PrivateTextCellProps) => {
  const { text, timeStamp } = props;

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
  //       // time stamp indicator
  //       setMultiLineShortText(true);
  //     } else {
  //     }
  //   }
  // };

  return (
    <Animated.View
      style={[
        tailwind.style(
          'relative max-w-[300px] pl-2 pr-2.5 py-2 rounded-t-2xl rounded-bl-2xl overflow-hidden bg-amber-100',
          `max-w-[${TEXT_MAX_WIDTH}px]`,
          // singleLineShortText ? "flex flex-row" : "",
        ),
      ]}
    >
      <Animated.View style={tailwind.style('flex flex-row')}>
        <Animated.View style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')} />
        <Animated.View style={tailwind.style('pl-2.5')}>
          {/* <Text
            // onTextLayout={handleTextLayout}
            style={tailwind.style(
              "text-base tracking-[0.32px] leading-[22px] font-inter-normal-20 text-gray-950",
            )}
          >
            {text}
          </Text> */}
          <MarkdownDisplay isPrivate messageContent={text} />
        </Animated.View>
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
          // singleLineShortText ? "pl-1.5" : "",
          // singleLineLongText || isMultiLine ? "justify-end" : "",
          // multiLineShortText ? " absolute bottom-0.5 right-2.5" : "",
        )}
      >
        <Icon icon={<LockIcon />} size={12} />
        <Text
          style={tailwind.style('text-xs font-inter-420-20 tracking-[0.32px] pl-1 text-blackA-A10')}
        >
          {unixTimestampToReadableTime(timeStamp)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};
