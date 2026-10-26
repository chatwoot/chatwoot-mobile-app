import React, { useCallback, useEffect, useState } from 'react';
import {
  StatusBar,
  Text,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated from 'react-native-reanimated';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DeviceInfo from 'react-native-device-info';
import ChatWootWidget from '@chatwoot/react-native-widget';
import { useSelector } from 'react-redux';
import * as Application from 'expo-application';
import { Account, AvailabilityStatus } from '@/types';
import { switchAccount } from '@/utils/accountUtils';

import { RecentSearches } from '@/screens/search/utils/recentSearches';
import i18n from 'i18n';
import { HELP_URL } from '@/constants/url';
import { openURL } from '@/utils/urlUtils';
import { tailwind } from '@/theme';

import {
  BottomSheetHeader,
  Button,
  LanguageList,
  AvailabilityStatusList,
  NotificationPreferences,
  SwitchAccount,
  SettingsList,
} from '@/components-next';
import { Sheet } from '@/components-next/common/sheet/Sheet';
import { UserAvatar } from './components/UserAvatar';

import { LANGUAGES } from '@/constants';
import { useRefsContext } from '@/context';
import { ChatwootIcon, NotificationIcon, SwitchIcon, TranslateIcon } from '@/svg-icons';
import { GenericListType } from '@/types';

import { useHaptic, useIsSplitLayout, useTabBarHeight } from '@/utils';
import { SettingsHeader } from './SettingsHeader';
import { DebugActions } from './components/DebugActions';
import {
  selectCurrentUserAvailability,
  selectUser,
  selectAccounts,
} from '@/store/auth/authSelectors';
import { logout } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import {
  selectLocale,
  selectIsChatwootCloud,
  selectPushToken,
} from '@/store/settings/settingsSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { setLocale } from '@/store/settings/settingsSlice';

import AnalyticsHelper from '@/utils/analyticsUtils';
import { PROFILE_EVENTS } from '@/constants/analyticsEvents';
import { getUserPermissions } from '@/utils/permissionUtils';
import { CONVERSATION_PERMISSIONS } from '@/constants/permissions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { PaneHeader } from '@/navigation/split/PaneHeader';

const appName = Application.applicationName;
const appVersion = Application.nativeApplicationVersion;

const buildNumber = Application.nativeBuildVersion;
const appVersionDetails = buildNumber ? `${appVersion} (${buildNumber})` : appVersion;

// Settings shown in the detail pane of the split view (iPhone Duo), like iPad Settings.
type SettingsPane = 'availability' | 'notifications' | 'language' | 'account';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const isSplit = useIsSplitLayout();
  const { width } = useWindowDimensions();
  // The first item is selected by default so the detail pane is never empty.
  const [pane, setPane] = useState<SettingsPane>('availability');
  // In the split view rows open their options in the detail pane instead of a sheet.
  const openPane = (next: SettingsPane, openSheetInstead: () => void) => () => {
    if (isSplit) {
      hapticSelection?.();
      setPane(next);
    } else {
      openSheetInstead();
    }
  };
  const dispatch = useAppDispatch();
  const tabBarHeight = useTabBarHeight();
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

  // Refetch when the active account changes; notification settings are account-scoped.
  useEffect(() => {
    dispatch(settingsActions.getNotificationSettings());
  }, [dispatch, activeAccountId]);

  const pushToken = useAppSelector(selectPushToken);

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

  const isChatwootCloud = useAppSelector(selectIsChatwootCloud);

  const chatwootInstance = isChatwootCloud ? `${appName} cloud` : `${appName} self-hosted`;

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

  const hapticSelection = useHaptic();

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
    switchAccount(dispatch, accountId);
    navigation.dispatch(StackActions.replace('Tab'));
  };

  useEffect(() => {
    userAvailabilityStatusSheetRef.current?.dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityStatus]);

  useEffect(() => {
    languagesModalSheetRef.current?.dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  const openHelpCenter = () => {
    openURL({ URL: HELP_URL });
  };

  // const openSystemSettings = () => {
  //   if (Platform.OS === 'ios') {
  //     Linking.openURL('app-settings:');
  //   } else {
  //     Linking.openSettings();
  //   }
  // };

  const onClickLogout = useCallback(async () => {
    await AsyncStorage.removeItem('cwCookie');
    await RecentSearches.clearAll();
    await dispatch(settingsActions.removeDevice({ pushToken }));
    dispatch(logout());
  }, [dispatch, pushToken]);

  const preferencesList: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHANGE_AVAILABILITY'),
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
      isSelected: isSplit && pane === 'availability',
      onPressListItem: openPane('availability', openSheet),
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.NOTIFICATIONS'),
      icon: <NotificationIcon />,
      subtitle: '',
      subtitleType: 'light',
      disabled: !hasConversationPermission,
      isSelected: isSplit && pane === 'notifications',
      onPressListItem: openPane('notifications', () =>
        notificationPreferencesSheetRef.current?.present(),
      ),
      // onPressListItem: openSystemSettings,
    },
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.CHANGE_LANGUAGE'),
      icon: <TranslateIcon />,
      subtitle: LANGUAGES[activeLocale as keyof typeof LANGUAGES],
      subtitleType: 'light',
      isSelected: isSplit && pane === 'language',
      onPressListItem: openPane('language', () => languagesModalSheetRef.current?.present()),
    },
    {
      hasChevron: enableAccountSwitch,
      title: i18n.t('SETTINGS.SWITCH_ACCOUNT'),
      icon: <SwitchIcon />,
      subtitle: activeAccountName,
      subtitleType: 'light',
      isSelected: isSplit && pane === 'account',
      onPressListItem: () => {
        if (enableAccountSwitch) {
          openPane('account', () => switchAccountSheetRef.current?.present())();
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
      onPressListItem: openHelpCenter,
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

  const listContent = (
    <SafeAreaView
      // In the split view the list ends at the divider, so it skips the right inset.
      edges={isSplit ? ['top', 'left', 'bottom'] : undefined}
      style={tailwind.style('flex-1 bg-white font-inter-normal-20')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <SettingsHeader />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${tabBarHeight - 1}px]`)}>
        <Animated.View style={tailwind.style('flex justify-center items-center pt-4 gap-4')}>
          <Animated.View>
            <UserAvatar src={avatarUrl} name={name} status={availabilityStatus} />
            <Animated.View
              style={tailwind.style(
                'absolute border-[2px] border-white rounded-full -bottom-[2px] right-[10px]',
              )}></Animated.View>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-col items-center gap-1')}>
            <Animated.Text style={tailwind.style('text-[22px] font-inter-580-24 text-gray-950')}>
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
          onLongPress={() => debugActionsSheetRef.current?.present()}>
          <Text style={tailwind.style('text-sm text-gray-700 ')}>
            {`${chatwootInstance} ${appVersionDetails}`}
          </Text>
        </Pressable>
      </Animated.ScrollView>
      <Sheet ref={userAvailabilityStatusSheetRef} height={190}>
        <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_AVAILABILITY')} />
        <AvailabilityStatusList
          changeAvailabilityStatus={changeAvailabilityStatus}
          availabilityStatus={availabilityStatus}
        />
      </Sheet>
      <Sheet ref={languagesModalSheetRef} detents={[0.7]} scrollable>
        <ScrollView showsVerticalScrollIndicator={false}>
          <BottomSheetHeader headerText={i18n.t('SETTINGS.SET_LANGUAGE')} />
          <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
        </ScrollView>
      </Sheet>
      <Sheet ref={notificationPreferencesSheetRef} detents={[0.52]}>
        <BottomSheetHeader headerText={i18n.t('SETTINGS.NOTIFICATION_PREFERENCES')} />
        <NotificationPreferences />
      </Sheet>
      <Sheet ref={switchAccountSheetRef} detents={[0.5]}>
        <BottomSheetHeader headerText={i18n.t('SETTINGS.SWITCH_ACCOUNT')} />
        <SwitchAccount
          currentAccountId={activeAccountId}
          changeAccount={changeAccount}
          accounts={accounts}
        />
      </Sheet>
      <Sheet ref={debugActionsSheetRef} detents={[0.36]}>
        <BottomSheetHeader headerText={i18n.t('SETTINGS.DEBUG_ACTIONS')} />
        <DebugActions />
      </Sheet>
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

  if (!isSplit) return listContent;

  // Split view (iPhone Duo), like iPad Settings: the list on the left (40%) and the
  // selected setting's options on the right, with the same header as the other panes.
  const paneTitle = {
    availability: i18n.t('SETTINGS.SET_AVAILABILITY'),
    notifications: i18n.t('SETTINGS.NOTIFICATION_PREFERENCES'),
    language: i18n.t('SETTINGS.SET_LANGUAGE'),
    account: i18n.t('SETTINGS.SWITCH_ACCOUNT'),
  }[pane];

  return (
    <View style={tailwind.style('flex-1 flex-row bg-white')}>
      <View style={{ width: Math.max(320, Math.round(width * 0.4)) }}>{listContent}</View>
      <View style={tailwind.style('w-[1px] bg-blackA-A3')} />
      {/* Detail pane like iPad Settings: light gray background (as the other panes) with
          the options in a white rounded card, and no divider under the header. */}
      <SafeAreaView edges={['top', 'right', 'bottom']} style={tailwind.style('flex-1 bg-gray-50')}>
        <PaneHeader title={paneTitle} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-4 pt-2', `pb-[${tabBarHeight}px]`)}>
          <View style={tailwind.style('rounded-[13px] bg-white overflow-hidden')}>
            {pane === 'availability' ? (
              <AvailabilityStatusList
                changeAvailabilityStatus={changeAvailabilityStatus}
                availabilityStatus={availabilityStatus}
              />
            ) : null}
            {pane === 'notifications' ? <NotificationPreferences /> : null}
            {pane === 'language' ? (
              <LanguageList onChangeLanguage={onChangeLanguage} currentLanguage={activeLocale} />
            ) : null}
            {pane === 'account' ? (
              <SwitchAccount
                currentAccountId={activeAccountId}
                changeAccount={changeAccount}
                accounts={accounts}
              />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SettingsScreen;
