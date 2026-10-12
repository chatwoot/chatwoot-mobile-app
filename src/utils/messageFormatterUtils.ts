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

const TAB_STOP = 4;

// iOS text layout hangs the main thread on a tab inside Arabic-script text, so
// each tab becomes spaces up to the next tab stop, the column markdown assigns it.
export const expandTabs = (text: string) => {
  if (!text.includes('\t')) {
    return text;
  }

  return text
    .split('\n')
    .map(line => {
      let expanded = '';
      for (const char of line) {
        expanded += char === '\t' ? ' '.repeat(TAB_STOP - (expanded.length % TAB_STOP)) : char;
      }
      return expanded;
    })
    .join('\n');
};
