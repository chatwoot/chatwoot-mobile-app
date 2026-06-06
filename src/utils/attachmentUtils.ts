type OggAudioAttachment = {
  audioSrc: string;
  contentType?: string | null;
  extension?: string | null;
};

const OGG_EXTENSIONS = new Set(['ogg', 'oga', 'opus']);

const extensionFromUrl = (url: string) => {
  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split('?')[0].split('#')[0];
    }
  })();

  const fileName = path.split('/').pop() || '';
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  return extension?.toLowerCase() || '';
};

export const isOggAudioAttachment = ({ audioSrc, contentType, extension }: OggAudioAttachment) => {
  const normalizedContentType = contentType?.toLowerCase() || '';
  const normalizedExtension = extension?.replace(/^\./, '').toLowerCase() || '';

  const isOggOrOpusContentType =
    normalizedContentType.includes('ogg') || normalizedContentType.includes('opus');

  return (
    isOggOrOpusContentType ||
    OGG_EXTENSIONS.has(normalizedExtension) ||
    OGG_EXTENSIONS.has(extensionFromUrl(audioSrc))
  );
};
