/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable  */
import { allowedTags, allowedCssProperties, removeWithContents } from './constants';
const DomParser = require('react-native-html-parser').DOMParser;
function prependIdToSelectorText(selectorText, id) {
  if (!id) return selectorText;
  return selectorText
    .split(',')
    .map(selector => selector.trim())
    .map(selector => {
      const s = selector.replace(/\./g, '.' + id + '_').replace(/#/g, '#' + id + '_');
      if (s.toLowerCase().startsWith('body')) {
        return '#' + id + ' ' + s.substring(4);
      } else {
        return '#' + id + ' ' + s;
      }
    })
    .join(',');
}
function sanitizeCssValue(cssValue, allowedSchemas, rewriteExternalResources) {
  return cssValue
    .trim()
    .replace(/expression\((.*?)\)/g, '')
    .replace(/url\(["']?(.*?)["']?\)/g, (match, url) => {
      if (rewriteExternalResources) {
        return `url("${encodeURI(rewriteExternalResources(decodeURI(url)))}")`;
      } else if (allowedSchemas.includes(url.toLowerCase().split(':')[0])) {
        return match;
      } else {
        return '';
      }
    });
}
function sanitizeCssStyle(style, allowedSchemas, preserveCssPriority, rewriteExternalResources) {
  if (!style) {
    return;
  }
  const properties = [];
  for (let i = 0; i < style.length; i++) {
    const name = style[i];
    properties.push(name);
  }
  for (const name of properties) {
    if (allowedCssProperties.includes(name)) {
      const value = style.getPropertyValue(name);
      style.setProperty(
        name,
        sanitizeCssValue(value, allowedSchemas, rewriteExternalResources),
        preserveCssPriority ? style.getPropertyPriority(name) : undefined,
      );
    } else {
      style.removeProperty(name);
    }
  }
}
function sanitizeCssRule(rule, id, allowedSchemas, preserveCssPriority, rewriteExternalResources) {
  rule.selectorText = prependIdToSelectorText(rule.selectorText, id);
  sanitizeCssStyle(rule.style, allowedSchemas, preserveCssPriority, rewriteExternalResources);
}
const defaultAllowedSchemas = ['http', 'https', 'mailto'];
function sanitizeHtml(
  input,
  {
    dropAllHtmlTags = false,
    rewriteExternalLinks,
    rewriteExternalResources,
    id = 'msg_' +
      String.fromCharCode(
        ...new Array(24).fill(undefined).map(() => ((Math.random() * 25) % 25) + 65),
      ),
    allowedSchemas = defaultAllowedSchemas,
    preserveCssPriority = true,
    noWrapper = false,
  },
) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  if (noWrapper) id = '';
  // const doc = new DOMParser().parseFromString(input, 'text/html');
  const doc = new DomParser().parseFromString(input, 'text/html');
  // Ensure allowed schemas are lower case.
  allowedSchemas = Array.isArray(allowedSchemas)
    ? allowedSchemas.map(schema => schema.toLowerCase())
    : defaultAllowedSchemas;
  // Remove comments.
  const commentIter = doc.createNodeIterator(doc.documentElement, NodeFilter.SHOW_COMMENT);
  let node;
  while ((node = commentIter.nextNode())) {
    (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(node);
  }
  const removeTags = [...removeWithContents];
  if (dropAllHtmlTags) {
    removeTags.push('style');
  }
  // Remove disallowed tags.
  const disallowedList = doc.querySelectorAll(removeTags.join(', '));
  disallowedList.forEach(element => element.remove());
  // Move styles from head to body.
  const styleList = doc.querySelectorAll('head > style');
  styleList.forEach(element => {
    doc.body.appendChild(element);
  });
  // Filter other tags.
  const toRemove = [];
  const elementIter = doc.createNodeIterator(doc.body, '', {
    acceptNode: () => {
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while ((node = elementIter.nextNode())) {
    const element = node;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'body' || tagName === 'html') {
      continue;
    }
    if (dropAllHtmlTags) {
      if (node.textContent) {
        const textNode = doc.createTextNode(node.textContent);
        (_b = node.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(textNode, node);
      } else {
        (_c = node.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(node);
      }
      continue;
    }
    if (tagName in allowedTags) {
      const allowedAttributes = allowedTags[tagName];
      for (const attribute of element.getAttributeNames()) {
        if (!allowedAttributes.includes(attribute)) {
          element.removeAttribute(attribute);
        } else if (attribute === 'class' && !noWrapper) {
          element.setAttribute(
            attribute,
            (_e =
              (_d = element.getAttribute(attribute)) === null || _d === void 0
                ? void 0
                : _d
                    .split(' ')
                    .map(className => id + '_' + className)
                    .join(' ')) !== null && _e !== void 0
              ? _e
              : '',
          );
        } else if (attribute === 'id' && !noWrapper) {
          element.setAttribute(
            attribute,
            id + '_' + ((_f = element.getAttribute(attribute)) !== null && _f !== void 0 ? _f : ''),
          );
        } else if (attribute === 'href' || attribute === 'src') {
          const value = (_g = element.getAttribute(attribute)) !== null && _g !== void 0 ? _g : '';
          if (attribute === 'href' && rewriteExternalLinks) {
            element.setAttribute(attribute, rewriteExternalLinks(value));
          } else if (attribute === 'src' && rewriteExternalResources) {
            element.setAttribute(attribute, rewriteExternalResources(value));
          } else if (!allowedSchemas.includes(value.toLowerCase().split(':')[0])) {
            element.removeAttribute(attribute);
          }
        }
      }
      // Sanitize CSS.
      sanitizeCssStyle(
        element.style,
        allowedSchemas,
        preserveCssPriority,
        rewriteExternalResources,
      );
      if (tagName === 'a') {
        // Add rel="noopener noreferrer" to <a>
        element.setAttribute('rel', 'noopener noreferrer');
        // Add target="_blank" to <a>
        element.setAttribute('target', '_blank');
      }
    } else {
      element.insertAdjacentHTML('afterend', element.innerHTML);
      toRemove.push(element);
    }
  }
  for (const element of toRemove) {
    try {
      try {
        (_h = element.parentNode) === null || _h === void 0 ? void 0 : _h.removeChild(element);
      } catch (_j) {
        element.outerHTML = '';
      }
    } catch (_k) {
      try {
        element.remove();
      } catch (_l) {}
    }
  }
  // Prepend wrapper ID.
  const bodyStyleList = doc.querySelectorAll('body style');
  bodyStyleList.forEach(element => {
    const styleElement = element;
    const stylesheet = styleElement.sheet;
    const newRules = [];
    if (!stylesheet.cssRules) {
      styleElement.textContent = '';
      return;
    }
    for (let i = 0; i < stylesheet.cssRules.length; i++) {
      const rule = stylesheet.cssRules[i];
      if ('selectorText' in rule) {
        sanitizeCssRule(rule, id, allowedSchemas, preserveCssPriority, rewriteExternalResources);
        newRules.push(rule);
      } else if ('cssRules' in rule && 'media' in rule) {
        // According to https://www.caniemail.com/,
        // out of all at-rules, Gmail only supports @media.
        const mediaRule = rule;
        const newRulesMedia = [];
        for (let i = 0; i < mediaRule.cssRules.length; i++) {
          const rule = mediaRule.cssRules[i];
          if (rule.type === rule.STYLE_RULE) {
            sanitizeCssRule(
              rule,
              id,
              allowedSchemas,
              preserveCssPriority,
              rewriteExternalResources,
            );
            newRulesMedia.push(rule);
          }
        }
        while (mediaRule.cssRules.length > 0) {
          mediaRule.deleteRule(0);
        }
        for (const rule of newRulesMedia) {
          mediaRule.insertRule(rule.cssText, mediaRule.cssRules.length);
        }
        newRules.push(mediaRule);
      }
    }
    styleElement.textContent = newRules.map(rule => rule.cssText).join('\n');
  });
  // Wrap body inside of a div with the generated ID.
  if (noWrapper) {
    return doc.body.innerHTML;
  } else {
    const div = doc.createElement('div');
    div.id = id;
    div.innerHTML = doc.body.innerHTML;
    return div.outerHTML;
  }
}
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
export function sanitize(html, text, options) {
  let contents = html !== null && html !== void 0 ? html : '';
  if ((contents === null || contents === void 0 ? void 0 : contents.length) === 0 && text) {
    contents = sanitizeText(text)
      .split('\n')
      .map(line => '<p>' + line + '</p>')
      .join('\n');
  }
  return sanitizeHtml(contents, options !== null && options !== void 0 ? options : {});
}
