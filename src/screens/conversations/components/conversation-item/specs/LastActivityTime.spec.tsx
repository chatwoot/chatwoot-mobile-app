import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { LastActivityTime } from '../LastActivityTime';

jest.mock('@/components-next/native-components', () => {
  const { View } = jest.requireActual('react-native');
  return { NativeView: View };
});

const NOW = new Date('2026-10-13T20:30:00Z').getTime();
const secondsAgo = (s: number) => Math.floor(NOW / 1000) - s;

const label = (r: TestRenderer.ReactTestRenderer) =>
  String(r.root.findByType(Text).props.children).trim();

describe('LastActivityTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterEach(() => jest.useRealTimers());

  it('shows the time for the row it is rendering after cell reuse', () => {
    let r!: TestRenderer.ReactTestRenderer;
    act(() => {
      r = TestRenderer.create(<LastActivityTime timestamp={secondsAgo(4 * 3600)} />);
    });
    expect(label(r)).toBe('4h');

    // FlashList hands the same mounted cell a different row
    act(() => r.update(<LastActivityTime timestamp={secondsAgo(2 * 3600)} />));
    expect(label(r)).toBe('2h');

    act(() => r.update(<LastActivityTime timestamp={secondsAgo(44 * 60)} />));
    expect(label(r)).toBe('44m');
  });

  it('keeps tracking the current row when the refresh tick fires', () => {
    let r!: TestRenderer.ReactTestRenderer;
    act(() => {
      r = TestRenderer.create(<LastActivityTime timestamp={secondsAgo(29 * 60)} />);
    });
    act(() => r.update(<LastActivityTime timestamp={secondsAgo(3 * 3600)} />));
    act(() => jest.advanceTimersByTime(60_000));
    expect(label(r)).toBe('3h');
  });

  it('stops its refresh timers on unmount', () => {
    let r!: TestRenderer.ReactTestRenderer;
    act(() => {
      r = TestRenderer.create(<LastActivityTime timestamp={secondsAgo(30)} />);
    });
    act(() => jest.advanceTimersByTime(60_000)); // first tick schedules the next one
    act(() => r.unmount());
    expect(jest.getTimerCount()).toBe(0);
  });
});
