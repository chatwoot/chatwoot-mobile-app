import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { TrueSheet, type SheetDetent } from '@lodev09/react-native-true-sheet';

import { tailwind } from '@/theme';

/**
 * Imperative API exposed to call sites. present/dismiss/resize mirror TrueSheet
 * but swallow the SHEET_NOT_FOUND rejection that TrueSheet throws when a method
 * is called on a sheet whose native view isn't currently mounted (it lazily
 * mounts on present and unmounts on dismiss). This keeps dismiss-when-closed a
 * no-op, matching how call sites use it.
 */
export type SheetRef = {
  present: (index?: number) => void;
  dismiss: () => void;
  resize: (index: number) => void;
};

const noop = () => {};

type SheetProps = {
  children?: React.ReactNode;
  /** Optional global name; present/dismiss without a ref via TrueSheet.present(name). */
  name?: string;
  /** Fixed height in px, converted to a fractional detent. */
  height?: number;
  /** Explicit detents (fractions 0-1, 'auto', 'peek'); overrides height/autoSize. */
  detents?: SheetDetent[];
  /** Hug content height (detents = ['auto']). Not compatible with scrollable. */
  autoSize?: boolean;
  /** Cap on content height: a 0-1 fraction of the screen, or px. */
  maxHeight?: number;
  /** Render children with native scrolling (child should be a ScrollView/FlatList). */
  scrollable?: boolean;
  /** Show the dimmed backdrop (default true). */
  dimmed?: boolean;
  /** Allow tap-outside / pan-down to close (default true). */
  dismissible?: boolean;
  /** Extra style for the content area (merged after the default top padding). */
  contentStyle?: StyleProp<ViewStyle>;
  onDismiss?: () => void;
  onPresent?: () => void;
};

const GRABBER_OPTIONS = {
  width: 32,
  height: 4,
  cornerRadius: 11,
  color: tailwind.color('bg-blackA-A6') as string,
};

/**
 * Shared bottom sheet built on react-native-true-sheet (native, Fabric).
 * Applies the app's house style once and normalises the height/detent API so
 * call sites pass a plain px height, autoSize, or explicit detents.
 */
export const Sheet = forwardRef<SheetRef, SheetProps>((props, ref) => {
  const {
    children,
    name,
    height,
    detents,
    autoSize,
    maxHeight,
    scrollable = false,
    dimmed = true,
    dismissible = true,
    contentStyle,
    onDismiss,
    onPresent,
  } = props;

  const { height: windowHeight } = useWindowDimensions();
  const innerRef = useRef<TrueSheet>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: (index?: number) => {
        innerRef.current?.present(index).catch(noop);
      },
      dismiss: () => {
        innerRef.current?.dismiss().catch(noop);
      },
      resize: (index: number) => {
        innerRef.current?.resize(index).catch(noop);
      },
    }),
    [],
  );

  const resolvedDetents: SheetDetent[] = detents
    ? detents
    : autoSize
      ? ['auto']
      : height
        ? [Math.min(height / windowHeight, 1)]
        : ['auto'];

  const maxContentHeight =
    maxHeight === undefined ? undefined : maxHeight <= 1 ? maxHeight * windowHeight : maxHeight;

  return (
    <TrueSheet
      ref={innerRef}
      name={name}
      detents={resolvedDetents}
      maxContentHeight={maxContentHeight}
      scrollable={scrollable}
      dimmed={dimmed}
      dismissible={dismissible}
      cornerRadius={26}
      backgroundColor={tailwind.color('bg-white') as string}
      grabber
      grabberOptions={GRABBER_OPTIONS}
      style={[styles.content, contentStyle]}
      onDidDismiss={onDismiss}
      onDidPresent={onPresent}>
      {children}
    </TrueSheet>
  );
});

Sheet.displayName = 'Sheet';

// Top padding clears the native grabber so content doesn't sit against it.
const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
  },
});
