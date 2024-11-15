import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import RNFetchBlob from 'rn-fetch-blob';

import { CopyIcon, FileIcon, Trash } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Channel, Message, MessageStatus, UnixTimestamp } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar, Icon } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { MenuOption, MessageMenu } from '../message-menu';
import { MESSAGE_TYPES } from '../TextMessageCell';
import { DeliveryStatus } from './DeliveryStatus';

type FilePreviewProps = Pick<FileCellProps, 'fileSrc'> & {
  isIncoming: boolean;
  isOutgoing: boolean;
  isComposed?: boolean;
};

export const FilePreview = (props: FilePreviewProps) => {
  const { fileSrc, isIncoming, isOutgoing, isComposed = false } = props;
  let dirs = RNFetchBlob.fs.dirs;

  const [fileDownload, setFileDownload] = useState(false);
  const fileName = fileSrc.split('/')[fileSrc.split('/').length - 1];
  const localFilePath = dirs.DocumentDir + `/${fileName}`;

  const previewFile = () => {
    try {
      FileViewer.open(localFilePath).catch(e => Alert.alert(e));
    } catch (e) {
      Alert.alert('Not able to preview file' + e);
    }
  };

  useEffect(() => {
    const asyncFileDownload = () => {
      RNFetchBlob.fs.exists(localFilePath).then(res => {
        if (res) {
          setFileDownload(false);
        } else {
          setFileDownload(true);
          RNFetchBlob.config({
            overwrite: true,
            path: localFilePath,
            fileCache: true,
          })
            .fetch('GET', fileSrc)
            .then(_result => {
              setFileDownload(false);
            })
            .catch(() => {
              Alert.alert('File load error');
            });
        }
      });
    };
    asyncFileDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <React.Fragment>
      {fileDownload ? (
        <Animated.View style={tailwind.style('pr-1.5')}>
          <Spinner
            size={20}
            stroke={isIncoming ? tailwind.color('text-white') : tailwind.color('bg-blue-800')}
          />
        </Animated.View>
      ) : (
        <Animated.View style={tailwind.style('pr-1.5')}>
          <Icon
            size={24}
            icon={
              <FileIcon
                fill={isIncoming ? tailwind.color('bg-white') : tailwind.color('text-blue-800')}
              />
            }
          />
        </Animated.View>
      )}
      <Pressable hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }} onPress={previewFile}>
        <Animated.View style={tailwind.style('relative')}>
          <Animated.Text
            numberOfLines={1}
            ellipsizeMode={'middle'}
            style={[
              tailwind.style(
                isComposed ? 'max-w-[248px]' : 'max-w-[170px]',
                isIncoming || isOutgoing
                  ? 'text-base tracking-[0.32px] leading-[22px] font-inter-normal-24'
                  : '',
                isIncoming ? 'text-white' : '',
                isOutgoing ? 'text-blue-800' : '',
              ),
              style.androidTextOnlyStyle,
            ]}>
            {fileName}
          </Animated.Text>
          <Animated.View
            style={[
              tailwind.style(
                'border-b-[1px] absolute left-0 right-0 ios:bottom-[1px] android:bottom-0',
                isIncoming ? 'border-white' : '',
                isOutgoing ? 'border-blue-800' : '',
              ),
            ]}
          />
        </Animated.View>
      </Pressable>
    </React.Fragment>
  );
};

type FileCellProps = {
  fileSrc: string;
  shouldRenderAvatar: boolean;
  messageType: number;
  sender: Message['sender'];
  timeStamp: UnixTimestamp;
  status: MessageStatus;
  handleQuoteReply: () => void;
  channel?: Channel;
  isPrivate: boolean;
  sourceId?: string | null;
};

export const FileCell = (props: FileCellProps) => {
  const {
    fileSrc,
    sender,
    shouldRenderAvatar,
    messageType,
    timeStamp,
    status,
    handleQuoteReply,
    isPrivate,
    channel,
    sourceId,
  } = props;

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;

  const commonOptions = useMemo(
    () =>
      [
        {
          title: 'Reply',
          handleOnPressMenuOption: handleQuoteReply,
        },
        {
          title: 'Copy link to message',
          icon: <CopyIcon />,
          handleOnPressMenuOption: () => Alert.alert('Copy link to message'),
        },
        // {
        //   title: "Download",
        //   handleOnPressMenuOption: () => Alert.alert("Download"),
        // },
      ] as MenuOption[],
    [handleQuoteReply],
  );

  const outgoingMessageOptions = useMemo(
    () =>
      [
        ...commonOptions,
        {
          title: 'Delete message',
          icon: <Trash />,
          handleOnPressMenuOption: () => Alert.alert('Delete message'),
          destructive: true,
        },
      ] as MenuOption[],
    [commonOptions],
  );

  return (
    <Animated.View
      entering={FadeIn.duration(300).easing(Easing.ease)}
      style={tailwind.style(
        'w-full my-[1px]',
        isIncoming ? 'items-start ml-3' : '',
        isOutgoing ? 'items-end pr-3' : '',
        !shouldRenderAvatar && isIncoming ? 'ml-10' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-10' : '',
        shouldRenderAvatar ? 'pb-2' : '',
      )}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender?.thumbnail && sender?.name && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
        <MessageMenu menuOptions={isIncoming ? commonOptions : outgoingMessageOptions}>
          <Animated.View
            style={[
              tailwind.style(
                'flex flex-row items-center relative max-w-[300px] pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                isIncoming ? 'bg-blue-700' : '',
                isOutgoing ? 'bg-gray-100' : '',
                shouldRenderAvatar
                  ? isOutgoing
                    ? 'rounded-br-none'
                    : isIncoming
                      ? 'rounded-bl-none'
                      : ''
                  : '',
              ),
            ]}>
            <FilePreview {...{ fileSrc, isIncoming, isOutgoing }} />
            <Animated.View
              style={tailwind.style('h-[21px] pt-[5px] pb-0.5 flex flex-row items-center pl-1.5')}>
              <Animated.Text
                style={tailwind.style(
                  'text-xs font-inter-420-20 tracking-[0.32px] leading-[14px] pr-1',
                  isIncoming ? 'text-whiteA-A11' : '',
                  isOutgoing ? 'text-gray-700' : '',
                )}>
                {unixTimestampToReadableTime(timeStamp)}
              </Animated.Text>
              <DeliveryStatus
                isPrivate={isPrivate}
                status={status}
                messageType={messageType}
                channel={channel}
                sourceId={sourceId}
                deliveredColor="text-gray-700"
                sentColor="text-gray-700"
              />
            </Animated.View>
          </Animated.View>
        </MessageMenu>
        {sender?.thumbnail && sender?.name && isOutgoing && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};

const style = StyleSheet.create({
  androidTextOnlyStyle: { includeFontPadding: false },
});
