export const getTextSubstringWithEllipsis = (text, maxLength) => {
  return text && text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
