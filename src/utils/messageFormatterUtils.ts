// TODO: Please change this with better implementation, https://github.com/chatwoot/chatwoot/blob/develop/app/javascript/shared/composables/useMessageFormatter.js#L33

export const getPlainText = (message: string) => {
  try {
    // eslint-disable-next-line no-useless-escape
    const regex = /\[@([^\]]+)\]\(mention:\/\/user\/\d+\/([^\)]+)\)/g;
    const matches = message.matchAll(regex);
    let result = message;
    for (const match of matches) {
      const [fullMatch, username] = match;
      const replacement = `@${decodeURIComponent(username)}`;
      result = result.replace(fullMatch, replacement);
    }
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return message;
  }
};
