export function getUserInitial({ userName }) {
  const userNameWithoutEmoji = removeEmoji(userName);
  const parts = userNameWithoutEmoji ? userNameWithoutEmoji.split(/[ -]/) : [];
  let initials = '';
  for (let i = 0; i < parts.length; i += 1) {
    initials += parts[i].charAt(0);
  }
  if (initials.length > 2 && initials.search(/[A-Z]/) !== -1) {
    initials = initials.replace(/[a-z]+/g, '');
  }
  initials = initials.substr(0, 2).toUpperCase();
  return initials;
}

export const addOrRemoveItemFromArray = (array, key) => {
  const index = array.indexOf(key);
  if (index === -1) {
    array.push(key);
  } else {
    array.splice(index, 1);
  }
  return array;
};

export const getCustomerDetails = ({ conversationMetaDetails, conversationDetails }) => {
  const customer = {
    name: null,
    thumbnail: null,
  };

  if (conversationMetaDetails) {
    const {
      sender: { name, thumbnail },
      channel,
    } = conversationMetaDetails;
    customer.name = name;
    customer.thumbnail = thumbnail;
    customer.channel = channel;
  } else if (conversationDetails) {
    const {
      sender: { name, thumbnail },
      channel,
    } = conversationDetails.meta;
    customer.name = name;
    customer.thumbnail = thumbnail;
    customer.channel = channel;
  }
  return customer;
};

export const isEmptyObject = obj => {
  return !obj || Object.keys(obj).length === 0;
};

export const getTextSubstringWithEllipsis = (text, maxLength) => {
  return text && text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const removeEmoji = text => {
  if (text) {
    return text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        '',
      )
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
};
