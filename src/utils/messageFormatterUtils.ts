import markdownToTxt from '@chatwoot/markdown-to-txt';

export const getPlainText = (message: string) => {
  try {
    const lastMessageContent = message ? markdownToTxt(message) : '';
    return lastMessageContent;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return message;
  }
};
