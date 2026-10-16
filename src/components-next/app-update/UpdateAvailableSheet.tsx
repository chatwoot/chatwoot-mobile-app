import React, { forwardRef, useCallback, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { isolateBidi } from '@/utils/appUpdateUtils';
import { Button } from '../button';
import { Sheet, type SheetRef } from '../common/sheet/Sheet';

import { AppUpdateIcon } from './AppUpdateIcon';

type UpdateAvailableSheetProps = {
  /** Store version to name in the body; null when the store doesn't report one. */
  version: string | null;
  onUpdate: () => void;
  /** Not now, swipe down, scrim tap and Android back. */
  onSnooze: () => void;
};

/**
 * Optional-update bottom sheet. Update closes the sheet and then calls onUpdate, so the
 * store page isn't presented on top of it; every other way of closing calls onSnooze.
 */
export const UpdateAvailableSheet = forwardRef<SheetRef, UpdateAvailableSheetProps>(
  ({ version, onUpdate, onSnooze }, ref) => {
    const { bottom } = useSafeAreaInsets();
    const sheetRef = useRef<SheetRef>(null);
    const updateTappedRef = useRef(false);

    const setRefs = useCallback(
      (instance: SheetRef | null) => {
        sheetRef.current = instance;
        if (typeof ref === 'function') ref(instance);
        else if (ref) ref.current = instance;
      },
      [ref],
    );

    const handleUpdate = useCallback(() => {
      updateTappedRef.current = true;
      sheetRef.current?.dismiss();
    }, []);

    const handleDismiss = useCallback(() => {
      if (updateTappedRef.current) {
        updateTappedRef.current = false;
        onUpdate();
      } else {
        onSnooze();
      }
    }, [onUpdate, onSnooze]);

    const body = version
      ? i18n.t('APP_UPDATE.OPTIONAL.BODY', { version: isolateBidi(version) })
      : i18n.t('APP_UPDATE.OPTIONAL.BODY_WITHOUT_VERSION');

    return (
      <Sheet ref={setRefs} autoSize maxHeight={0.9} onDismiss={handleDismiss}>
        <View style={[tailwind.style('px-4'), { paddingBottom: bottom + 8 }]}>
          <View style={tailwind.style('mt-2 items-start')}>
            <AppUpdateIcon size={56} />
          </View>
          <Text
            accessibilityRole="header"
            style={tailwind.style(
              'mt-4 text-xl leading-7 font-inter-semibold-20 text-gray-950 text-left',
            )}>
            {i18n.t('APP_UPDATE.OPTIONAL.TITLE')}
          </Text>
          <Text
            style={tailwind.style(
              'mt-1 text-md leading-[22px] font-inter-normal-20 text-gray-900 text-left',
            )}>
            {body}
          </Text>
          <View style={tailwind.style('mt-6 gap-1')}>
            <Button text={i18n.t('APP_UPDATE.OPTIONAL.UPDATE')} handlePress={handleUpdate} />
            <Pressable
              accessibilityRole="button"
              onPress={() => sheetRef.current?.dismiss()}
              style={({ pressed }) =>
                tailwind.style(
                  'min-h-[44px] py-[11px] px-4 items-center justify-center rounded-[13px]',
                  pressed && 'bg-gray-100',
                )
              }>
              <Text
                style={tailwind.style(
                  'text-base leading-[22px] tracking-[0.16px] font-inter-medium-24 text-blue-900 text-center',
                )}>
                {i18n.t('APP_UPDATE.OPTIONAL.NOT_NOW')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Sheet>
    );
  },
);

UpdateAvailableSheet.displayName = 'UpdateAvailableSheet';
