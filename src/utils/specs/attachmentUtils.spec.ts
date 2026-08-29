import { ATTACHMENT_TYPES } from '@/constants';
import type { ImageMetadata } from '@/types';
import { groupAttachmentsByType } from '../attachmentUtils';

const attachment = (fileType: string, dataUrl: string | null, id: number) =>
  ({ fileType, dataUrl, id }) as unknown as ImageMetadata;

describe('groupAttachmentsByType', () => {
  it('drops media without a source', () => {
    const withSource = attachment(ATTACHMENT_TYPES.IMAGE, 'https://cdn/1.png', 1);
    const grouped = groupAttachmentsByType([
      withSource,
      attachment(ATTACHMENT_TYPES.IMAGE, null, 2),
    ]);

    expect(grouped.media).toEqual([withSource]);
  });

  it('drops audio and files without a source', () => {
    const grouped = groupAttachmentsByType([
      attachment(ATTACHMENT_TYPES.AUDIO, null, 1),
      attachment(ATTACHMENT_TYPES.FILE, null, 2),
    ]);

    expect(grouped.recordings).toEqual([]);
    expect(grouped.files).toEqual([]);
  });

  it('keeps a location, which carries coordinates instead of a source', () => {
    const location = attachment(ATTACHMENT_TYPES.LOCATION, null, 1);

    expect(groupAttachmentsByType([location]).locations).toEqual([location]);
  });

  it('keeps images ahead of videos', () => {
    const video = attachment(ATTACHMENT_TYPES.VIDEO, 'https://cdn/1.mp4', 1);
    const image = attachment(ATTACHMENT_TYPES.IMAGE, 'https://cdn/2.png', 2);

    expect(groupAttachmentsByType([video, image]).media).toEqual([image, video]);
  });
});
