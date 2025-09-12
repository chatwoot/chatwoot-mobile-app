export const findFileSize = (bytes: number) => {
  if (bytes === 0) {
    return 0;
  }
  return bytes / (1024 * 1024);
};
