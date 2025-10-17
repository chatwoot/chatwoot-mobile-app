import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, Pressable } from 'react-native';
import AudioRecorderPlayer, {
  RecordBackType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
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
<<<<<<< HEAD
import { convertAacToWav } from '@/utils';

const RecorderSegmentWidth = Dimensions.get('screen').width - 8 - 80 - 12;

const ARPlayer = new AudioRecorderPlayer();

/**
 * ! Handling Audio Server Side
 * https://github.com/jsierles/react-native-audio/issues/107
 */

/**
 * The function `millisecondsToTimeString` converts a given number of milliseconds into a formatted
 * time string in the format "mm:ss".
 * @param {number} milliseconds - The `milliseconds` parameter is a number representing the duration in
 * milliseconds that you want to convert to a time string.
 * @returns The function `millisecondsToTimeString` returns a string in the format "mm:ss", where "mm"
 * represents the minutes and "ss" represents the seconds.
 */
const millisecondsToTimeString = (milliseconds: number | undefined) => {
  // Check if the input is not a valid number or is negative
  if ((milliseconds && isNaN(milliseconds)) || isUndefined(milliseconds)) {
    return '00:00';
  }

  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // Calculate the minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Create the time string with leading zeros
  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(seconds).padStart(2, '0');

  return `${minutesString}:${secondsString}`;
};

export const AudioRecorder = ({
  onRecordingComplete,
  audioFormat,
}: {
  onRecordingComplete: (audioFile: File) => void;
  audioFormat: 'audio/m4a' | 'audio/wav';
}) => {
  const localRecordedAudioCacheFilePaths = useAppSelector(selectLocalRecordedAudioCacheFilePaths);
  const dispatch = useAppDispatch();
  const [isSending, setIsSending] = useState(false);

  const { setIsVoiceRecorderOpen } = useChatWindowContext();

  const [isAudioRecording, setIsAudioRecording] = useState(false);

  const [recorderData, setRecorderData] = useState<RecordBackType | undefined>(undefined);

  useEffect(() => {
    const requestAndroidPermission = async () => {
      try {
        const grants = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        if (grants === PermissionsAndroid.RESULTS.GRANTED) {
          addRecorderListener();
        } else {
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    };
    const addRecorderListener = () => {
      ARPlayer.addRecordBackListener((recordingMeta: RecordBackType) => {
        setRecorderData(recordingMeta);
      });
      const dirs = RNFetchBlob.fs.dirs;
      const path = Platform.select({
        ios: `audio-${localRecordedAudioCacheFilePaths.length}.m4a`,
        android: `${dirs.CacheDir}/audio-${localRecordedAudioCacheFilePaths.length}.aac`,
      });

      ARPlayer.startRecorder(path, {
        AVFormatIDKeyIOS: AVEncodingOption.aac,
        AVNumberOfChannelsKeyIOS: 2,
        AVSampleRateKeyIOS: 44100,
        AudioSourceAndroid: 1, // MIC
        OutputFormatAndroid: 6, // AAC_ADTS
        AudioEncoderAndroid: 3, // AAC
        AudioSamplingRateAndroid: 16000,
        AudioEncodingBitRateAndroid: 128000,
        AudioChannelsAndroid: 2,
      })
        .then((value: string) => {
          if (value) {
            setIsAudioRecording(true);
          }
        })
        .catch(error => {
          Alert.alert(
            'Error preparing audio file',
            error instanceof Error ? error.message : String(error),
          );
          deleteRecorder();
        });
    };
    if (Platform.OS === 'android') {
      requestAndroidPermission();
    } else {
      addRecorderListener();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteRecorder = async () => {
    await ARPlayer.stopRecorder();
    setIsVoiceRecorderOpen(false);
  };

  const createAudioFile = async (value: string) => {
    const cleanPath =
      Platform.select({
        ios: value.replace('file://', ''),
        android: value.replace(/\/\/+/g, '/'),
      }) || value;
    let finalPath = cleanPath;
    const stats = await RNFetchBlob.fs.stat(finalPath);

    if (Platform.OS === 'android') {
      return {
        uri: finalPath,
        originalPath: finalPath,
        type: 'audio/aac',
        fileName: `audio-${localRecordedAudioCacheFilePaths.length}.aac`,
        name: `audio-${localRecordedAudioCacheFilePaths.length}.aac`,
        fileSize: stats.size,
      };
    }

    const finalExtension = audioFormat === 'audio/wav' ? 'wav' : 'm4a';

    if (audioFormat === 'audio/wav') {
      finalPath = await convertAacToWav(cleanPath);
      finalPath = finalPath.replace('file://', '');
    }

    const audioFile = {
      uri: Platform.OS === 'ios' ? `file://${finalPath}` : finalPath,
      originalPath: finalPath,
      type: audioFormat,
      fileName: `audio-${localRecordedAudioCacheFilePaths.length}.${finalExtension}`,
      name: `audio-${localRecordedAudioCacheFilePaths.length}.${finalExtension}`,
      fileSize: stats.size,
    };

    return audioFile;
  };

  const sendRecordedMessage = () => {
    if (isSending) return;
    setIsSending(true);
    ARPlayer.stopRecorder()
      .then(async value => {
        try {
          const audioFile = await createAudioFile(value);
          dispatch(addNewCachePath(audioFile.originalPath));
          setIsVoiceRecorderOpen(false);
          onRecordingComplete(audioFile as unknown as File);
        } catch (error) {
          Sentry.captureException(error);
          Alert.alert(
            'Error preparing audio file',
            error instanceof Error ? error.message : String(error),
          );
        }
      })
      .catch(e => {
        console.error('Recording error:', e);
        Alert.alert('Recording Error', e.toString());
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  const toggleRecorder = async () => {
    if (isAudioRecording) {
      await ARPlayer.pauseRecorder();
    } else {
      await ARPlayer.resumeRecorder();
    }

    setIsAudioRecording(!isAudioRecording);
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
          {millisecondsToTimeString(recorderData?.currentPosition)}
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
