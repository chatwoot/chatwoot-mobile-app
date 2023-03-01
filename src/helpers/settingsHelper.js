export const checkValidUrl = ({ url }) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

export const extractDomain = ({ url }) => {
  const isValidUrl = checkValidUrl({ url });

  if (!isValidUrl) {
    return url;
  }
  const domain = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (
    domain != null &&
    domain.length > 2 &&
    typeof domain[2] === 'string' &&
    domain[2].length > 0
  ) {
    return domain[2];
  }
  return url;
};
