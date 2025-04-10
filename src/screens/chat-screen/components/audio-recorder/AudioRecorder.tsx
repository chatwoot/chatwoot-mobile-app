import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { isUndefined } from 'lodash';
import * as Sentry from '@sentry/react-native';
import RNFetchBlob from 'rn-fetch-blob';

import { TEXT_INPUT_CONTAINER_HEIGHT } from '@/constants';
import { useChatWindowContext } from '@/context';
import { SendIcon, Trash } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next';
import { PauseIcon, PlayIcon } from '../message-components';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  addNewCachePath,
  selectLocalRecordedAudioCacheFilePaths,
} from '@/store/conversation/localRecordedAudioCacheSlice';

const RecorderSegmentWidth = Dimensions.get('screen').width - 8 - 80 - 12;

const millisecondsToTimeString = (milliseconds: number | undefined) => {
  if ((milliseconds && isNaN(milliseconds)) || isUndefined(milliseconds)) {
    return '00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(seconds).padStart(2, '0');

  return `${minutesString}:${secondsString}`;
};

export const AudioRecorder = ({
  onRecordingComplete,
}: {
  onRecordingComplete: (audioFile: File) => void;
}) => {
  const localRecordedAudioCacheFilePaths = useAppSelector(selectLocalRecordedAudioCacheFilePaths);
  const dispatch = useAppDispatch();
  const [isSending, setIsSending] = useState(false);
  const { setIsVoiceRecorderOpen } = useChatWindowContext();
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          const grants = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          );
          if (grants !== PermissionsAndroid.RESULTS.GRANTED) {
            return;
          }
        }

        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(newRecording);
        setIsAudioRecording(true);

        // Start recording duration timer
        const interval = setInterval(() => {
          setRecordingDuration(prev => prev + 1000);
        }, 1000);

        return () => {
          clearInterval(interval);
        };
      } catch (err) {
        console.warn(err);
        Alert.alert('Error', 'Failed to start recording');
        setIsVoiceRecorderOpen(false);
      }
    };

    requestPermissions();

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const deleteRecorder = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
    setIsVoiceRecorderOpen(false);
  };

  const toggleRecorder = async () => {
    if (!recording) return;

    if (isAudioRecording) {
      await recording.pauseAsync();
    } else {
      await recording.startAsync();
    }
    setIsAudioRecording(!isAudioRecording);
  };

  const sendRecordedMessage = async () => {
    if (isSending || !recording) return;
    setIsSending(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error('No recording URI found');
      }

      const cleanPath =
        Platform.select({
          ios: uri.replace('file://', ''),
          android: uri.replace(/\/\/+/g, '/'),
        }) || uri;

      const stats = await RNFetchBlob.fs.stat(cleanPath);

      const audioFile = {
        uri: Platform.OS === 'ios' ? `file://${cleanPath}` : cleanPath,
        originalPath: cleanPath,
        type: 'audio/mp3',
        fileName: `audio-${localRecordedAudioCacheFilePaths.length}.mp3`,
        name: `audio-${localRecordedAudioCacheFilePaths.length}.mp3`,
        fileSize: stats.size,
      };

      console.log('audioFile', audioFile);

      dispatch(addNewCachePath(cleanPath));
      setIsVoiceRecorderOpen(false);
      onRecordingComplete(audioFile as unknown as File);
    } catch (error) {
      Sentry.captureException(error);
      Alert.alert(
        'Error preparing audio file',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Animated.View
      exiting={SlideOutDown.damping(24).stiffness(180)}
      entering={SlideInDown.damping(24).stiffness(180)}
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
          {isAudioRecording ? (
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
          {millisecondsToTimeString(recordingDuration)}
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
