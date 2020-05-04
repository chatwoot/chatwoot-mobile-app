import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate(name, params, key) {
  navigationRef.current?.navigate({ name, key, params });
}
