import { Asset } from 'react-native-image-picker';
import camelcaseKeys from 'camelcase-keys';

import { Message, MessageContentAttributes } from '../types';

export const constructAudioMessage = (audioFile: string): Message => {
  // @ts-ignore
  const currentTime = parseInt(new Date() / 1000, 10);
  let newAudioMessageObject = camelcaseKeys(
    {
      id: new Date().getTime(),
      content: null,
      inbox_id: 496,
      conversation_id: 29,
      message_type: 1,
      content_type: 'text',
      status: 'sent',
      content_attributes: null,
      created_at: currentTime,
      private: false,
      source_id: null,
      sender: {
        id: 138,
        name: 'Sandeep Prabhakaran',
        available_name: 'Sandeep Prabhakaran',
        avatar_url:
          'https://staging.chatwoot.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBc3RZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--cdbb48b15e48b9aff5b6ba4f5cb54f20bb0d53d0/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2hOeVpYTnBlbVZmZEc5ZlptbHNiRnNIYVFINk1BPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--ce8d9b19491f8636c1337c68f260c671ad75441d/01695e598f5491ba8c754bc5de7e1397.jpeg',
        type: 'user',
        availability_status: 'offline',
        thumbnail:
          'https://staging.chatwoot.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBc3RZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--cdbb48b15e48b9aff5b6ba4f5cb54f20bb0d53d0/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2hOeVpYTnBlbVZmZEc5ZlptbHNiRnNIYVFINk1BPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--ce8d9b19491f8636c1337c68f260c671ad75441d/01695e598f5491ba8c754bc5de7e1397.jpeg',
      },
      attachments: [
        {
          id: 718,
          message_id: 59391,
          file_type: 'audio',
          account_id: 51,
          extension: null,
          data_url: audioFile,
          thumb_url:
            'https://staging.chatwoot.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdDJIIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--3d62ec65fab33b7eaa13170fa7023be813dccc70/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9UY21WemFYcGxYM1J2WDJacGJHeGJCMmtCK2pBPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--31a6ed995cc4ac2dd2fa023068ee23b23efa1efb/Chatwoot.pdf',
          file_size: 3028,
        },
      ],
    },
    { deep: true },
  );
  return newAudioMessageObject as unknown as Message;
};

// Helper function to generate a unique ID
function generateUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to map the "type" property to "image", "video", etc.
function getFileType(type: string) {
  if (type.startsWith('image/')) {
    return 'image';
  } else if (type.startsWith('video/')) {
    return 'video';
  } else if (type.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'file';
  }
}

// Helper function to extract the file extension from the "fileName"
function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return fileName.substring(lastDotIndex + 1);
  }
  return null; // No extension found
}

export const constructTextMessage = (
  messageText: string,
  isPrivate: boolean,
  attachments: Asset[],
  contentAttributes: MessageContentAttributes | null,
): Message => {
  // @ts-ignore
  const currentTime = parseInt(new Date() / 1000, 10);

  let newAudioMessageObject = camelcaseKeys(
    {
      id: new Date().getTime(),
      content: messageText,
      inbox_id: 496,
      conversation_id: 29,
      message_type: 1,
      content_type: 'text',
      status: 'sent',
      content_attributes: contentAttributes,
      created_at: currentTime,
      private: isPrivate,
      source_id: null,
      sender: {
        id: 138,
        name: 'Sandeep Prabhakaran',
        available_name: 'Sandeep Prabhakaran',
        avatar_url:
          'https://staging.chatwoot.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBc3RZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--cdbb48b15e48b9aff5b6ba4f5cb54f20bb0d53d0/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2hOeVpYTnBlbVZmZEc5ZlptbHNiRnNIYVFINk1BPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--ce8d9b19491f8636c1337c68f260c671ad75441d/01695e598f5491ba8c754bc5de7e1397.jpeg',
        type: 'user',
        availability_status: 'offline',
        thumbnail:
          'https://staging.chatwoot.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBc3RZIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--cdbb48b15e48b9aff5b6ba4f5cb54f20bb0d53d0/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2hOeVpYTnBlbVZmZEc5ZlptbHNiRnNIYVFINk1BPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--ce8d9b19491f8636c1337c68f260c671ad75441d/01695e598f5491ba8c754bc5de7e1397.jpeg',
      },
      attachments: attachments.map(asset => ({
        id: generateUniqueId(),
        messageId: 0,
        fileType: getFileType(asset.type),
        accountId: 0,
        extension: getFileExtension(asset.fileName),
        dataUrl: asset.uri,
        thumbUrl: asset.uri,
      })),
    },
    { deep: true },
  );
  return newAudioMessageObject as unknown as Message;
};
