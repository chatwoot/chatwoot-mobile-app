import { Alert, Platform, Share } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import i18n from '@/i18n';
import { errorMessage } from './errorUtils';

export const generateUniqueFileName = (url: string, originalFileName?: string): string => {
  const rawFileName = originalFileName || url.split('/').pop()?.split('?')[0] || 'media_attachment';
  const fileExtension = rawFileName.includes('.')
    ? rawFileName.substring(rawFileName.lastIndexOf('.'))
    : '';
  const baseFileName = rawFileName.includes('.')
    ? rawFileName.substring(0, rawFileName.lastIndexOf('.'))
    : rawFileName;

  const hash = url.split('').reduce((acc, char) => {
    const charCode = char.charCodeAt(0);
    return ((acc << 5) - acc + charCode) | 0;
  }, 0);
  const uniqueHash = Math.abs(hash).toString(36);

  return `${baseFileName}_${uniqueHash}${fileExtension}`;
};

export const getLocalFilePath = (url: string, originalFileName?: string): string => {
  const dirs = ReactNativeBlobUtil.fs.dirs;
  const uniqueFileName = generateUniqueFileName(url, originalFileName);
  return `${dirs.DocumentDir}/${uniqueFileName}`;
};

export const downloadAndShareMedia = async (dataUrl: string, fileName?: string): Promise<void> => {
  if (!dataUrl) return;

  try {
    const localFilePath = getLocalFilePath(dataUrl, fileName);
    const { fs } = ReactNativeBlobUtil;

    const fileExists = await fs.exists(localFilePath);
    if (!fileExists) {
      await ReactNativeBlobUtil.config({
        overwrite: true,
        path: localFilePath,
        fileCache: true,
      }).fetch('GET', dataUrl);
    }

    if (Platform.OS === 'android') {
      await FileViewer.open(localFilePath, { showOpenWithDialog: true });
    } else {
      const fileUrl = localFilePath.startsWith('file://')
        ? localFilePath
        : `file://${localFilePath}`;
      await Share.share({ url: fileUrl });
    }
  } catch {
    // If local download or file viewing fails, fallback to sharing the direct URL
    try {
      await Share.share(
        Platform.OS === 'ios' ? { url: dataUrl } : { message: dataUrl, url: dataUrl },
      );
    } catch (fallbackError) {
      Alert.alert(i18n.t('COMMON.ERROR_TITLE'), errorMessage(fallbackError));
    }
  }
};
