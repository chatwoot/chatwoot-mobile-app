import React from 'react';

if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    exclude: [/^BottomTabBar$/, /^Pressable$/, /TabItem/, /TabBarIcons/, /PureComponentWrapper/],
  });
}
