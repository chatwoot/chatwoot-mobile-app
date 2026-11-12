import { useTailwind } from '@/theme/useTailwind';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import Animated from 'react-native-reanimated';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { FileIcon } from '@/svg-icons';
import { Icon } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { MESSAGE_VARIANTS } from '@/constants';
import { errorMessage } from '@/utils/errorUtils';
import i18n from '@/i18n';
import { useCloudflareMedia } from '@/hooks/useCloudflareMedia';

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
  fileSize?: number;
  isComposed?: boolean;
  variant: string;
};

export const FileBubblePreview = (props: FilePreviewProps) => {
  const tailwind = useTailwind();
  const { fileSrc, fileSize, isComposed = false, variant } = props;
  const media = useCloudflareMedia(fileSrc);
  const dirs = ReactNativeBlobUtil.fs.dirs;

  const [fileDownload, setFileDownload] = useState(false);
  const [fileFailed, setFileFailed] = useState(false);
  const fileName = fileSrc.split('/')[fileSrc.split('/').length - 1];
  const uniqueFileName = generateUniqueFileName(media.uri ?? fileSrc, fileName);
  const localFilePath = dirs.DocumentDir + `/${uniqueFileName}`;

  const previewFile = () => {
    if (media.loading || media.failed || fileFailed || fileDownload || !media.uri) return;
    try {
      FileViewer.open(localFilePath).catch(e =>
        Alert.alert(i18n.t('CONVERSATION.FILE_PREVIEW_ERROR'), errorMessage(e)),
      );
    } catch (e) {
      Alert.alert(i18n.t('CONVERSATION.FILE_PREVIEW_ERROR'), errorMessage(e));
    }
  };

  useEffect(() => {
    if (!media.uri) return;
    const resolvedUri = media.uri;
    let active = true;
    const { fs } = ReactNativeBlobUtil;

    const isCachedFileComplete = async () => {
      if (!(await fs.exists(localFilePath))) {
        return false;
      }
      if (!fileSize) {
        return true;
      }
      // Android reports stat size as a string.
      const { size } = await fs.stat(localFilePath);
      return Number(size) === fileSize;
    };

    const asyncFileDownload = async () => {
      try {
        setFileFailed(false);
        setFileDownload(true);
        // Protected sources are already safely downloaded. Copy the freshly
        // resolved file instead of reusing a preview from another token.
        if (resolvedUri.startsWith('file://')) {
          if (await fs.exists(localFilePath)) await fs.unlink(localFilePath);
          await fs.cp(resolvedUri.slice('file://'.length), localFilePath);
          return;
        }
        if (await isCachedFileComplete()) return;
        const response = await ReactNativeBlobUtil.config({
          overwrite: true,
          path: localFilePath,
          fileCache: true,
        }).fetch('GET', resolvedUri);
        if (response.info().status < 200 || response.info().status >= 300) {
          throw new Error(i18n.t('CONVERSATION.FILE_LOAD_ERROR'));
        }
      } catch {
        await fs.unlink(localFilePath).catch(() => {});
        if (active) {
          setFileFailed(true);
          Alert.alert(i18n.t('CONVERSATION.FILE_LOAD_ERROR'));
        }
      } finally {
        if (active) setFileDownload(false);
      }
    };
    asyncFileDownload();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.uri]);
  return (
    <React.Fragment>
      {fileDownload || media.loading ? (
        <Animated.View style={tailwind.style('pr-1.5')}>
          <Spinner
            size={20}
            stroke={
              variant === MESSAGE_VARIANTS.USER
                ? tailwind.color('text-white')
                : tailwind.color('bg-blue-800')
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
                    ? tailwind.color('text-white')
                    : tailwind.color('text-blue-800')
                }
              />
            }
          />
        </Animated.View>
      )}
      <Pressable
        disabled={fileDownload || media.loading || media.failed || fileFailed || !media.uri}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        onPress={previewFile}>
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
                variant === MESSAGE_VARIANTS.USER ? 'text-white' : 'text-gray-700',
              ),
              style.androidTextOnlyStyle,
            ]}>
            {media.failed || fileFailed ? i18n.t('CONVERSATION.FILE_LOAD_ERROR') : fileName}
          </Animated.Text>
          <Animated.View
            style={[
              tailwind.style(
                'border-b-[1px] absolute left-0 right-0 ios:bottom-[1px] android:bottom-0',
                variant === MESSAGE_VARIANTS.USER
                  ? 'border-white'
                  : variant === MESSAGE_VARIANTS.AGENT
                    ? 'border-blue-800'
                    : 'border-gray-700',
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
