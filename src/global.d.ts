// Maps the global `JSX` namespace to `React.JSX`, where @types/react 19.1 defines
// these types, so global `JSX.Element` and related annotations resolve.
// See: https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript
import type * as React from 'react';

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
  }
}
