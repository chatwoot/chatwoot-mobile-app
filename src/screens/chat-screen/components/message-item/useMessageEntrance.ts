import { useLayoutEffect } from 'react';
import { FadeIn } from 'react-native-reanimated';

// Message ids whose entrance already played; a recycled or refetched row appears
// instantly instead of fading in again.
const enteredIds = new Set<number>();

// Returns a declarative entering animation the first time a message id is seen, and
// undefined afterwards. Unlike a manual opacity shared value, Reanimated drives the
// fade to the row's natural opacity on the UI thread, so an interrupted animation can
// never leave a row stuck invisible.
export function useMessageEntrance(itemId: number) {
  const isFirstEntrance = !enteredIds.has(itemId);

  useLayoutEffect(() => {
    enteredIds.add(itemId);
  }, [itemId]);

  return isFirstEntrance ? FadeIn.duration(350) : undefined;
}
