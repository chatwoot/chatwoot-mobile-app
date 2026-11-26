import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';
import type { AudioRoute } from '@/services/voice/chatwootCalls';
import { isAwaitingTwilioContact, isOutboundCallRinging } from '@/utils/voiceCallUtils';

import { AudioRoutePicker } from './components/AudioRoutePicker';
import { CallBackdrop } from './components/CallBackdrop';
import { CallControlsTray } from './components/CallControlsTray';
import { CallHeader } from './components/CallHeader';
import { CALL_GLASS, CallSurface } from './components/CallSurface';
import { CallerIdentity } from './components/CallerIdentity';
import { IncomingCallActions } from './components/IncomingCallActions';
import {
  CALL_CONTENT_MAX_WIDTH,
  CALL_STRIP_GAP,
  CALL_STRIP_HEIGHT,
  callTrayBottom,
  callTrayInset,
  CARD_SHADOW,
} from './constants/callTheme';
import { useAudioRoutePicker } from './hooks/useAudioRoutePicker';
import type { CallerInfo } from './hooks/useCallerInfo';
import { useHardwareBackToMinimise } from './hooks/useHardwareBackToMinimise';
import {
  audioRouteLabel,
  availableAudioRoutes,
  hasHeadsetRoute,
  type AudioRouteState,
} from './utils/audioRoutes';
import { callTone } from './utils/callTone';

type ActiveCallScreenProps = {
  call: LiveCall;
  info: CallerInfo;
  onLockScreen?: boolean;
  activeSince?: number;
  isConnected: boolean;
  isConnecting?: boolean;
  isIncoming?: boolean;
  isJoining?: boolean;
  onAnswer?: () => void;
  isMuted: boolean;
  isOnHold?: boolean;
  isSpeakerOn: boolean;
  audioRoute: AudioRouteState;
  isEnding: boolean;
  onMinimise: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onSelectAudioRoute: (route: AudioRoute) => void;
  onToggleHold: () => void;
  onEnd: () => void;
  onOpenConversation: () => void;
  onRoutePickerOpenChange?: (open: boolean) => void;
  hasWaitingCalls?: boolean;
};

export const ActiveCallScreen = ({
  call,
  info,
  onLockScreen = false,
  activeSince,
  isConnected,
  isConnecting,
  isIncoming,
  isJoining,
  onAnswer,
  isMuted,
  isOnHold = false,
  isSpeakerOn,
  audioRoute,
  isEnding,
  onMinimise,
  onToggleMute,
  onToggleSpeaker,
  onSelectAudioRoute,
  onToggleHold,
  onEnd,
  onOpenConversation,
  onRoutePickerOpenChange,
  hasWaitingCalls = false,
}: ActiveCallScreenProps) => {
  const tailwind = useTailwind();
  const insets = useSafeAreaInsets();
  useHardwareBackToMinimise(onLockScreen, onMinimise);

  const hasHeadset = hasHeadsetRoute(audioRoute);
  const currentRoute = audioRoute.current;
  const routeLabel = (route: AudioRoute) => audioRouteLabel(audioRoute, route);
  const routePicker = useAudioRoutePicker(hasHeadset, isConnected);
  useEffect(() => {
    onRoutePickerOpenChange?.(routePicker.isOpen);
  }, [onRoutePickerOpenChange, routePicker.isOpen]);

  const tone = callTone(isOnHold, isConnected && !isAwaitingTwilioContact(call));
  const statusFlags = { isOnHold, isConnected, isConnecting, isIncoming };
  const trayBottom = callTrayBottom(insets.bottom);
  const sideInset = Math.max(insets.left, insets.right);
  const trayInset = callTrayInset(insets);

  return (
    <View style={tailwind.style('absolute inset-0')}>
      <CallBackdrop tone={tone} />
      <CallHeader canMinimise={!onLockScreen} onMinimise={onMinimise} />
      <View style={tailwind.style('absolute inset-0')} pointerEvents="box-none">
        <CallerIdentity
          info={info}
          call={call}
          activeSince={activeSince}
          statusFlags={statusFlags}
          tone={tone}
          aura={
            !!isIncoming ||
            (!isConnecting &&
              (!isConnected || isAwaitingTwilioContact(call)) &&
              isOutboundCallRinging(call))
          }
          onOpenConversation={call.conversationId ? onOpenConversation : undefined}
          sidePadding={Math.max(32, sideInset)}
          bottomPadding={110 + (hasWaitingCalls ? CALL_STRIP_HEIGHT + CALL_STRIP_GAP : 0)}
        />

        {routePicker.isOpen ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.AUDIO_ROUTE')}
            onPress={routePicker.close}
            style={tailwind.style('absolute inset-0')}
          />
        ) : null}

        <View
          style={[
            tailwind.style('absolute items-center'),
            { left: trayInset, right: trayInset, bottom: trayBottom },
          ]}
          pointerEvents="box-none">
          <View style={[tailwind.style('w-full gap-2'), { maxWidth: CALL_CONTENT_MAX_WIDTH }]}>
            {routePicker.isOpen ? (
              <AudioRoutePicker
                routes={availableAudioRoutes(audioRoute)}
                current={currentRoute}
                labelFor={routeLabel}
                onSelect={route => {
                  routePicker.close();
                  onSelectAudioRoute(route);
                }}
              />
            ) : null}

            <CallSurface
              radius={24}
              shadow={CARD_SHADOW}
              plain={CALL_GLASS}
              style={tailwind.style('p-4')}>
              {isIncoming ? (
                <IncomingCallActions
                  onDecline={onEnd}
                  onAnswer={onAnswer ?? (() => {})}
                  declineDisabled={isEnding}
                  answerDisabled={!!isJoining}
                />
              ) : (
                <CallControlsTray
                  isConnected={isConnected}
                  isMuted={isMuted}
                  isOnHold={isOnHold}
                  isSpeakerOn={isSpeakerOn}
                  isEnding={isEnding}
                  hasHeadset={hasHeadset}
                  currentRoute={currentRoute}
                  routeLabel={routeLabel}
                  onToggleMute={onToggleMute}
                  onToggleSpeaker={onToggleSpeaker}
                  onToggleRoutePicker={routePicker.toggle}
                  onToggleHold={onToggleHold}
                  onEnd={onEnd}
                />
              )}
            </CallSurface>
          </View>
        </View>
      </View>
    </View>
  );
};
