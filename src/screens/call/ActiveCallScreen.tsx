import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';
import type { AudioRoute } from '@/services/voice/chatwootCalls';
import { isAwaitingTwilioContact, isOutboundCallRinging } from '@/utils/voiceCallUtils';

import { AudioRoutePicker } from './components/AudioRoutePicker';
import { CallBackdrop } from './components/CallBackdrop';
import { CallControlsTray } from './components/CallControlsTray';
import { CallHeader } from './components/CallHeader';
import { CallerIdentity } from './components/CallerIdentity';
import { IncomingCallActions } from './components/IncomingCallActions';
import { CARD_SHADOW, callTrayBottom } from './constants/callTheme';
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
  // Shown over the lock screen, where nothing else in the app may be reached: there is no
  // minimise, and the way into the chat asks the phone to unlock first
  onLockScreen?: boolean;
  // When this device joined the call, which the timer counts from
  activeSince?: number;
  // False while an outbound call is still ringing: no media yet, so no mute or speaker
  isConnected: boolean;
  // Answered on this device, with the media still being set up
  isConnecting?: boolean;
  // An inbound call still ringing on this device, which gets answer and decline instead
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
  // Told when the audio route list opens or closes, so nothing is drawn over it
  onRoutePickerOpenChange?: (open: boolean) => void;
};

// Full-screen view of a call: the inbox in use at the top, the phase and the contact in
// the middle, the controls in a tray at the bottom. The phase colours the whole screen.
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
}: ActiveCallScreenProps) => {
  const insets = useSafeAreaInsets();
  // Over a lock screen the call is all the agent may reach: no way back into the app
  useHardwareBackToMinimise(onLockScreen, onMinimise);

  const hasHeadset = hasHeadsetRoute(audioRoute);
  const currentRoute = audioRoute.current;
  const routeLabel = (route: AudioRoute) => audioRouteLabel(audioRoute, route);
  const routePicker = useAudioRoutePicker(hasHeadset, isConnected);
  useEffect(() => {
    onRoutePickerOpenChange?.(routePicker.isOpen);
  }, [onRoutePickerOpenChange, routePicker.isOpen]);

  const tone = callTone(isOnHold, isConnected);
  const statusFlags = { isOnHold, isConnected, isConnecting, isIncoming };
  const trayBottom = callTrayBottom(insets.bottom);

  return (
    <View style={tailwind.style('absolute inset-0')}>
      <CallBackdrop tone={tone} />
      <CallHeader canMinimise={!onLockScreen} onMinimise={onMinimise} />
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
      />

      {routePicker.isOpen ? (
        // A tap anywhere outside the list closes it
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.AUDIO_ROUTE')}
          onPress={routePicker.close}
          style={tailwind.style('absolute inset-0')}
        />
      ) : null}

      <View style={[tailwind.style('absolute left-5 right-5 gap-2'), { bottom: trayBottom }]}>
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

        <View style={[tailwind.style('rounded-3xl bg-white p-4'), CARD_SHADOW]}>
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
        </View>
      </View>
    </View>
  );
};
