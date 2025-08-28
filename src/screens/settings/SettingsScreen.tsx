import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, Text, Platform, Pressable } from 'react-native';
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
import ChatWootWidget from '@chatwoot/react-native-widget';
import { useSelector } from 'react-redux';
import * as Application from 'expo-application';
import { Account, AvailabilityStatus } from '@/types';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { resetNotifications } from '@/store/notification/notificationSlice';
import { clearAllContacts } from '@/store/contact/contactSlice';

import i18n from 'i18n';
import { tailwind } from '@/theme';
import { useThemedStyles } from '@/hooks';

import {
  BottomSheetBackdrop,
  BottomSheetHeader,
  BottomSheetWrapper,
  Button,
  LanguageList,
  AvailabilityStatusList,
  NotificationPreferences,
  SwitchAccount,
  SettingsList,
} from '@/components-next';
import { UserAvatar } from './components/UserAvatar';
import { BuildInfo } from '@/components-next/common';

import { LANGUAGES, TAB_BAR_HEIGHT } from '@/constants';
import { useRefsContext, useTheme } from '@/context';
import { ChatwootIcon, NotificationIcon, SwitchIcon, TranslateIcon, ThemeIcon } from '@/svg-icons';
import { GenericListType } from '@/types';

import { useHaptic } from '@/utils';
import { SettingsHeader } from './SettingsHeader';
import { DebugActions } from './components/DebugActions';
import {
  selectCurrentUserAvailability,
  selectUser,
  selectAccounts,
} from '@/store/auth/authSelectors';
import { logout, setAccount } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import {
  selectLocale,
  //selectIsChatwootCloud,
  selectPushToken,
} from '@/store/settings/settingsSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { setLocale } from '@/store/settings/settingsSlice';

import AnalyticsHelper from '@/utils/analyticsUtils';
import { PROFILE_EVENTS } from '@/constants/analyticsEvents';
import { getUserPermissions } from '@/utils/permissionUtils';
import { CONVERSATION_PERMISSIONS } from '@/constants/permissions';
import { useAppDispatch, useAppSelector } from '@/hooks';

const appName = Application.applicationName;
const appVersion = Application.nativeApplicationVersion;

const buildNumber = Application.nativeBuildVersion;
const appVersionDetails = buildNumber
  ? `Version: ${appVersion} \n Build Number: ${buildNumber}`
  : `Version: ${appVersion}`;

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const availabilityStatus =
    (useSelector(selectCurrentUserAvailability) as AvailabilityStatus) || 'offline';

  // const { bottom } = useSafeAreaInsets();

  const [showWidget, toggleWidget] = useState(false);
  const user = useSelector(selectUser);
  const {
    name,
    email,
    avatar_url: avatarUrl,
    identifier_hash: identifierHash,
    account_id: activeAccountId,
  } = user || {};

  useEffect(() => {
    dispatch(settingsActions.getNotificationSettings());
  }, [dispatch]);

  const pushToken = useAppSelector(selectPushToken);

  const userPermissions = user ? getUserPermissions(user, activeAccountId) : [];

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

  // `const isChatwootCloud = useAppSelector(selectIsChatwootCloud);

  // const chatwootInstance = isChatwootCloud ? `${appName} cloud` : `${appName} self-hosted`;

  const accounts = useSelector(selectAccounts) || [];

  const activeAccountName = accounts.length
    ? accounts.find((account: Account) => account.id === activeAccountId)?.name || ''
    : '';

  const enableAccountSwitch = accounts.length > 1;

  const activeLocale = useSelector(selectLocale);
  const {
    userAvailabilityStatusSheetRef,
    languagesModalSheetRef,
    notificationPreferencesSheetRef,
    switchAccountSheetRef,
    debugActionsSheetRef,
  } = useRefsContext();

  const { theme, setTheme, isDark } = useTheme();
  const themedTailwind = useThemedStyles();
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
    const payload = { profile: { availability: updatedStatus, account_id: activeAccountId } };
    // TODO: Fix this later
    // @ts-expect-error TODO: Fix typing for dispatch
    dispatch(authActions.updateAvailability(payload));
  };

  const onChangeLanguage = (locale: string) => {
    dispatch(setLocale(locale));
  };

  const changeAccount = (accountId: number) => {
    dispatch(clearAllContacts());
    dispatch(clearAllConversations());
    dispatch(resetNotifications());
    dispatch(setAccount(accountId));
    dispatch(authActions.setActiveAccount({ profile: { account_id: accountId } }));
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

  //  const openURL = async () => {
  //    await WebBrowser.openBrowserAsync(HELP_URL);
  //    };

  // const openSystemSettings = () => {
  //   if (Platform.OS === 'ios') {
  //     Linking.openURL('app-settings:');
  //   } else {
  //     Linking.openSettings();
  //   }
  // };

  const onClickLogout = useCallback(async () => {
    await AsyncStorage.removeItem('cwCookie');
    await dispatch(settingsActions.removeDevice({ pushToken }));
    dispatch(logout());
  }, [dispatch, pushToken]);

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return i18n.t('SETTINGS.THEME_LIGHT');
      case 'dark':
        return i18n.t('SETTINGS.THEME_DARK');
      case 'system':
        return i18n.t('SETTINGS.THEME_SYSTEM');
      default:
        return i18n.t('SETTINGS.THEME_SYSTEM');
    }
  };

  const preferencesList: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHANGE_AVAILABILITY'),
      icon: <SwitchIcon stroke={isDark ? '#FFFFFF' : undefined} />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: () => openSheet(),
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.NOTIFICATIONS'),
      icon: <NotificationIcon stroke={isDark ? '#FFFFFF' : undefined} />,
      subtitle: '',
      subtitleType: 'light',
      disabled: !hasConversationPermission,
      onPressListItem: () => notificationPreferencesSheetRef.current?.present(),
      // onPressListItem: openSystemSettings,
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHANGE_LANGUAGE'),
      icon: <TranslateIcon stroke={isDark ? '#FFFFFF' : undefined} />,
      subtitle: LANGUAGES[activeLocale as keyof typeof LANGUAGES],
      subtitleType: 'light',
      onPressListItem: () => languagesModalSheetRef.current?.present(),
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.THEME'),
      icon: <ThemeIcon color={isDark ? '#FFFFFF' : undefined} />,
      subtitle: getThemeLabel(),
      subtitleType: 'light',
      onPressListItem: () => {
        // We'll create a simple action sheet for theme selection
        // For now, cycle through themes
        const themes = ['system', 'light', 'dark'] as const;
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
      },
    },
    {
      hasChevron: enableAccountSwitch,
      title: i18n.t('SETTINGS.SWITCH_ACCOUNT'),
      icon: <SwitchIcon stroke={isDark ? '#FFFFFF' : undefined} />,
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
    /* {
      hasChevron: true,
      title: i18n.t('SETTINGS.READ_DOCS'),
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: openURL,
    }, */
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHAT_WITH_US'),
      icon: <ChatwootIcon stroke={isDark ? '#FFFFFF' : undefined} />,
      subtitle: '',
      subtitleType: 'light',
      onPressListItem: () => toggleWidget(true),
    },
  ];

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={themedTailwind.style('flex-1 bg-white font-inter-normal-20')}
    >
      <StatusBar
        translucent
        backgroundColor={themedTailwind.color('bg-white')}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        navigationBarColor={themedTailwind.color('bg-white')}
        navigationBarHidden={false}
      />
      <SettingsHeader />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
      >
        <Animated.View style={tailwind.style('flex justify-center items-center pt-4 gap-4')}>
          <Animated.View>
            <UserAvatar src={avatarUrl} name={name} status={availabilityStatus} />
            <Animated.View
              style={themedTailwind.style(
                'absolute border-[2px] border-white rounded-full -bottom-[2px] right-[10px]',
              )}
            ></Animated.View>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-col items-center gap-1')}>
            <Animated.Text
              style={themedTailwind.style('text-[22px] font-inter-580-24 text-gray-950')}
            >
              {name}
            </Animated.Text>
            <Animated.Text
              style={themedTailwind.style(
                'text-[15px] font-inter-420-20 leading-[17.25px] text-gray-900',
              )}
            >
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
        <Animated.View style={tailwind.style('pt-6 mx-4')}>
          <Button
            variant="secondary"
            text={i18n.t('SETTINGS.LOGOUT')}
            isDestructive
            handlePress={onClickLogout}
          />
        </Animated.View>
        <Pressable
          style={tailwind.style('p-4 items-center')}
          onLongPress={() => debugActionsSheetRef.current?.present()}
        >
          <BuildInfo />
        </Pressable>
      </Animated.ScrollView>
      <BottomSheetModal
        ref={userAvailabilityStatusSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={themedTailwind.style('bg-black')}
        snapPoints={[190]}
      >
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
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={themedTailwind.style('bg-black')}
        snapPoints={['70%']}
      >
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={notificationPreferencesSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={themedTailwind.style('bg-black')}
        snapPoints={['52%']}
      >
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.NOTIFICATION_PREFERENCES')} />
          <NotificationPreferences />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={switchAccountSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        // TODO: Fix this later
        // bottomInset={bottom === 0 ? 12 : bottom}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={themedTailwind.style('bg-black')}
        snapPoints={['50%']}
      >
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SWITCH_ACCOUNT')} />
          <SwitchAccount
            currentAccountId={activeAccountId}
            changeAccount={changeAccount}
            accounts={accounts}
          />
        </BottomSheetWrapper>
      </BottomSheetModal>
      <BottomSheetModal
        ref={debugActionsSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        backgroundStyle={themedTailwind.style('bg-black')}
        snapPoints={['36%']}
      >
        <BottomSheetWrapper>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.DEBUG_ACTIONS')} />
          <DebugActions />
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
