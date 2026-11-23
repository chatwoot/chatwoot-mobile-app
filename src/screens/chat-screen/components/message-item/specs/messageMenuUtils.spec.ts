import { buildMessageMenuOptions } from '../messageMenuUtils';
import { Message, ImageMetadata, MessageStatus, MessageContentAttributes } from '@/types';
import { Inbox } from '@/types/Inbox';
import { MESSAGE_STATUS, MESSAGE_TYPES } from '@/constants';

describe('messageMenuUtils', () => {
  const mockInbox: Inbox = {
    id: 1,
    name: 'Website Support',
    channelType: 'Channel::WebWidget',
    avatarUrl: '',
    channelId: 1,
    phoneNumber: '',
    medium: '',
  };

  const createBaseMessage = (overrides: Partial<Message> = {}): Message =>
    ({
      id: 101,
      content: '',
      messageType: MESSAGE_TYPES.INCOMING,
      contentType: 'text',
      attachments: [],
      private: false,
      status: MESSAGE_STATUS.SENT,
      createdAt: 1700000000,
      conversationId: 1,
      sender: {
        id: 1,
        name: 'John Doe',
        avatarUrl: '',
        type: 'contact',
      },
      ...overrides,
    }) as unknown as Message;

  const createImageAttachment = (overrides: Partial<ImageMetadata> = {}): ImageMetadata => ({
    id: 1,
    messageId: 101,
    fileType: 'image',
    accountId: 1,
    extension: 'png',
    dataUrl: 'https://chatwoot.com/attachments/photo.png',
    thumbUrl: 'https://chatwoot.com/attachments/photo_thumb.png',
    fallbackTitle: 'photo.png',
    coordinatesLat: 0,
    coordinatesLong: 0,
    ...overrides,
  });

  it('returns empty array when message is an activity message', () => {
    const message = createBaseMessage({
      messageType: MESSAGE_TYPES.ACTIVITY,
      content: 'Conversation was marked resolved',
    });

    const options = buildMessageMenuOptions({ message, inbox: mockInbox });
    expect(options).toEqual([]);
  });

  it('returns empty array when message is marked as deleted', () => {
    const message = createBaseMessage({
      content: 'This message was deleted',
      contentAttributes: { deleted: true } as unknown as MessageContentAttributes,
    });

    const options = buildMessageMenuOptions({ message, inbox: mockInbox });
    expect(options).toEqual([]);
  });

  it('builds standard menu options for a text-only message', () => {
    const onCopyText = jest.fn();
    const onTranslate = jest.fn();
    const onReply = jest.fn();
    const onDelete = jest.fn();

    const message = createBaseMessage({
      content: 'Hello, need help with my account',
    });

    const options = buildMessageMenuOptions({
      message,
      inbox: mockInbox,
      targetLanguage: 'en',
      onCopyText,
      onTranslate,
      onReply,
      onDelete,
    });

    const titles = options.map(o => o.title);
    expect(titles).toContain('Copy');
    expect(titles).toContain('Translate');
    expect(titles).toContain('Reply');
    expect(titles).toContain('Delete message');

    // Trigger callbacks
    const copyOption = options.find(o => o.title === 'Copy');
    copyOption?.handleOnPressMenuOption();
    expect(onCopyText).toHaveBeenCalledWith('Hello, need help with my account');

    const translateOption = options.find(o => o.title === 'Translate');
    translateOption?.handleOnPressMenuOption();
    expect(onTranslate).toHaveBeenCalledWith(101);

    const replyOption = options.find(o => o.title === 'Reply');
    replyOption?.handleOnPressMenuOption();
    expect(onReply).toHaveBeenCalledWith(message);

    const deleteOption = options.find(o => o.title === 'Delete message');
    expect(deleteOption?.destructive).toBe(true);
    deleteOption?.handleOnPressMenuOption();
    expect(onDelete).toHaveBeenCalledWith(101);
  });

  it('omits translate option if translation already exists for target language', () => {
    const message = createBaseMessage({
      content: 'Bonjour',
      contentAttributes: {
        translations: { en: 'Hello' },
      } as unknown as MessageContentAttributes,
    });

    const options = buildMessageMenuOptions({
      message,
      inbox: mockInbox,
      targetLanguage: 'en',
    });

    const titles = options.map(o => o.title);
    expect(titles).toContain('Copy');
    expect(titles).not.toContain('Translate');
  });

  it('includes share image option for single image attachment without text', () => {
    const onShareMedia = jest.fn();
    const message = createBaseMessage({
      content: '',
      attachments: [createImageAttachment()],
    });

    const options = buildMessageMenuOptions({
      message,
      inbox: mockInbox,
      onShareMedia,
    });

    const titles = options.map(o => o.title);
    expect(titles).toContain('Share image');
    expect(titles).not.toContain('Copy');
    expect(titles).not.toContain('Translate');
    expect(titles).toContain('Reply');
    expect(titles).toContain('Delete message');

    const shareOption = options.find(o => o.title === 'Share image');
    expect(shareOption?.destructive).toBe(false);
    shareOption?.handleOnPressMenuOption();
    expect(onShareMedia).toHaveBeenCalledWith('https://chatwoot.com/attachments/photo.png');
  });

  it('handles video and file attachments appropriately', () => {
    const onShareMedia = jest.fn();
    const videoMessage = createBaseMessage({
      attachments: [
        createImageAttachment({
          fileType: 'video',
          dataUrl: 'https://chatwoot.com/attachments/video.mp4',
        }),
      ],
    });

    const videoOptions = buildMessageMenuOptions({
      message: videoMessage,
      inbox: mockInbox,
      onShareMedia,
    });
    expect(videoOptions.map(o => o.title)).toContain('Share video');

    const fileMessage = createBaseMessage({
      attachments: [
        createImageAttachment({
          fileType: 'file',
          dataUrl: 'https://chatwoot.com/attachments/doc.pdf',
        }),
      ],
    });

    const fileOptions = buildMessageMenuOptions({
      message: fileMessage,
      inbox: mockInbox,
      onShareMedia,
    });
    expect(fileOptions.map(o => o.title)).toContain('Share file');
  });

  it('indexes multiple attachments in menu option titles', () => {
    const onShareMedia = jest.fn();
    const message = createBaseMessage({
      attachments: [
        createImageAttachment({ id: 1, dataUrl: 'https://chatwoot.com/img1.png' }),
        createImageAttachment({ id: 2, dataUrl: 'https://chatwoot.com/img2.png' }),
      ],
    });

    const options = buildMessageMenuOptions({
      message,
      inbox: mockInbox,
      onShareMedia,
    });

    const titles = options.map(o => o.title);
    expect(titles).toContain('Share image (1)');
    expect(titles).toContain('Share image (2)');

    const secondOption = options.find(o => o.title === 'Share image (2)');
    secondOption?.handleOnPressMenuOption();
    expect(onShareMedia).toHaveBeenCalledWith('https://chatwoot.com/img2.png');
  });

  it('omits share option when attachment dataUrl is missing or empty', () => {
    const message = createBaseMessage({
      attachments: [createImageAttachment({ dataUrl: '' })],
    });

    const options = buildMessageMenuOptions({ message, inbox: mockInbox });
    const titles = options.map(o => o.title);
    expect(titles).not.toContain('Share image');
  });

  it('includes both copy, translate, and share when message has text and attachments', () => {
    const message = createBaseMessage({
      content: 'Here is the screenshot requested',
      attachments: [createImageAttachment()],
    });

    const options = buildMessageMenuOptions({ message, inbox: mockInbox });
    const titles = options.map(o => o.title);
    expect(titles).toContain('Copy');
    expect(titles).toContain('Translate');
    expect(titles).toContain('Share image');
    expect(titles).toContain('Reply');
    expect(titles).toContain('Delete message');
  });

  it('omits reply option for private notes or messages in progress/failed', () => {
    const privateMessage = createBaseMessage({
      content: 'Private note',
      private: true,
    });
    const privateOptions = buildMessageMenuOptions({ message: privateMessage, inbox: mockInbox });
    expect(privateOptions.map(o => o.title)).not.toContain('Reply');

    const failedMessage = createBaseMessage({
      content: 'Failed message',
      status: MESSAGE_STATUS.FAILED as MessageStatus,
    });
    const failedOptions = buildMessageMenuOptions({ message: failedMessage, inbox: mockInbox });
    expect(failedOptions.map(o => o.title)).not.toContain('Reply');
  });
});
