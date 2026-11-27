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

  const localFilePath = getLocalFilePath(dataUrl, fileName);
  const tempFilePath = `${localFilePath}.tmp`;
  const { fs } = ReactNativeBlobUtil;

  try {
    const fileExists = await fs.exists(localFilePath);
    if (!fileExists) {
      try {
        if (await fs.exists(tempFilePath)) {
          await fs.unlink(tempFilePath);
        }
      } catch {
        // Ignore pre-cleanup error
      }

      await ReactNativeBlobUtil.config({
        overwrite: true,
        path: tempFilePath,
      }).fetch('GET', dataUrl);

      await fs.mv(tempFilePath, localFilePath);
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
    // If download or viewing fails, clean up temp file and potentially incomplete destination file
    try {
      if (await fs.exists(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }
    } catch {
      // Ignore cleanup error
    }

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
