import React from 'react';
import { Alert, Linking, Platform, Pressable, Text } from 'react-native';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/hooks';
import { updateAttachments } from '@/store/conversation/sendMessageSlice';
import { useRefsContext } from '@/context';
import {
  // AIAssisst,
  AttachFileIcon,
  CameraIcon,
  // MacrosIcon,
  PhotosIcon,
  // VideoCall,
  // VoiceNote,
} from '../../svg-icons';
import { tailwind } from '../../theme';
import { useHaptic, useScaleAnimation } from '../../utils';
import { Icon } from '../common';

export const handleOpenPhotosLibrary = async dispatch => {
  if (Platform.OS === 'ios') {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ).then(async result => {
      if (RESULTS.BLOCKED === result) {
        Alert.alert(
          'Permission Denied',
          'The permission to access the photo library has been denied and cannot be requested again. Please enable it in your device settings if you wish to access photos from your library.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // Open app settings
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
      }
      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        const pickedAssets = await launchImageLibrary({
          quality: 1,
          selectionLimit: 4,
          mediaType: 'mixed',
          presentationStyle: 'formSheet',
        });
        if (pickedAssets.didCancel) {
        } else if (pickedAssets.errorCode) {
        } else {
          if (pickedAssets.assets && pickedAssets.assets?.length > 0) {
            dispatch(updateAttachments(pickedAssets.assets));
          }
        }
      }
    });
  } else {
    request(PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION).then(async result => {
      if (RESULTS.BLOCKED === result) {
        Alert.alert(
          'Permission Denied',
          'The permission to access the photo library has been denied and cannot be requested again. Please enable it in your device settings if you wish to access photos from your library.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // Open app settings
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
      }
      if (result === RESULTS.GRANTED) {
        const pickedAssets = await launchImageLibrary({
          quality: 1,
          selectionLimit: 4,
          mediaType: 'mixed',
          presentationStyle: 'formSheet',
        });
        if (pickedAssets.didCancel) {
        } else if (pickedAssets.errorCode) {
        } else {
          if (pickedAssets.assets && pickedAssets.assets?.length > 0) {
            updateAttachments(pickedAssets.assets);
          }
        }
      }
    });
  }
};

const handleLaunchCamera = async dispatch => {
  request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA).then(
    async result => {
      if (RESULTS.BLOCKED === result) {
        Alert.alert(
          'Permission Denied',
          'The permission to access the camera has been denied and cannot be requested again. Please enable it in your device settings if you wish to use the camera feature.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // Open app settings
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
      }
      if (RESULTS.GRANTED === result) {
        const imageResult = await launchCamera({
          presentationStyle: 'formSheet',
          mediaType: 'mixed',
        });
        if (imageResult.didCancel) {
        } else if (imageResult.errorCode) {
        } else {
          if (imageResult.assets && imageResult.assets?.length > 0) {
            updateAttachments(imageResult.assets);
          }
        }
      }
    },
  );
};

/**
 * Doing this so that the our Store Object Attachments is of single type - Asset from Image Picker Library
 * The function `mapObject` takes an object of type `DocumentPickerResponse` and returns an array of
 * `Asset` objects with properties `fileName`, `fileSize`, `type`, and `uri`.
 * @param {DocumentPickerResponse} originalObject - The originalObject parameter is of type
 * DocumentPickerResponse.
 * @returns The function `mapObject` is returning an array of `Asset` objects.
 */
const mapObject = (originalObject: DocumentPickerResponse): Asset[] => {
  return [
    {
      fileName: originalObject.name || '',
      fileSize: originalObject.size || 0,
      type: originalObject.type || '',
      uri: originalObject.uri || '',
    },
  ];
};

const handleAttachFile = async dispatch => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf], // You can specify the file types you want to allow
      presentationStyle: 'formSheet',
    });
    updateAttachments(mapObject(result[0]));
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker
    } else {
      throw err;
    }
  }
};

const ADD_MENU_OPTIONS = [
  {
    icon: <PhotosIcon />,
    title: 'Photos',
    handlePress: handleOpenPhotosLibrary,
  },
  {
    icon: <CameraIcon />,
    title: 'Camera',
    handlePress: handleLaunchCamera,
  },
  {
    icon: <AttachFileIcon />,
    title: 'Attach File',
    handlePress: handleAttachFile,
  },
  // {
  //   icon: <AIAssisst />,
  //   title: 'AI Assist',
  //   handlePress: () => Alert.alert('AI Assist'),
  // },
  // {
  //   icon: <MacrosIcon />,
  //   title: 'Macros',
  //   handlePress: () => {},
  // },

  // {
  //   icon: <VoiceNote />,
  //   title: 'Voice Note',
  //   handlePress: () => Alert.alert('Voice Note'),
  // },
  // {
  //   icon: <VideoCall />,
  //   title: 'Video Call',
  //   handlePress: () => Alert.alert('Video Call'),
  // },
];

type MenuOptionProps = {
  index: number;
  menuOption: (typeof ADD_MENU_OPTIONS)[0];
};

const MenuOption = (props: MenuOptionProps) => {
  const { index, menuOption } = props;
  const dispatch = useAppDispatch();
  const { macrosListSheetRef } = useRefsContext();

  const { animatedStyle, handlers } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    menuOption?.handlePress(dispatch);
    if (menuOption.title === 'Macros') {
      macrosListSheetRef.current?.present();
    }
  };

  return (
    <Animated.View style={[tailwind.style('mb-3'), animatedStyle]}>
      <Pressable onPress={handlePress} {...handlers}>
        <Animated.View key={index} style={[tailwind.style('flex-row items-center justify-start')]}>
          <Animated.View style={tailwind.style('p-2')}>
            <Icon icon={menuOption.icon} size={24} />
          </Animated.View>
          <Text
            style={tailwind.style(
              'text-base font-inter-normal-24 leading-[18px] tracking-[0.24px] text-gray-950 pl-5',
            )}>
            {menuOption.title}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const CommandOptionsMenu = () => {
  const { bottom } = useSafeAreaInsets();
  const containerHeight = 352 + (bottom === 0 ? 16 : bottom);
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(38).stiffness(240)}
      exiting={SlideOutDown.springify().damping(38).stiffness(240)}
      style={tailwind.style('mx-1 pt-2 items-start', `h-[${containerHeight}px]`)}>
      {ADD_MENU_OPTIONS.map((menuOption, index) => {
        return <MenuOption key={menuOption.title} {...{ menuOption, index }} />;
      })}
    </Animated.View>
  );
};
