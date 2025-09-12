import * as React from 'react';
import { StackActions, NavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  [key: string]: object | undefined;
};

// Define the navigation ref with proper typing
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

// Add type definitions for the navigation functions
export function navigate(name: string, params?: object, key?: string): void {
  navigationRef.current?.navigate({ name, key, params });
}

export function pop(n: number): void {
  navigationRef.current?.dispatch(StackActions.pop(n));
}

export function getCurrentRouteName(): string | undefined {
  return navigationRef.current?.getCurrentRoute()?.name;
}

export function replace(name: string, params?: object): void {
  navigationRef.current?.dispatch(StackActions.replace(name, params));
}
