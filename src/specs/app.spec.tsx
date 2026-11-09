import React from 'react';
import { Alert, BackHandler } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import Chatwoot from '../app';
import { navigationRef } from '@/utils/navigationUtils';

jest.mock('../store', () => ({ store: {}, persistor: {} }));
jest.mock('react-redux', () => ({ Provider: ({ children }: React.PropsWithChildren) => children }));
jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }: React.PropsWithChildren) => children,
}));
jest.mock('@/components-next/error-boundary', () => ({
  AppErrorBoundary: ({ children }: React.PropsWithChildren) => children,
}));
jest.mock('@/navigation', () => ({ AppNavigator: () => null }));
jest.mock('@/i18n', () => ({ t: (key: string) => key }));
jest.mock('@/utils/navigationUtils', () => ({ navigationRef: { current: null } }));

describe('Android system back', () => {
  let renderer: ReactTestRenderer;
  let onBack: () => boolean | null | undefined;
  const remove = jest.fn();
  const goBack = jest.fn();
  const dispatch = jest.fn();
  const getCurrentRoute = jest.fn();
  const canGoBack = jest.fn();
  const isReady = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigationRef, {
      current: { goBack, canGoBack, isReady, dispatch, getCurrentRoute },
    });
    isReady.mockReturnValue(true);
    getCurrentRoute.mockReturnValue({ name: 'Tab' });
    canGoBack.mockReturnValue(true);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {});
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
      onBack = () => handler({ type: 'hardwareBackPress', timeStamp: 0 });
      return { remove };
    });
    act(() => {
      renderer = create(<Chatwoot />);
    });
  });

  afterEach(() => {
    act(() => renderer.unmount());
    jest.restoreAllMocks();
  });

  it('returns from a conversation without asking to exit', () => {
    expect(onBack()).toBe(true);
    expect(goBack).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(BackHandler.exitApp).not.toHaveBeenCalled();
  });

  it('returns a cold-opened conversation to the inbox without asking to exit', () => {
    canGoBack.mockReturnValue(false);
    getCurrentRoute.mockReturnValue({ name: 'ChatScreen' });
    expect(onBack()).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(StackActions.replace('Tab'));
    expect(goBack).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('asks to exit only once navigation reaches the root', () => {
    onBack();
    canGoBack.mockReturnValue(false);
    expect(onBack()).toBe(true);
    expect(goBack).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(BackHandler.exitApp).not.toHaveBeenCalled();

    const buttons = jest.mocked(Alert.alert).mock.calls[0][2]!;
    buttons[0].onPress?.();
    expect(BackHandler.exitApp).not.toHaveBeenCalled();
    buttons[1].onPress?.();
    expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  });

  it('does not show an exit dialog before navigation is ready', () => {
    isReady.mockReturnValue(false);
    expect(onBack()).toBe(false);
    expect(goBack).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('does not show an exit dialog before the navigator mounts', () => {
    Object.assign(navigationRef, { current: null });
    expect(onBack()).toBe(false);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('removes the back listener on unmount', () => {
    act(() => renderer.unmount());
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
