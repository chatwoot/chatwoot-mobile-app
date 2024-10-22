/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';

import { tailwind } from '@/theme';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  BottomSheetWrapper,
  FullWidthButton,
  GenericList,
  LanguagesList,
  UserStatusList,
} from '@/components-next';

import { LANGUAGES, TAB_BAR_HEIGHT, userStatusList } from '@/constants';
import { useRefsContext } from '@/context';
import { ChatwootIcon, NotificationIcon, SwitchIcon, TranslateIcon } from '@/svg-icons';
import { GenericListType } from '@/types';

import { useHaptic } from '@/utils';
import { SettingsHeaderComponent } from './SettingsHeader';
import {
  selectCurrentUserAvailability,
  selectUser,
  actions as authActions,
} from '@/reducer/authSlice';
import { selectLocale, setLocale } from '@/reducer/settingsSlice';
import AnalyticsHelper from '@/helpers/AnalyticsHelper';
import { PROFILE_EVENTS } from '@/constants/analyticsEvents';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const availabilityStatus = useSelector(selectCurrentUserAvailability) || 'offline';
  const { bottom } = useSafeAreaInsets();

  const user = useSelector(selectUser);
  const {
    name,
    avatar_url: avatarUrl,
    email,
    // identifier_hash: identifierHash,
    // account_id: activeAccountId,
  } = user;

  const activeLocale = useSelector(selectLocale);

  const { userAvailabilityStatusSheetRef, languagesModalSheetRef } = useRefsContext();
  const hapticSelection = useHaptic();

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const openSheet = () => {
    hapticSelection?.();
    userAvailabilityStatusSheetRef.current?.present();
  };

  const changeUserAvailabilityStatus = (updatedStatus: string) => {
    AnalyticsHelper.track(PROFILE_EVENTS.TOGGLE_AVAILABILITY_STATUS, {
      from: availabilityStatus,
      to: updatedStatus,
    });
    // TODO: Fix this later
    // @ts-ignore
    dispatch(authActions.updateAvailability({ availability: updatedStatus }));
  };

  useEffect(() => {
    userAvailabilityStatusSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityStatus]);

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  const getBgColorBasedOnStatus = () => {
    return userStatusList.find(value => value.status === availabilityStatus)?.statusColor || '';
  };

  const preferencesList: GenericListType[] = [
    {
      hasChevron: true,
      title: 'Switch Account',
      icon: <SwitchIcon />,
      subtitle: 'Timeless',
      subtitleType: 'light',
      onPressListItem: () => null,
    },
    {
      hasChevron: true,
      title: 'Notification Preferences',
      icon: <NotificationIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: () => null,
    },
    // {
    //   hasChevron: true,
    //   title: 'Personal Information',
    //   icon: <UserIcon />,
    //   subtitle: '',
    //   subtitleType: 'light',
    //   onPressListItem: () => null,
    // },
    {
      hasChevron: true,
      title: 'Language',
      icon: <TranslateIcon />,
      subtitle: LANGUAGES[activeLocale as keyof typeof LANGUAGES],
      subtitleType: 'light',
      onPressListItem: () => languagesModalSheetRef.current?.present(),
    },
  ];

  const supportList: GenericListType[] = [
    {
      hasChevron: true,
      title: 'Read Docs',
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
    },
    {
      hasChevron: true,
      title: 'Chat with us',
      icon: <ChatwootIcon />,
      subtitle: '',
      subtitleType: 'light',
    },
  ];
  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <SettingsHeaderComponent handleSetStatusPress={openSheet} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}>
        <Animated.View style={tailwind.style('flex justify-center items-center pt-8')}>
          <Animated.View>
            <Image style={tailwind.style('h-24 w-24 rounded-full')} source={{ uri: avatarUrl }} />
            <Animated.View
              style={tailwind.style(
                'absolute border-[2px] border-white rounded-full -bottom-[2px] right-[10px]',
              )}>
              <Animated.View
                style={tailwind.style('h-4 w-4 rounded-full', getBgColorBasedOnStatus())}
              />
            </Animated.View>
          </Animated.View>
          <Animated.Text
            style={tailwind.style(
              'text-[22px] font-inter-580-24 pt-4 leading-[22px] text-gray-950',
            )}>
            {name}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style(
              'text-[16px] font-inter-420-20 pt-2 leading-[21px] text-gray-950',
            )}>
            {email}
          </Animated.Text>
        </Animated.View>
        <Animated.View style={tailwind.style('pt-14')}>
          <GenericList sectionTitle="Preferences" list={preferencesList} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-10')}>
          <GenericList sectionTitle="Support" list={supportList} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-8')}>
          <FullWidthButton text={`Log Out Timeless`} isDestructive />
        </Animated.View>
      </Animated.ScrollView>
      <BottomSheetModal
        ref={userAvailabilityStatusSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('mx-3 rounded-[26px] overflow-hidden')}
        snapPoints={[173]}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText="Set yourself as" />
          <UserStatusList
            changeUserAvailabilityStatus={changeUserAvailabilityStatus}
            availabilityStatus={availabilityStatus}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('mx-3 rounded-[26px] overflow-hidden')}
        snapPoints={['70%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText="Set Language" />
          <LanguagesList />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default SettingsScreen;
