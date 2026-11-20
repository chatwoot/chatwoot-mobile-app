import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import {
  useAutoScrollToNewest,
  NEAR_BOTTOM_THRESHOLD,
  UseAutoScrollToNewestParams,
} from '../useAutoScrollToNewest';
import { MESSAGE_TYPES } from '@/constants';
import { Message } from '@/types';
import { FlashListRef } from '@shopify/flash-list';

const mockMessage = (id: number, messageType = MESSAGE_TYPES.INCOMING, senderId = 1): Message =>
  ({
    id,
    content: `Message ${id}`,
    messageType,
    senderId,
    sender: { id: senderId, name: 'User' },
    createdAt: 1000 + id,
  }) as unknown as Message;

const TestHarness = (props: UseAutoScrollToNewestParams) => {
  useAutoScrollToNewest(props);
  return null;
};

describe('useAutoScrollToNewest', () => {
  let scrollToOffsetMock: jest.Mock;
  let messageListRef: React.RefObject<FlashListRef<Message | { date: string }>>;
  let rafCallbacks: FrameRequestCallback[];
  let rafSpy: jest.SpyInstance;
  let cancelRafSpy: jest.SpyInstance;

  beforeEach(() => {
    scrollToOffsetMock = jest.fn();
    messageListRef = {
      current: {
        scrollToOffset: scrollToOffsetMock,
      } as unknown as FlashListRef<Message | { date: string }>,
    };

    rafCallbacks = [];
    rafSpy = jest
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });
    cancelRafSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(jest.fn());
  });

  afterEach(() => {
    rafSpy.mockRestore();
    cancelRafSpy.mockRestore();
  });

  const runAllRaf = () => {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach(cb => cb(Date.now()));
  };

  it('does not scroll on first load of messages', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).not.toHaveBeenCalled();
    expect(renderer).toBeDefined();
  });

  it('does not scroll when older messages are appended to the end of the array', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(2)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    // Older history loads at the end of the inverted array (messages[0] unchanged)
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).not.toHaveBeenCalled();
  });

  it('scrolls to offset 0 when incoming message arrives and user is near bottom', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    // New incoming message from contact prepended at index 0, scrollY within threshold
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.INCOMING, 99), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: NEAR_BOTTOM_THRESHOLD - 10 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).toHaveBeenCalledTimes(1);
    expect(scrollToOffsetMock).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  it('does not scroll when incoming message arrives and user is scrolled up into history', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    // User scrolled up into history (scrollY >= threshold)
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.INCOMING, 99), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: NEAR_BOTTOM_THRESHOLD + 100 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).not.toHaveBeenCalled();
  });

  it('always scrolls to offset 0 when current user sends an outgoing message even if scrolled up', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    // Current user sends a message while scroll position was high
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.OUTGOING, 10), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 500 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).toHaveBeenCalledTimes(1);
    expect(scrollToOffsetMock).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  it('scrolls to offset 0 when another team member or bot sends an outgoing message and user is near bottom', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    // Another agent (id 20) sends an outgoing message
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.OUTGOING, 20), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 20 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).toHaveBeenCalledTimes(1);
    expect(scrollToOffsetMock).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  it('does not scroll on incoming messages during search navigation', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
          isSearchNavigation={true}
        />,
      );
    });

    // Incoming message arrives while viewing search results
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.INCOMING, 99), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
          isSearchNavigation={true}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).not.toHaveBeenCalled();
  });

  it('scrolls when current user sends a message even during search navigation', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
          isSearchNavigation={true}
        />,
      );
    });

    // User sends a message
    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.OUTGOING, 10), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
          isSearchNavigation={true}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).toHaveBeenCalledTimes(1);
    expect(scrollToOffsetMock).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  it('does not scroll when a date header is inserted at index 0', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    act(() => {
      renderer.update(
        <TestHarness
          messages={[{ date: 'Today' }, mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    runAllRaf();
    expect(scrollToOffsetMock).not.toHaveBeenCalled();
  });

  it('cancels pending animation frame on unmount', () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TestHarness
          messages={[mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    act(() => {
      renderer.update(
        <TestHarness
          messages={[mockMessage(2, MESSAGE_TYPES.INCOMING, 99), mockMessage(1)]}
          currentUserId={10}
          messageListRef={messageListRef}
          scrollY={{ value: 0 } as never}
        />,
      );
    });

    act(() => {
      renderer.unmount();
    });

    expect(cancelRafSpy).toHaveBeenCalled();
  });
});
