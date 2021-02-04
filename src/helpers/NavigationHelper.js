import * as React from 'react';
import { StackActions } from '@react-navigation/native';
export const navigationRef = React.createRef();

export function navigate(name, params, key) {
  navigationRef.current?.navigate({ name, key, params });
}

export function pop(n) {
  navigationRef.current?.dispatch(StackActions.pop(n));
}
