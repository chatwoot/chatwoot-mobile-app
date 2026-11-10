import markdownToTxt from '@chatwoot/markdown-to-txt';
import { expandTabs } from './expandTabs';

export const getPlainText = (message: string) => {
  try {
    const lastMessageContent = message ? markdownToTxt(message) : '';
    return expandTabs(lastMessageContent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return message ? expandTabs(message) : message;
  }
};
