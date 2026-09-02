export type AudioAttachmentSource = {
  dataUrl: string;
  contentType?: string | null;
  extension?: string | null;
};

// Containers AVFoundation cannot open. Opus/Vorbis inside Ogg or WebM has to be
// re-muxed before iOS can play it; Android's ExoPlayer/MediaPlayer handle both.
const UNSUPPORTED_IOS_CONTENT_TYPES = new Set([
  'audio/ogg',
  'audio/oga',
  'audio/opus',
  'audio/vorbis',
  'audio/x-ogg',
  'application/ogg',
  'audio/webm',
  'video/webm',
]);

const UNSUPPORTED_IOS_EXTENSIONS = new Set(['ogg', 'oga', 'opus', 'webm']);

// First bytes of each container: "OggS", and the EBML header that opens every
// WebM/Matroska file.
const OGG_MAGIC = [0x4f, 0x67, 0x67, 0x53];
const EBML_MAGIC = [0x1a, 0x45, 0xdf, 0xa3];

export const getUrlExtension = (url: string): string | null => {
  const path = url.split(/[?#]/)[0];
  const lastSegment = path.substring(path.lastIndexOf('/') + 1);
  const dot = lastSegment.lastIndexOf('.');
  if (dot <= 0 || dot === lastSegment.length - 1) {
    return null;
  }
  return lastSegment.substring(dot + 1).toLowerCase();
};

const normalizeContentType = (contentType?: string | null) =>
  contentType?.split(';')[0].trim().toLowerCase() || null;

const normalizeExtension = (extension?: string | null) =>
  extension?.replace(/^\./, '').trim().toLowerCase() || null;

/**
 * Decides from attachment metadata whether iOS needs to convert the file before
 * playing it. Returns `undefined` when the metadata says nothing about the
 * container, in which case the downloaded bytes have to be inspected.
 */
export const iosNeedsConversion = (source: AudioAttachmentSource): boolean | undefined => {
  const contentType = normalizeContentType(source.contentType);
  const extension = normalizeExtension(source.extension) ?? getUrlExtension(source.dataUrl);

  if (contentType && UNSUPPORTED_IOS_CONTENT_TYPES.has(contentType)) {
    return true;
  }
  if (extension && UNSUPPORTED_IOS_EXTENSIONS.has(extension)) {
    return true;
  }
  // A recognised audio type that is not in the unsupported set plays natively.
  // Generic types (application/octet-stream) say nothing about the container.
  if (contentType && contentType.startsWith('audio/')) {
    return false;
  }
  if (extension && !contentType) {
    return false;
  }
  return undefined;
};

const startsWith = (bytes: Uint8Array, magic: number[]) =>
  magic.every((byte, index) => bytes[index] === byte);

/** `header` holds at least the first four bytes of the file. */
export const isWebmContainer = (header: Uint8Array): boolean => startsWith(header, EBML_MAGIC);

export const isUnsupportedIosContainer = (header: Uint8Array): boolean =>
  startsWith(header, OGG_MAGIC) || isWebmContainer(header);
