import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable } from 'react-native';
import {
  requestRecordingPermissionsAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { TEXT_INPUT_CONTAINER_HEIGHT } from '@/constants';
import { useChatWindowContext } from '@/context';
import { SendIcon, Trash } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next';
import i18n from '@/i18n';
import { disableRecordingAudioMode, enableRecordingAudioMode } from '@/utils/audioSession';

import { PauseIcon, PlayIcon } from '../message-components';
import { claimPlayback, releasePlayback } from '../message-components/audioPlaybackController';
import { RecordedAudioFormat, recordedAudioFile, recordingOptionsFor } from './recordingOptions';

const RecorderSegmentWidth = Dimensions.get('screen').width - 8 - 80 - 12;

const RECORDER_STATE_INTERVAL_MS = 250;

const millisecondsToTimeString = (milliseconds: number) => {
  const totalSeconds = Math.floor(Math.max(milliseconds, 0) / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const AudioRecorder = ({
  onRecordingComplete,
  audioFormat,
}: {
  onRecordingComplete: (audioFile: File) => void;
  audioFormat: RecordedAudioFormat;
}) => {
  const { setIsVoiceRecorderOpen } = useChatWindowContext();
  const [isSending, setIsSending] = useState(false);

  const recorder = useAudioRecorder(recordingOptionsFor(audioFormat));
  const recorderState = useAudioRecorderState(recorder, RECORDER_STATE_INTERVAL_MS);
  // Recording starts as soon as the recorder opens; a bubble that was playing
  // is paused for as long as the recorder holds playback.
  const playbackOwner = useRef({ pause: () => {} }).current;

  useEffect(() => {
    let active = true;

    const startRecording = async () => {
      try {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          if (active) {
            Alert.alert(i18n.t('CONVERSATION.MICROPHONE_PERMISSION_DENIED'));
            setIsVoiceRecorderOpen(false);
          }
          return;
        }
        await enableRecordingAudioMode();
        await recorder.prepareToRecordAsync();
        if (!active) {
          return;
        }
        claimPlayback(playbackOwner);
        recorder.record();
      } catch (error) {
        Sentry.captureException(error);
        if (active) {
          Alert.alert(
            i18n.t('CONVERSATION.RECORDING_ERROR'),
            error instanceof Error ? error.message : String(error),
          );
          setIsVoiceRecorderOpen(false);
        }
      }
    };
    startRecording();

    return () => {
      active = false;
      releasePlayback(playbackOwner);
      disableRecordingAudioMode();
    };
    // The recorder is created once per mount; its options do not change afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteRecorder = async () => {
    if (recorder.isRecording) {
      await recorder.stop();
    }
    setIsVoiceRecorderOpen(false);
  };

  const sendRecordedMessage = async () => {
    if (isSending) {
      return;
    }
    setIsSending(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        throw new Error('Recording finished without a file');
      }
      const stats = await ReactNativeBlobUtil.fs.stat(uri.replace(/^file:\/+/, '/'));
      const audioFile = recordedAudioFile(uri, audioFormat, Number(stats.size));
      setIsVoiceRecorderOpen(false);
      onRecordingComplete(audioFile as unknown as File);
    } catch (error) {
      Sentry.captureException(error);
      Alert.alert(
        i18n.t('CONVERSATION.RECORDING_ERROR'),
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecorder = () => {
    if (recorderState.isRecording) {
      recorder.pause();
    } else {
      claimPlayback(playbackOwner);
      recorder.record();
    }
  };

  return (
    <Animated.View
      exiting={SlideOutDown.mass(1).damping(18).stiffness(105)}
      entering={SlideInDown.mass(1).damping(18).stiffness(105)}
      style={tailwind.style(
        'px-1 flex flex-row items-center overflow-hidden',
        `max-h-[${TEXT_INPUT_CONTAINER_HEIGHT}px]`,
      )}>
      <Pressable
        onPress={deleteRecorder}
        style={tailwind.style('h-10 w-10 flex items-center justify-center')}>
        <Icon icon={<Trash />} size={28} />
      </Pressable>
      <Animated.View
        style={tailwind.style(
          'bg-blue-800 px-3 py-[7px] rounded-2xl min-h-9 flex flex-row items-center justify-between mx-1.5',
          `w-[${RecorderSegmentWidth}px]`,
        )}>
        <Pressable onPress={toggleRecorder} hitSlop={12}>
          {recorderState.isRecording ? (
            <Animated.View>
              <Icon icon={<PauseIcon fill={'white'} />} />
            </Animated.View>
          ) : (
            <Animated.View>
              <Icon icon={<PlayIcon fill={'white'} />} />
            </Animated.View>
          )}
        </Pressable>
        <Animated.Text
          style={tailwind.style(
            'text-xs leading-[14px] font-inter-420-20 tracking-[0.32px] text-whiteA-A12',
          )}>
          {millisecondsToTimeString(recorderState.durationMillis)}
        </Animated.Text>
      </Animated.View>
      <Pressable
        disabled={isSending}
        onPress={sendRecordedMessage}
        style={tailwind.style('h-10 w-10 flex items-center justify-center')}>
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center h-7 w-7 rounded-full bg-blue-800',
          )}>
          <Icon icon={<SendIcon />} size={16} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
