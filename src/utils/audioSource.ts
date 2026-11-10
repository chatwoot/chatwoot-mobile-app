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
  'audio/x-matroska',
  'audio/matroska',
  'audio/x-ms-wma',
  'audio/x-ms-wax',
  'audio/x-pn-realaudio',
  'audio/vnd.rn-realaudio',
  'audio/x-realaudio',
]);

// Types AVFoundation opens natively. Any other audio type is left to ffprobe.
const SUPPORTED_IOS_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mpeg3',
  'audio/x-mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/m4b',
  'audio/x-m4b',
  'audio/mp4a-latm',
  'audio/aac',
  'audio/aacp',
  'audio/x-aac',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave',
  'audio/x-pn-wav',
  'audio/aiff',
  'audio/x-aiff',
  'audio/x-caf',
  'audio/flac',
  'audio/x-flac',
  'audio/amr',
  'audio/3gpp',
  'audio/3gpp2',
  'video/mp4',
]);

const UNSUPPORTED_IOS_EXTENSIONS = new Set([
  'ogg',
  'oga',
  'opus',
  'webm',
  'weba',
  'mka',
  'spx',
  'wma',
  'ra',
  'rm',
  'ram',
]);

// Containers AVFoundation opens natively. Anything else without a content type
// is left to ffprobe rather than assumed playable.
const SUPPORTED_IOS_EXTENSIONS = new Set([
  'mp3',
  'm4a',
  'm4b',
  'mp4',
  'aac',
  'wav',
  'wave',
  'aif',
  'aiff',
  'aifc',
  'caf',
  'flac',
  'amr',
  '3gp',
  '3gpp',
]);

// ffprobe container names AVFoundation opens natively. Any other container
// reported for downloaded bytes is converted.
const SUPPORTED_IOS_CONTAINER_FORMATS = new Set([
  'mp3',
  'mov',
  'mp4',
  'm4a',
  '3gp',
  '3g2',
  'mj2',
  'aac',
  'wav',
  'aiff',
  'caf',
  'flac',
  'amr',
]);

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
  // Generic types (application/octet-stream) and audio types outside the
  // supported set say nothing certain about the container.
  if (contentType && SUPPORTED_IOS_CONTENT_TYPES.has(contentType)) {
    return false;
  }
  if (extension && SUPPORTED_IOS_EXTENSIONS.has(extension)) {
    return false;
  }
  return undefined;
};

/**
 * `format` is ffprobe's container format name, e.g. `ogg` or `matroska,webm`.
 * A container is unsupported unless one of its names is in the native set.
 */
export const isUnsupportedIosContainerFormat = (format?: string | null): boolean => {
  if (!format) {
    return false;
  }
  return !format
    .toLowerCase()
    .split(',')
    .some(name => SUPPORTED_IOS_CONTAINER_FORMATS.has(name.trim()));
};
