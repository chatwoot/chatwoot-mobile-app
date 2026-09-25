import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

import { AudioRoutePicker } from './components/AudioRoutePicker';
import { CallBackdrop } from './components/CallBackdrop';
import { CallControlsTray } from './components/CallControlsTray';
import { CallHeader } from './components/CallHeader';
import { CallerIdentity } from './components/CallerIdentity';
import { GlassSurface } from './components/GlassSurface';
import { IncomingCallActions } from './components/IncomingCallActions';
import { solidSurface } from './constants/callTheme';
import { useAudioRoutePicker } from './hooks/useAudioRoutePicker';
import type { CallerInfo } from './hooks/useCallerInfo';
import { useDeviceLocked } from './hooks/useDeviceLocked';
import { useHardwareBackToMinimise } from './hooks/useHardwareBackToMinimise';
import {
  audioRouteLabel,
  availableAudioRoutes,
  currentAudioRoute,
  hasHeadsetRoute,
  type AudioRouteState,
} from './utils/audioRoutes';
import { callStatusText } from './utils/callStatusText';
import { callTone } from './utils/callTone';

type ActiveCallScreenProps = {
  call: LiveCall;
  info: CallerInfo;
  duration: string;
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
};

// Full-screen view of a call: the inbox in use at the top, the phase and the contact in
// the middle, the controls in a tray at the bottom. The phase colours the whole screen.
export const ActiveCallScreen = ({
  call,
  info,
  duration,
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
}: ActiveCallScreenProps) => {
  const insets = useSafeAreaInsets();
  // Over a lock screen the call is all the agent may reach: no way back into the app
  const isLocked = useDeviceLocked();
  useHardwareBackToMinimise(isLocked, onMinimise);

  const hasHeadset = hasHeadsetRoute(audioRoute);
  const currentRoute = currentAudioRoute(audioRoute, isSpeakerOn);
  const routeLabel = (route: AudioRoute) => audioRouteLabel(audioRoute, route);
  const routePicker = useAudioRoutePicker(hasHeadset, isConnected);

  const tone = callTone(isOnHold, isConnected);
  const statusText = callStatusText(call, duration, {
    isOnHold,
    isConnected,
    isConnecting,
    isIncoming,
  });
  const trayBottom = insets.bottom + (Platform.OS === 'ios' ? 12 : 16);

  return (
    <View style={tailwind.style('absolute inset-0')}>
      <CallBackdrop tone={tone} />
      <CallHeader inboxName={info.inboxName} canMinimise={!isLocked} onMinimise={onMinimise} />
      <CallerIdentity
        info={info}
        statusText={statusText}
        tone={tone}
        showsTimer={isConnected}
        aura={!isConnected && !isConnecting}
        onOpenConversation={call.conversationId && !isLocked ? onOpenConversation : undefined}
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

      <View style={[tailwind.style('absolute left-4 right-4 gap-2.5'), { bottom: trayBottom }]}>
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

        <GlassSurface
          style={tailwind.style('rounded-[30px] px-5', isIncoming ? 'py-4' : 'pt-4 pb-3.5')}
          fallbackStyle={solidSurface(30, 'card')}>
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
        </GlassSurface>
      </View>
    </View>
  );
};
