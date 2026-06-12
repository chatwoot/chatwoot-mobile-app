/**
 * Highlights search terms in text by splitting into segments with matches marked.
 * Returns an array of text segments with highlighted parts indicated.
 */
export interface HighlightSegment {
  text: string;
  isHighlight: boolean;
}

export const highlightText = (text: string, searchTerm: string): HighlightSegment[] => {
  if (!text) {
    return [{ text: '', isHighlight: false }];
  }

  const trimmedSearchTerm = searchTerm?.trim();
  if (!trimmedSearchTerm) {
    return [{ text, isHighlight: false }];
  }

  // Escape special regex characters
  const escapedSearchTerm = trimmedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create regex for case-insensitive matching
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isHighlight: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: match[0],
      isHighlight: true,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isHighlight: false,
    });
  }

  // If no matches found, return original text
  if (segments.length === 0) {
    return [{ text, isHighlight: false }];
  }

  return segments;
};
