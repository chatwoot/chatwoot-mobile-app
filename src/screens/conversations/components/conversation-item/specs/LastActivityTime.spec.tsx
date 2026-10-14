import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { LastActivityTime } from '../LastActivityTime';

jest.mock('@/theme', () => ({ tailwind: { style: () => ({}) } }));
jest.mock('@/components-next/native-components', () => ({
  NativeView: jest.requireActual('react-native').View,
}));
jest.mock('@/utils/dateTimeUtils', () => ({
  formatRelativeTime: (timestamp: number) => `${timestamp}`,
  formatTimeToShortForm: (time: string) => time,
}));

describe('LastActivityTime', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders the new timestamp immediately when a list row is recycled', () => {
    let tree: ReactTestRenderer;
    act(() => {
      tree = create(<LastActivityTime timestamp={100} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('100');
    act(() => {
      tree.update(<LastActivityTime timestamp={200} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('200');
    expect(JSON.stringify(tree!.toJSON())).not.toContain('100');
    act(() => {
      tree.unmount();
    });
    expect(jest.getTimerCount()).toBe(0);
  });

  it('cancels the currently scheduled refresh after several timer ticks', () => {
    let tree: ReactTestRenderer;
    act(() => {
      tree = create(<LastActivityTime timestamp={Date.now() / 1000} />);
    });
    act(() => {
      jest.advanceTimersByTime(180000);
    });
    expect(jest.getTimerCount()).toBe(1);
    act(() => {
      tree.unmount();
    });
    expect(jest.getTimerCount()).toBe(0);
  });
});
