import { expandTabs } from './expandTabs';

export const findFileSize = (bytes: number) => {
  if (bytes === 0) {
    return 0;
  }
  return bytes / (1024 * 1024);
};

export const getDisplayFileName = (fileName: string) => {
  try {
    return expandTabs(decodeURIComponent(fileName));
  } catch {
    return expandTabs(fileName);
  }
};
