export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const isTypeImage = (type) => {
  return type.includes('image');
};

export const findFileSize = (bytes) => {
  if (bytes === 0) {
    return 0;
  }
  const sizeInMB = (bytes / (1024 * 1024)).toFixed(2);
  return sizeInMB;
};
