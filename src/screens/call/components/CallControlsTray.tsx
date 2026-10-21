import React from 'react';
import { View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import {
  EndGlyph,
  HoldGlyph,
  MicOffGlyph,
  MicOnGlyph,
  ResumeGlyph,
  SpeakerGlyph,
} from '@/svg-icons';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

import {
  CONTROL_DISABLED_GLYPH,
  CONTROL_HOLD_GLYPH,
  CONTROL_OFF_GLYPH,
  CONTROL_ON_GLYPH,
} from '../constants/callTheme';
import { isHeadsetRoute } from '../utils/audioRoutes';
import { AudioRouteIcon } from './AudioRouteIcon';
import { CallControl } from './CallControl';

const WHITE = '#FFFFFF';

type CallControlsTrayProps = {
  // False while an outbound call is still ringing: there is nothing to hold yet
  isConnected: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  isSpeakerOn: boolean;
  isEnding: boolean;
  // With a headset around the speaker button becomes a route button
  hasHeadset: boolean;
  currentRoute: AudioRoute;
  routeLabel: (route: AudioRoute) => string;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleRoutePicker: () => void;
  onToggleHold: () => void;
  onEnd: () => void;
};

// Mute, audio, hold and end in a row
export const CallControlsTray = ({
  isConnected,
  isMuted,
  isOnHold,
  isSpeakerOn,
  isEnding,
  hasHeadset,
  currentRoute,
  routeLabel,
  onToggleMute,
  onToggleSpeaker,
  onToggleRoutePicker,
  onToggleHold,
  onEnd,
}: CallControlsTrayProps) => (
  <View style={tailwind.style('flex-row justify-between')}>
    <CallControl
      label={i18n.t(
        isMuted ? 'CONVERSATION.VOICE_WIDGET.UNMUTE' : 'CONVERSATION.VOICE_WIDGET.MUTE',
      )}
      tone="off"
      onPress={onToggleMute}>
      {isMuted ? (
        <MicOffGlyph color={CONTROL_OFF_GLYPH} size={26} />
      ) : (
        <MicOnGlyph color={CONTROL_OFF_GLYPH} size={26} />
      )}
    </CallControl>
    {hasHeadset ? (
      <CallControl
        label={
          isHeadsetRoute(currentRoute)
            ? routeLabel(currentRoute)
            : i18n.t('CONVERSATION.VOICE_WIDGET.AUDIO_ROUTE')
        }
        tone={currentRoute !== 'earpiece' ? 'on' : 'off'}
        onPress={onToggleRoutePicker}>
        <AudioRouteIcon
          route={currentRoute}
          color={currentRoute !== 'earpiece' ? CONTROL_ON_GLYPH : CONTROL_OFF_GLYPH}
          size={26}
        />
      </CallControl>
    ) : (
      <CallControl
        label={i18n.t('CONVERSATION.VOICE_WIDGET.SPEAKER')}
        tone={isSpeakerOn ? 'on' : 'off'}
        onPress={onToggleSpeaker}>
        <SpeakerGlyph color={isSpeakerOn ? CONTROL_ON_GLYPH : CONTROL_OFF_GLYPH} size={26} />
      </CallControl>
    )}
    <CallControl
      label={i18n.t(
        isOnHold ? 'CONVERSATION.VOICE_WIDGET.RESUME' : 'CONVERSATION.VOICE_WIDGET.HOLD',
      )}
      tone={isOnHold ? 'hold' : 'off'}
      inactive={!isConnected}
      onPress={onToggleHold}>
      {isOnHold ? (
        <ResumeGlyph color={CONTROL_HOLD_GLYPH} size={26} />
      ) : (
        <HoldGlyph color={isConnected ? CONTROL_OFF_GLYPH : CONTROL_DISABLED_GLYPH} size={26} />
      )}
    </CallControl>
    <CallControl
      label={i18n.t('CONVERSATION.VOICE_WIDGET.END_CALL')}
      tone="end"
      disabled={isEnding}
      onPress={onEnd}>
      <EndGlyph color={WHITE} size={26} />
    </CallControl>
  </View>
);
