import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { Inbox } from '@/types/Inbox';
import { isTwilioVoiceInbox } from '@/utils/inboxUtils';

import { voiceApiService } from './voiceApiService';

const isNativeVoiceEnabled = process.env.EXPO_PUBLIC_ENABLE_NATIVE_VOICE_CALLS === 'true';
const TWILIO_VOICE_MODULE = '@twilio/voice-react-native-sdk';

type TwilioCall = {
  getSid: () => string;
  on: (event: string, listener: () => void) => void;
};

type TwilioCallInvite = {
  getCallSid: () => string;
  getCustomParameters: () => Record<string, string>;
  getFrom: () => string;
  getTo: () => string;
  on: (event: string, listener: (call: TwilioCall) => void) => void;
};

type TwilioVoice = {
  initializePushRegistry: () => Promise<void>;
  on: (event: string, listener: (payload: TwilioCallInvite | Error) => void) => void;
  register: (token: string) => Promise<void>;
  setCallKitConfiguration: (configuration: Record<string, unknown>) => Promise<void>;
  unregister: (token: string) => Promise<void>;
};

type TwilioVoiceModule = {
  Call: { Event: { Disconnected: string } };
  CallInvite: { Event: { Accepted: string; Cancelled: string; Rejected: string } };
  CallKit: { HandleType: { Generic: string; PhoneNumber: string } };
  Voice: {
    new (): TwilioVoice;
    Event: { CallInvite: string; Error: string };
  };
};

type ConferenceCallParams = {
  inboxId?: number;
  conversationId?: number;
  callSid?: string;
};

export type NativeVoiceEvent =
  | {
      type: 'incoming';
      callSid: string;
      from: string;
      to: string;
      inboxId?: number;
      conversationId?: number;
    }
  | { type: 'accepted'; callSid: string }
  | { type: 'rejected'; callSid: string }
  | { type: 'cancelled'; callSid: string }
  | { type: 'disconnected'; callSid?: string };

type NativeVoiceEventListener = (event: NativeVoiceEvent) => void;
type TwilioVoiceModuleLoader = (name: string) => TwilioVoiceModule;

const toNumber = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const firstPresent = (parameters: Record<string, string>, keys: string[]) =>
  keys.map(key => parameters[key]).find(value => value !== undefined && value !== '');

const extractConferenceParams = (callInvite: TwilioCallInvite): ConferenceCallParams => {
  const parameters = callInvite.getCustomParameters();

  return {
    inboxId: toNumber(firstPresent(parameters, ['inbox_id', 'inboxId'])),
    conversationId: toNumber(firstPresent(parameters, ['conversation_id', 'conversationId'])),
    callSid:
      firstPresent(parameters, ['call_sid', 'callSid', 'provider_call_id', 'providerCallId']) ||
      callInvite.getCallSid(),
  };
};

const loadTwilioVoiceModule = () => {
  const dynamicRequire = eval('require') as TwilioVoiceModuleLoader;
  return dynamicRequire(TWILIO_VOICE_MODULE);
};

class NativeVoiceRegistrationService {
  private voice: TwilioVoice | null = null;
  private twilioModule: TwilioVoiceModule | null = null;
  private isConfigured = false;
  private registrationKey = '';
  private registeredTokensByInboxId = new Map<number, string>();
  private listeners = new Set<NativeVoiceEventListener>();

  subscribe(listener: NativeVoiceEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async syncTwilioVoiceRegistrations({
    accountId,
    inboxes,
  }: {
    accountId?: number;
    inboxes: Inbox[];
  }) {
    if (Platform.OS !== 'ios' || !isNativeVoiceEnabled) return;

    const voiceInboxes = inboxes.filter(isTwilioVoiceInbox);
    const nextRegistrationKey = `${accountId || 'none'}:${voiceInboxes
      .map(inbox => inbox.id)
      .sort((a, b) => a - b)
      .join(',')}`;

    if (!accountId || voiceInboxes.length === 0) {
      await this.unregisterAll();
      return;
    }

    if (this.registrationKey === nextRegistrationKey) return;

    await this.unregisterAll();
    await this.configureVoice();

    await Promise.all(
      voiceInboxes.map(async inbox => {
        const response = await voiceApiService.getToken(inbox.id);
        if (!response.token) return;

        await this.voice?.register(response.token);
        this.registeredTokensByInboxId.set(inbox.id, response.token);
      }),
    );

    this.registrationKey = nextRegistrationKey;
  }

  async unregisterAll() {
    if (!this.voice || this.registeredTokensByInboxId.size === 0) {
      this.registrationKey = '';
      return;
    }

    const tokens = Array.from(this.registeredTokensByInboxId.values());
    this.registeredTokensByInboxId.clear();
    this.registrationKey = '';

    await Promise.all(tokens.map(token => this.voice?.unregister(token)));
  }

  private async configureVoice() {
    const voice = await this.getVoice();
    if (this.isConfigured) return;

    const { Voice, CallInvite, Call, CallKit } = await this.getTwilioModule();
    this.attachVoiceListeners({ Voice, CallInvite, Call });

    await voice.setCallKitConfiguration({
      callKitIconTemplateImageData: '',
      callKitIncludesCallsInRecents: true,
      callKitMaximumCallGroups: 2,
      callKitMaximumCallsPerCallGroup: 1,
      callKitRingtoneSound: '',
      callKitSupportedHandleTypes: [CallKit.HandleType.PhoneNumber, CallKit.HandleType.Generic],
    });
    await voice.initializePushRegistry();

    this.isConfigured = true;
  }

  private async getVoice() {
    if (this.voice) return this.voice;

    const { Voice } = await this.getTwilioModule();
    this.voice = new Voice();
    return this.voice;
  }

  private async getTwilioModule() {
    if (this.twilioModule) return this.twilioModule;

    this.twilioModule = loadTwilioVoiceModule();
    return this.twilioModule;
  }

  private attachVoiceListeners({
    Voice,
    CallInvite,
    Call,
  }: {
    Voice: TwilioVoiceModule['Voice'];
    CallInvite: TwilioVoiceModule['CallInvite'];
    Call: TwilioVoiceModule['Call'];
  }) {
    this.voice?.on(Voice.Event.CallInvite, payload => {
      const callInvite = payload as TwilioCallInvite;
      const conferenceParams = extractConferenceParams(callInvite);
      const callSid = conferenceParams.callSid || callInvite.getCallSid();

      this.emit({
        type: 'incoming',
        callSid,
        from: callInvite.getFrom(),
        to: callInvite.getTo(),
        inboxId: conferenceParams.inboxId,
        conversationId: conferenceParams.conversationId,
      });

      callInvite.on(CallInvite.Event.Accepted, call => {
        this.emit({ type: 'accepted', callSid });
        this.joinConferenceIfPossible(conferenceParams);
        this.attachCallListeners({ call, Call });
      });
      callInvite.on(CallInvite.Event.Rejected, () => {
        this.emit({ type: 'rejected', callSid });
        this.leaveConferenceIfPossible(conferenceParams);
      });
      callInvite.on(CallInvite.Event.Cancelled, () => {
        this.emit({ type: 'cancelled', callSid });
      });
    });

    this.voice?.on(Voice.Event.Error, payload => {
      Sentry.captureException(payload);
    });
  }

  private attachCallListeners({
    call,
    Call,
  }: {
    call: TwilioCall;
    Call: TwilioVoiceModule['Call'];
  }) {
    call.on(Call.Event.Disconnected, () => {
      this.emit({ type: 'disconnected', callSid: call.getSid() });
    });
  }

  private joinConferenceIfPossible({ inboxId, conversationId, callSid }: ConferenceCallParams) {
    if (!inboxId || !conversationId || !callSid) return;

    voiceApiService.joinConference({ inboxId, conversationId, callSid }).catch(error => {
      Sentry.captureException(error);
    });
  }

  private leaveConferenceIfPossible({ inboxId, conversationId, callSid }: ConferenceCallParams) {
    if (!inboxId || !conversationId || !callSid) return;

    voiceApiService.leaveConference({ inboxId, conversationId, callSid }).catch(error => {
      Sentry.captureException(error);
    });
  }

  private emit(event: NativeVoiceEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const nativeVoiceRegistrationService = new NativeVoiceRegistrationService();
