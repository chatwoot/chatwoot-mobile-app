import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
// import FileViewer from 'react-native-file-viewer';
import Animated from 'react-native-reanimated';
// import RNFetchBlob from 'rn-fetch-blob';

let FileViewer: any = null;
try {
  FileViewer = require('react-native-file-viewer').default;
} catch (error) {
  console.warn('react-native-file-viewer not available');
  FileViewer = {
    open: () => Promise.reject(new Error('FileViewer not available')),
  };
}

let RNFetchBlob: any = null;
try {
  RNFetchBlob = require('rn-fetch-blob').default;
} catch (error) {
  console.warn('rn-fetch-blob not available');
  RNFetchBlob = {
    fs: {
      dirs: { DocumentDir: 'mock_document_dir' },
      exists: () => Promise.resolve(false),
    },
    config: () => ({ fetch: () => Promise.resolve() }),
  };
}

import { FileIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { MESSAGE_VARIANTS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';

const generateUniqueFileName = (url: string, originalFileName: string) => {
  const hash = url.split('').reduce((acc, char) => {
    const charCode = char.charCodeAt(0);
    return ((acc << 5) - acc + charCode) | 0;
  }, 0);
  const uniqueHash = Math.abs(hash).toString(36);
  const fileExtension = originalFileName.includes('.')
    ? originalFileName.substring(originalFileName.lastIndexOf('.'))
    : '';
  const baseFileName = originalFileName.includes('.')
    ? originalFileName.substring(0, originalFileName.lastIndexOf('.'))
    : originalFileName;
  return `${baseFileName}_${uniqueHash}${fileExtension}`;
};

type FilePreviewProps = Pick<FileBubbleProps, 'fileSrc'> & {
  isComposed?: boolean;
  variant: string;
};

export const FileBubblePreview = (props: FilePreviewProps) => {
  const { fileSrc, isComposed = false, variant } = props;
  const { colors, isDark } = useTheme();
  const dirs = RNFetchBlob.fs.dirs;

  const [fileDownload, setFileDownload] = useState(false);
  const fileName = fileSrc.split('/')[fileSrc.split('/').length - 1];
  const uniqueFileName = generateUniqueFileName(fileSrc, fileName);
  const localFilePath = dirs.DocumentDir + `/${uniqueFileName}`;

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
  const isUser = variant === MESSAGE_VARIANTS.USER;
  const iconColor = isUser || isDark ? 'white' : 'blue-800';
  const iconFill = isUser || isDark ? tailwind.color('bg-white') : tailwind.color('text-blue-800');
  const textColor = isUser ? 'text-white' : isDark ? 'text-white' : 'text-gray-700';
  const borderColor = isUser ? 'border-white' : isDark ? 'border-white' : 'border-blue-800';

  return (
    <React.Fragment>
      {fileDownload ? (
        <Animated.View style={tailwind.style('pr-1.5')}>
          <Spinner
            size={20}
            stroke={tailwind.color(isUser || isDark ? 'text-white' : 'bg-blue-800')}
          />
        </Animated.View>
      ) : (
        <Animated.View style={tailwind.style('pr-1.5')}>
          <Icon
            size={24}
            icon={
              <FileIcon
                fill={iconFill}
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
                textColor,
              ),
              style.androidTextOnlyStyle,
              isDark && variant === MESSAGE_VARIANTS.AGENT && { color: colors.text },
            ]}>
            {fileName}
          </Animated.Text>
          <Animated.View
            style={[
              tailwind.style(
                'border-b-[1px] absolute left-0 right-0 ios:bottom-[1px] android:bottom-0',
                borderColor,
              ),
              isDark && variant === MESSAGE_VARIANTS.AGENT && { borderColor: colors.text },
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
