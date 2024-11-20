export const isMarkdown = (text: string) => {
  // Regular expressions for common Markdown patterns
  const markdownPatterns = [
    /\*\*.*?\*\*/, // Bold (double asterisks)
    /__.*?__/, // Bold (double underscores)
    /\*.*?\*/, // Italic (asterisks)
    /_.*?_/, // Italic (underscores)
    /\[.*?\]\(.*?\)/, // Links ([text](url))
    /`.*?`/, // Inline code (backticks)
    // Add more Markdown patterns as needed
  ];

  // Check if the text contains any Markdown pattern
  return markdownPatterns.some(pattern => pattern.test(text));
};
