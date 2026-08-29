import { ATTACHMENT_TYPES } from '@/constants';
import { ImageMetadata } from '@/types';

// Attachments render grouped by type rather than in payload order: media, then
// audio, then files.
const VISUAL_MEDIA_TYPES = [
  ATTACHMENT_TYPES.IMAGE,
  ATTACHMENT_TYPES.VIDEO,
  ATTACHMENT_TYPES.IG_REEL,
];

// Media, audio and file bubbles hand the source to a native viewer, player or
// file path, so an attachment without one cannot render. Locations carry
// coordinates instead of a source.
const withSource = (attachments: ImageMetadata[]) =>
  attachments.filter(attachment => attachment.dataUrl);

export const groupAttachmentsByType = (attachments: ImageMetadata[]) => {
  const ofType = (...types: string[]) =>
    attachments.filter(attachment => types.includes(attachment.fileType));

  return {
    media: withSource(ofType(...VISUAL_MEDIA_TYPES)).sort(
      (a, b) => VISUAL_MEDIA_TYPES.indexOf(a.fileType) - VISUAL_MEDIA_TYPES.indexOf(b.fileType),
    ),
    recordings: withSource(ofType(ATTACHMENT_TYPES.AUDIO)),
    files: withSource(ofType(ATTACHMENT_TYPES.FILE)),
    locations: ofType(ATTACHMENT_TYPES.LOCATION),
  };
};
