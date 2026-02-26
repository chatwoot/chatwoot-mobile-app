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
  
  // Create regex for case-insensitive matching
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match;

  // Use original text (not trimmed) to preserve spacing and match correctly
  while ((match = regex.exec(text)) !== null) {
  // Add text before match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
    segments.push({
      text: beforeText,
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

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    segments.push({
      text: remainingText,
      isHighlight: false,
    });
  }

  // If no matches found, return original text
  if (segments.length === 0) {
    return [{ text, isHighlight: false }];
  }

  return segments;
};
