const TAB_STOP = 4;

// iOS text layout hangs the main thread on a tab inside Arabic-script text, so
// each tab becomes spaces up to the next tab stop, the column markdown assigns it.
export const expandTabs = (text: string) => {
  if (typeof text !== 'string' || !text.includes('\t')) {
    return text;
  }

  return text.replace(/[^\r\n]+/g, line => {
    let expanded = '';
    for (const char of line) {
      expanded += char === '\t' ? ' '.repeat(TAB_STOP - (expanded.length % TAB_STOP)) : char;
    }
    return expanded;
  });
};
