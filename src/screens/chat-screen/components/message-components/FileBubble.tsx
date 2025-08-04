import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import Animated from 'react-native-reanimated';
import RNFetchBlob from 'rn-fetch-blob';

import { FileIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { MESSAGE_VARIANTS } from '@/constants';
type FilePreviewProps = Pick<FileBubbleProps, 'fileSrc'> & {
  isComposed?: boolean;
  variant: string;
};

export const FileBubblePreview = (props: FilePreviewProps) => {
  const { fileSrc, isComposed = false, variant } = props;
  const dirs = RNFetchBlob.fs.dirs;

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
            stroke={
              variant === MESSAGE_VARIANTS.USER
                ? tailwind.color('text-white')
                : tailwind.color('bg-brand-600')
            }
          />
        </Animated.View>
      ) : (
        <Animated.View style={tailwind.style('pr-1.5')}>
          <Icon
            size={24}
            icon={
              <FileIcon
                fill={
                  variant === MESSAGE_VARIANTS.USER
                    ? tailwind.color('bg-white')
                    : tailwind.color('text-brand-600')
                }
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
                variant === MESSAGE_VARIANTS.USER || variant === MESSAGE_VARIANTS.AGENT
                  ? 'text-base tracking-[0.32px] leading-[22px] font-inter-normal-20'
                  : '',
                variant === MESSAGE_VARIANTS.USER
                  ? 'text-white'
                  : variant === MESSAGE_VARIANTS.AGENT
                    ? 'text-gray-700'
                    : '',
              ),
              style.androidTextOnlyStyle,
            ]}>
            {fileName}
          </Animated.Text>
          <Animated.View
            style={[
              tailwind.style(
                'border-b-[1px] absolute left-0 right-0 ios:bottom-[1px] android:bottom-0',
                variant === MESSAGE_VARIANTS.USER ? 'border-white' : '',
                variant === MESSAGE_VARIANTS.AGENT ? 'border-brand-600' : '',
              ),
            ]}
          />
        </Animated.View>
      </Pressable>
    </React.Fragment>
  );
};

type FileBubbleProps = {
  fileSrc: string;
  variant: string;
};

export const FileBubble = (props: FileBubbleProps) => {
  const { fileSrc, variant } = props;

  return <FileBubblePreview fileSrc={fileSrc} variant={variant} />;
};

const style = StyleSheet.create({
  androidTextOnlyStyle: { includeFontPadding: false },
});
