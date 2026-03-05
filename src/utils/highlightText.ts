/**
 * Highlights search terms in text by wrapping matches in a span
 * Returns an array of text segments with highlighted parts marked
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

  // Create regex with word boundaries for better matching
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex to avoid issues with global regex
  regex.lastIndex = 0;

  // Use original text (not trimmed) to preserve spacing and match correctly
  while ((match = regex.exec(text)) !== null) {
    // Add text before match (only if it's not empty)
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText.length > 0) {
        segments.push({
          text: beforeText,
          isHighlight: false,
        });
      }
    }

    // Add highlighted match (only if it's not empty)
    if (match[0].length > 0) {
      segments.push({
        text: match[0],
        isHighlight: true,
      });
    }

    lastIndex = regex.lastIndex;

    // Prevent infinite loop if regex.lastIndex doesn't advance
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }

  // Add remaining text (only if it's not empty)
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText.length > 0) {
      segments.push({
        text: remainingText,
        isHighlight: false,
      });
    }
  }

  // If no matches found, return original text
  if (segments.length === 0) {
    return [{ text, isHighlight: false }];
  }

  return segments;
};
