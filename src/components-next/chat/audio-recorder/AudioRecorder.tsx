import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, Pressable } from 'react-native';
import AudioRecorderPlayer, { RecordBackType } from 'react-native-audio-recorder-player';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { isUndefined } from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';

import { TEXT_INPUT_CONTAINER_HEIGHT } from '@/constants';
import { useChatWindowContext } from '@/context';
import { useLocalRecordedAudioCache } from '@/storev2';
import { SendIcon, Trash } from '@/svg-icons';
import { tailwind } from '@/theme';
// import { constructAudioMessage } from '@/utils';
import { Icon } from '@/components-next/common';
import { PauseIcon, PlayIcon } from '@/components-next/chat/message-components';

const RecorderSegmentWidth = Dimensions.get('screen').width - 8 - 80 - 12;

const ARPlayer = new AudioRecorderPlayer();

/**
 * ! Handling Audio Server Side
 * https://github.com/jsierles/react-native-audio/issues/107
 */

/**
 * CHAT GPT Generate Function
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

export const AudioRecorder = () => {
  // const { addNewMessage } = useMessageList();
  const { localRecordedAudioCacheFilePaths, addNewCachePath } = useLocalRecordedAudioCache();

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
      let dirs = RNFetchBlob.fs.dirs;
      let path = Platform.select({
        ios: `audio-${localRecordedAudioCacheFilePaths.length}.m4a`,
        android: `${dirs.CacheDir}/audio-${localRecordedAudioCacheFilePaths.length}.mp3`,
      });

      ARPlayer.startRecorder(path)
        .then((value: string) => {
          if (value) {
            setIsAudioRecording(true);
          }
        })
        .catch(e => {
          Alert.alert(e);
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

  const { setIsVoiceRecorderOpen } = useChatWindowContext();

  const [isAudioRecording, setIsAudioRecording] = useState(false);

  const [recorderData, setRecorderData] = useState<RecordBackType | undefined>(undefined);

  const deleteRecorder = async () => {
    await ARPlayer.stopRecorder();
    setIsVoiceRecorderOpen(false);
  };

  const sendRecordedMessage = () => {
    ARPlayer.stopRecorder()
      .then(value => {
        /**
         * Attaching the meessage object with the Audio Message,
         * the Audio File is a local cache, so we might have to upload the file to server,
         * because the cache file gets overwritten
         */
        // addNewMessage(constructAudioMessage(value));
        addNewCachePath(value);
        setIsVoiceRecorderOpen(false);
      })
      .catch(e => {
        Alert.alert(e);
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
