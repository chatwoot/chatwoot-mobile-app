// A Function from TamagUI - Open Source Library
// Credit goes to the Author
export function getBaseViews() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const native = require('react-native');

  let View;
  let TextAncestor;

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    View = require('react-native/Libraries/Components/View/ViewNativeComponent').default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    TextAncestor = require('react-native/Libraries/Text/TextAncestor');
  }

  if (!View) {
    View = native.View || native.default.View;
  }

  return {
    View,
    Text: native.Text || native.default.Text,
    StyleSheet: native.StyleSheet || native.default.StyleSheet,
    TextAncestor,
    Pressable: native.Pressable || native.default.Pressable,
  };
}

export * from './NText';
export * from './NView';
