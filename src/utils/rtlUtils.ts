// Regular expression covering RTL scripts:
// - Arabic (\u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF)
// - Hebrew (\u0590-\u05FF, \uFB1D-\uFB4F)
// - Syriac (\u0700-\u074F)
// - Thaana (\u0780-\u07BF)
export const RTL_CHAR_REGEX = /[\u0591-\u08FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

/**
 * Returns true if text contains RTL characters (such as Arabic or Hebrew).
 */
export const isRTLText = (text: string | null | undefined): boolean => {
  if (!text) {
    return false;
  }
  return RTL_CHAR_REGEX.test(text);
};
