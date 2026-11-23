import { Platform, Share, Alert } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import {
  generateUniqueFileName,
  getLocalFilePath,
  downloadAndShareMedia,
} from '../mediaShareUtils';

jest.mock('react-native-blob-util', () => {
  const fetchMock = jest.fn().mockResolvedValue({ path: () => '/mock/dir/file.png' });
  const configMock = jest.fn().mockReturnValue({ fetch: fetchMock });
  return {
    fs: {
      dirs: {
        DocumentDir: '/mock/dir',
        CacheDir: '/mock/cache',
      },
      exists: jest.fn(),
      unlink: jest.fn(),
    },
    config: configMock,
  };
});

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn().mockResolvedValue(undefined),
}));

describe('mediaShareUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('generateUniqueFileName', () => {
    it('creates deterministic unique file name preserving extension', () => {
      const url = 'https://chatwoot.com/attachments/photo.png';
      const name1 = generateUniqueFileName(url, 'custom_photo.png');
      const name2 = generateUniqueFileName(url, 'custom_photo.png');

      expect(name1).toBe(name2);
      expect(name1).toMatch(/^custom_photo_[a-z0-9]+\.png$/);
    });

    it('falls back to URL filename when originalFileName is not provided', () => {
      const url = 'https://chatwoot.com/attachments/avatar.jpg?query=1';
      const name = generateUniqueFileName(url);

      expect(name).toMatch(/^avatar_[a-z0-9]+\.jpg$/);
    });
  });

  describe('getLocalFilePath', () => {
    it('returns path in DocumentDir', () => {
      const url = 'https://chatwoot.com/img.png';
      const path = getLocalFilePath(url, 'img.png');
      expect(path.startsWith('/mock/dir/img_')).toBe(true);
      expect(path.endsWith('.png')).toBe(true);
    });
  });

  describe('downloadAndShareMedia', () => {
    it('does nothing when dataUrl is empty', async () => {
      await downloadAndShareMedia('');
      expect(ReactNativeBlobUtil.fs.exists).not.toHaveBeenCalled();
      expect(Share.share).not.toHaveBeenCalled();
      expect(FileViewer.open).not.toHaveBeenCalled();
    });

    it('downloads file if not cached and shares local file URI on iOS', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'ios';

      try {
        (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(false);

        await downloadAndShareMedia('https://chatwoot.com/sample.png', 'sample.png');

        expect(ReactNativeBlobUtil.config).toHaveBeenCalledWith(
          expect.objectContaining({
            overwrite: true,
            fileCache: true,
          }),
        );
        expect(Share.share).toHaveBeenCalledWith({
          url: expect.stringMatching(/^file:\/\/\/mock\/dir\/sample_/),
        });
      } finally {
        Platform.OS = originalOS;
      }
    });

    it('uses existing file without re-downloading if already cached on iOS', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'ios';

      try {
        (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(true);

        await downloadAndShareMedia('https://chatwoot.com/sample.png', 'sample.png');

        expect(ReactNativeBlobUtil.config).not.toHaveBeenCalled();
        expect(Share.share).toHaveBeenCalledWith({
          url: expect.stringMatching(/^file:\/\/\/mock\/dir\/sample_/),
        });
      } finally {
        Platform.OS = originalOS;
      }
    });

    it('opens file via FileViewer with chooser dialog on Android', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';

      try {
        (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(true);

        await downloadAndShareMedia('https://chatwoot.com/video.mp4', 'video.mp4');

        expect(FileViewer.open).toHaveBeenCalledWith(
          expect.stringMatching(/^\/mock\/dir\/video_/),
          { showOpenWithDialog: true },
        );
        expect(Share.share).not.toHaveBeenCalled();
      } finally {
        Platform.OS = originalOS;
      }
    });

    it('falls back to direct Share.share if local download or viewer throws', async () => {
      const originalOS = Platform.OS;
      Platform.OS = 'android';

      try {
        (ReactNativeBlobUtil.fs.exists as jest.Mock).mockRejectedValue(new Error('FS error'));

        await downloadAndShareMedia('https://chatwoot.com/doc.pdf', 'doc.pdf');

        expect(Share.share).toHaveBeenCalledWith({
          url: 'https://chatwoot.com/doc.pdf',
          message: 'https://chatwoot.com/doc.pdf',
        });
      } finally {
        Platform.OS = originalOS;
      }
    });
  });
});
