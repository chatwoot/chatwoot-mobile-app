import { ATTACHMENT_TYPES } from '@/constants';
import { ImageMetadata } from '@/types';

// Attachments render grouped by type rather than in payload order: media, then
// audio, then files.
const VISUAL_MEDIA_TYPES = [
  ATTACHMENT_TYPES.IMAGE,
  ATTACHMENT_TYPES.VIDEO,
  ATTACHMENT_TYPES.IG_REEL,
];

// Audio and file bubbles hand the source to a native player or file path, so an
// attachment without one cannot render. Media is filtered where it is rendered,
// since an expired story shows a placeholder that needs no source. Locations carry
// coordinates instead of a source.

export const groupAttachmentsByType = (attachments: ImageMetadata[]) => {
  const ofType = (...types: string[]) =>
    attachments.filter(attachment => types.includes(attachment.fileType));

  return {
    media: ofType(...VISUAL_MEDIA_TYPES).sort(
      (a, b) => VISUAL_MEDIA_TYPES.indexOf(a.fileType) - VISUAL_MEDIA_TYPES.indexOf(b.fileType),
    ),
    recordings: ofType(ATTACHMENT_TYPES.AUDIO).filter(({ dataUrl }) => dataUrl),
    files: ofType(ATTACHMENT_TYPES.FILE).filter(({ dataUrl }) => dataUrl),
    locations: ofType(ATTACHMENT_TYPES.LOCATION),
  };
};
