import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, View, Text, Platform, Linking } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import * as WebBrowser from 'expo-web-browser';
import ChatWootWidget from '@chatwoot/react-native-widget';
import { useDispatch, useSelector } from 'react-redux';
import * as Application from 'expo-application';
import { Account } from '@/types';
import { clearContacts } from '@/reducer/contactSlice';
import { clearAllConversations } from '@/reducer/conversationSlice';

import i18n from 'i18n';

import { HELP_URL } from '@/constants/url';

import { tailwind } from '@/theme';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  BottomSheetWrapper,
  FullWidthButton,
  SettingsList,
  LanguageList,
  AvailabilityStatusList,
  NotificationPreferences,
  SwitchAccount,
} from '@/components-next';

import { LANGUAGES, TAB_BAR_HEIGHT, userStatusList } from '@/constants';
import { useRefsContext } from '@/context';
import { ChatwootIcon, NotificationIcon, SwitchIcon, TranslateIcon } from '@/svg-icons';
import { GenericListType } from '@/types';

import { useHaptic } from '@/utils';
import { SettingsHeader } from './SettingsHeader';
import {
  selectCurrentUserAvailability,
  selectUser,
  actions as authActions,
  selectAccounts,
  setAccount,
  logout,
} from '@/reducer/authSlice';
import { selectLocale, setLocale, actions as settingsActions } from '@/reducer/settingsSlice';
import AnalyticsHelper from '@/helpers/AnalyticsHelper';
import { PROFILE_EVENTS } from '@/constants/analyticsEvents';
import { getUserPermissions } from '@/helpers/permissionHelper';
import { CONVERSATION_PERMISSIONS } from '@/constants/permissions';

const appName = Application.applicationName;
const appVersion = Application.nativeApplicationVersion;

const buildNumber = Application.nativeBuildVersion;
const appVersionDetails = buildNumber ? `${appVersion} (${buildNumber})` : appVersion;

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const availabilityStatus = useSelector(selectCurrentUserAvailability) || 'offline';
  // const { bottom } = useSafeAreaInsets();

  const [showWidget, toggleWidget] = useState(false);
  const user = useSelector(selectUser);
  const {
    name,
    email,
    avatar_url: avatarUrl,
    identifier_hash: identifierHash,
    account_id: activeAccountId,
  } = user;

  useEffect(() => {
    // TODO: Fix this later
    // @ts-expect-error TODO: Fix typing for dispatch
    dispatch(settingsActions.getNotificationSettings());
  }, [dispatch]);

  const userPermissions = getUserPermissions(user, activeAccountId);

  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  const userDetails = {
    identifier: email,
    name,
    avatar_url: avatarUrl,
    email,
    identifier_hash: identifierHash,
  };

  const customAttributes = {
    originatedFrom: 'mobile-app',
    appName,
    appVersion: appVersionDetails,
    deviceId: DeviceInfo.getDeviceId(),
    packageName: appName,
    operatingSystem: Platform.OS, // android/ios
  };

  const accounts = useSelector(selectAccounts);

  const activeAccountName = accounts.length
    ? accounts.find((account: Account) => account.id === activeAccountId).name
    : '';

  // const enableAccountSwitch = accounts.length > 1;
  const enableAccountSwitch = true;

  const activeLocale = useSelector(selectLocale);
  const {
    userAvailabilityStatusSheetRef,
    languagesModalSheetRef,
    notificationPreferencesSheetRef,
    switchAccountSheetRef,
  } = useRefsContext();

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

  const changeAvailabilityStatus = (updatedStatus: string) => {
    AnalyticsHelper.track(PROFILE_EVENTS.TOGGLE_AVAILABILITY_STATUS, {
      from: availabilityStatus,
      to: updatedStatus,
    });
    // TODO: Fix this later
    // @ts-expect-error TODO: Fix typing for dispatch
    dispatch(authActions.updateAvailability({ availability: updatedStatus }));
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const changeAccount = (accountId: number) => {
    dispatch(clearContacts());
    dispatch(clearAllConversations());
    dispatch(setAccount(accountId));
    // TODO: Fix this later
    // @ts-expect-error TODO: Fix typing for dispatch
    dispatch(authActions.setActiveAccount({ accountId }));
    navigation.dispatch(StackActions.replace('Tab'));
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

  const openURL = async () => {
    await WebBrowser.openBrowserAsync(HELP_URL);
  };

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const onClickLogout = useCallback(async () => {
    await AsyncStorage.removeItem('cwCookie');
    // TODO: Add action to remove FCM token
    dispatch(logout());
  }, [dispatch]);

  const preferencesList: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHANGE_AVAILABILITY'),
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: () => openSheet(),
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.NOTIFICATIONS'),
      icon: <NotificationIcon />,
      subtitle: 'Enabled',
      subtitleType: 'light',
      disabled: !hasConversationPermission,
      onPressListItem: () => notificationPreferencesSheetRef.current?.present(),
      // onPressListItem: openSystemSettings,
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHANGE_LANGUAGE'),
      icon: <TranslateIcon />,
      subtitle: LANGUAGES[activeLocale as keyof typeof LANGUAGES],
      subtitleType: 'light',
      onPressListItem: () => languagesModalSheetRef.current?.present(),
    },
    {
      hasChevron: enableAccountSwitch,
      title: i18n.t('SETTINGS.SWITCH_ACCOUNT'),
      icon: <SwitchIcon />,
      subtitle: activeAccountName,
      subtitleType: 'light',
      onPressListItem: () => {
        if (enableAccountSwitch) {
          switchAccountSheetRef.current?.present();
        }
      },
    },
  ];

  const supportList: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.READ_DOCS'),
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: openURL,
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHAT_WITH_US'),
      icon: <ChatwootIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: () => toggleWidget(true),
    },
  ];

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white font-inter-400-20')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <SettingsHeader />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}>
        <Animated.View style={tailwind.style('flex justify-center items-center pt-4 gap-4')}>
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
          <Animated.View style={tailwind.style('flex flex-col items-center gap-1')}>
            <Animated.Text
              style={tailwind.style('text-[22px] font-inter-580-24 leading-[22px] text-gray-950')}>
              {name}
            </Animated.Text>
            <Animated.Text
              style={tailwind.style(
                'text-[15px] font-inter-420-20 leading-[17.25px] text-gray-900',
              )}>
              {email}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
        <Animated.View style={tailwind.style('pt-6')}>
          <SettingsList sectionTitle={i18n.t('SETTINGS.PREFERENCES')} list={preferencesList} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-6')}>
          <SettingsList sectionTitle={i18n.t('SETTINGS.SUPPORT')} list={supportList} />
        </Animated.View>
        <Animated.View style={tailwind.style('pt-6')}>
          <FullWidthButton
            text={i18n.t('SETTINGS.LOGOUT')}
            isDestructive
            handlePress={onClickLogout}
          />
        </Animated.View>
        <View style={tailwind.style('p-4 items-center')}>
          <Text style={tailwind.style('text-sm text-gray-700 ')}>
            {`${appName} ${appVersionDetails}`}
          </Text>
        </View>
      </Animated.ScrollView>
      <BottomSheetModal
        ref={userAvailabilityStatusSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        enablePanDownToClose
        animationConfigs={animationConfigs}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={[190]}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_AVAILABILITY')} />
          <AvailabilityStatusList
            changeAvailabilityStatus={changeAvailabilityStatus}
            availabilityStatus={availabilityStatus}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={languagesModalSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['70%']}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={notificationPreferencesSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['52%']}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.NOTIFICATION_PREFERENCES')} />
          <NotificationPreferences />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={switchAccountSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        detached
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        snapPoints={['50%']}>
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SWITCH_ACCOUNT')} />
          <SwitchAccount
            currentAccountId={activeAccountId}
            changeAccount={changeAccount}
            accounts={accounts}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
      {!!process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN &&
        !!process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL &&
        !!showWidget && (
          <ChatWootWidget
            websiteToken={process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN}
            locale="en"
            baseUrl={process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL}
            closeModal={() => toggleWidget(false)}
            isModalVisible={showWidget}
            user={userDetails}
            customAttributes={customAttributes}
          />
        )}
    </SafeAreaView>
  );
};

export default SettingsScreen;
