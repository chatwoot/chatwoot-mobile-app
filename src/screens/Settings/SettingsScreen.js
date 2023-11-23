import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView, Platform, ScrollView, Dimensions } from 'react-native';
import Config from 'react-native-config';
import { StackActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import ChatWootWidget from '@chatwoot/react-native-widget';
import { View, Image } from 'react-native';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import { useFocusEffect } from '@react-navigation/native';
import settings from './constants/settings';
import { LANGUAGES } from 'constants';
import i18n from 'i18n';
import images from 'constants/images';
import createStyles from './SettingsScreen.style';
import { HELP_URL } from 'constants/url.js';
import { openURL } from 'helpers/UrlHelper';
import packageFile from '../../../package.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearContacts } from 'reducer/contactSlice';
import { actions as settingsActions } from 'reducer/settingsSlice';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { ACCOUNT_EVENTS } from 'constants/analyticsEvents';
import {
  logout,
  selectUser,
  selectAccounts,
  setAccount,
  selectCurrentUserAvailability,
} from 'reducer/authSlice';
import { clearAllConversations } from 'reducer/conversationSlice';
import { selectLocale, setLocale } from 'reducer/settingsSlice';

import UserInformation from './components/UserInformation';
import AvailabilityStatus from './components/AvailabilityStatus';
import AccordionItem from './components/AccordionItem';
import { Header, Text, Pressable, Icon } from 'components';

// Bottom sheet
import AccountsSelector from './components/AccountsSelector';
import NotificationPreferenceSelector from './components/NotificationPreferenceSelector';
import LanguageSelector from './components/LanguageSelector';

const deviceHeight = Dimensions.get('window').height;

const appName = DeviceInfo.getApplicationName();

const propTypes = {
  navigation: PropTypes.shape({
    dispatch: PropTypes.func.isRequired,
  }).isRequired,
  getNotificationSettings: PropTypes.func,
};

const SettingsScreen = () => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showWidget, toggleWidget] = useState(false);
  const {
    name,
    email,
    avatar_url: avatarUrl,
    identifier_hash: identifierHash,
    account_id: activeAccountId,
  } = useSelector(selectUser);

  const availabilityStatus = useSelector(selectCurrentUserAvailability) || 'offline';

  const accounts = useSelector(selectAccounts);
  const activeAccountName = accounts.length
    ? accounts.find(account => account.id === activeAccountId).name
    : '';
  const activeLocale = useSelector(selectLocale);

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
    appVersion: packageFile.version,
    deviceId: DeviceInfo.getDeviceId(),
    packageName: packageFile.name,
    operatingSystem: Platform.OS, // android/ios
  };

  useEffect(() => {
    dispatch(settingsActions.getNotificationSettings());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeSwitchAccountModal();
      };
    }, [closeSwitchAccountModal]),
  );

  // Switch account bottom sheet
  const switchAccountModal = useRef(null);
  const switchAccountModalSnapPoints = useMemo(() => [deviceHeight - 210, deviceHeight - 210], []);
  const toggleSwitchAccountModal = useCallback(() => {
    switchAccountModal.current.present() || switchAccountModal.current?.dismiss();
  }, []);
  const closeSwitchAccountModal = useCallback(() => {
    switchAccountModal.current?.dismiss();
  }, []);

  // Notification Preferences bottom sheet
  const notificationPreferencesModal = useRef(null);
  const notificationPreferencesModalSnapPoints = useMemo(
    () => [deviceHeight - 150, deviceHeight - 150],
    [],
  );
  const toggleNotificationPreferencesModal = useCallback(() => {
    notificationPreferencesModal.current.present() ||
      notificationPreferencesModal.current?.dismiss();
  }, []);
  const closeNotificationPreferencesModal = useCallback(() => {
    notificationPreferencesModal.current?.dismiss();
  }, []);

  // Language bottom sheet
  const changeLanguageModal = useRef(null);
  const changeLanguageModalModalSnapPoints = useMemo(
    () => [deviceHeight - 210, deviceHeight - 210],
    [],
  );
  const toggleChangeLanguageModal = useCallback(() => {
    changeLanguageModal.current.present() || changeLanguageModal.current?.dismiss();
  }, []);
  const closeChangeLanguageModal = useCallback(() => {
    changeLanguageModal.current?.dismiss();
  }, []);

  const onChangeAccount = useCallback(
    accountId => {
      dispatch(clearContacts());
      dispatch(clearAllConversations());
      dispatch(setAccount(accountId));
      navigation.dispatch(StackActions.replace('Tab'));
      closeSwitchAccountModal();
    },
    [dispatch, navigation, closeSwitchAccountModal],
  );

  const onChangeLanguage = useCallback(
    locale => {
      dispatch(setLocale(locale));
      navigation.dispatch(StackActions.replace('Tab'));
      closeChangeLanguageModal();
    },
    [closeChangeLanguageModal, navigation, dispatch],
  );

  const activeValue = item => {
    switch (item.routeName) {
      case 'SwitchAccount':
        return activeAccountName;
      case 'ChangeLanguage':
        return LANGUAGES[activeLocale];
      default:
        return null;
    }
  };

  const onClickLogout = useCallback(async () => {
    await AsyncStorage.removeItem('cwCookie');
    dispatch(logout());
  }, [dispatch]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Header headerText={i18n.t('SETTINGS.HEADER_TITLE')} />
      <ScrollView contentContainerStyle={styles.itemsContainer}>
        <UserInformation
          name={name}
          email={email}
          thumbnail={avatarUrl}
          status={availabilityStatus}
        />
        <View style={styles.separatorView}>
          <View style={styles.separator}>
            <Text bold sm color={colors.textDark}>
              {i18n.t('SETTINGS.SET_AVAILABILITY')}
            </Text>
          </View>
          <AvailabilityStatus status={availabilityStatus} />
        </View>
        <View style={styles.separatorView}>
          <View style={styles.separator}>
            <Text bold sm color={colors.textDark}>
              {i18n.t('SETTINGS.PREFERENCES')}
            </Text>
          </View>
          <View style={styles.accordionItemWrapper}>
            {settings.preferencesSections.map((item, index) => (
              <AccordionItem
                key={item.title}
                leftIcon={item.leftIcon}
                title={item.title}
                rightIcon={item.rightIcon}
                routeName={item.routeName}
                activeValue={activeValue(item)}
                onPress={async () => {
                  if (item.routeName === 'SwitchAccount') {
                    toggleSwitchAccountModal();
                  }
                  if (item.routeName === 'NotificationPreferences') {
                    toggleNotificationPreferencesModal();
                  }
                  if (item.routeName === 'ChangeLanguage') {
                    toggleChangeLanguageModal();
                  }
                }}
              />
            ))}
          </View>
          <BottomSheetModal
            bottomSheetModalRef={switchAccountModal}
            initialSnapPoints={switchAccountModalSnapPoints}
            showHeader
            headerTitle={i18n.t('SETTINGS.SWITCH_ACCOUNT')}
            closeFilter={closeSwitchAccountModal}
            children={
              <AccountsSelector
                accounts={accounts}
                activeValue={activeAccountId}
                colors={colors}
                onPress={onChangeAccount}
              />
            }
          />
          <BottomSheetModal
            bottomSheetModalRef={notificationPreferencesModal}
            initialSnapPoints={notificationPreferencesModalSnapPoints}
            showHeader
            headerTitle={i18n.t('SETTINGS.NOTIFICATION_PREFERENCES')}
            closeFilter={closeNotificationPreferencesModal}
            children={<NotificationPreferenceSelector colors={colors} />}
          />
          <BottomSheetModal
            bottomSheetModalRef={changeLanguageModal}
            initialSnapPoints={changeLanguageModalModalSnapPoints}
            showHeader
            headerTitle={i18n.t('SETTINGS.CHANGE_LANGUAGE')}
            closeFilter={closeChangeLanguageModal}
            children={
              <LanguageSelector
                activeValue={activeLocale}
                colors={colors}
                onPress={onChangeLanguage}
              />
            }
          />
        </View>
        <View style={styles.separatorView}>
          <View style={styles.separator}>
            <Text bold sm color={colors.textDark}>
              {i18n.t('SETTINGS.SUPPORT')}
            </Text>
          </View>
          <View style={styles.accordionItemWrapper}>
            {settings.supportSection.map((item, index) => (
              <AccordionItem
                key={item.title}
                leftIcon={item.leftIcon}
                title={item.title}
                rightIcon={item.rightIcon}
                routeName={item.routeName}
                onPress={() => {
                  if (item.routeName === 'ReadDocs') {
                    openURL({ URL: HELP_URL });
                  }
                  if (item.routeName === 'ChatWithUs') {
                    AnalyticsHelper.track(ACCOUNT_EVENTS.OPEN_SUPPORT);
                    toggleWidget(true);
                  }
                }}
              />
            ))}
          </View>
        </View>
        <View style={styles.separatorView}>
          <View style={styles.aboutView}>
            <Image style={styles.aboutImage} source={images.appLogo} />
          </View>
          <View style={styles.appDescriptionView}>
            <Text color={colors.textLight} xs medium style={styles.appDescriptionText}>
              {`Version ${packageFile.version}`}
            </Text>
          </View>
        </View>
        <View style={styles.logoutSection}>
          <Pressable style={styles.logoutButton} onPress={onClickLogout}>
            <Icon icon="power-outline" color={colors.textDark} size={16} />
            <Text medium sm color={colors.textDark} style={styles.logoutText}>
              {i18n.t('SETTINGS.LOGOUT')}
            </Text>
          </Pressable>
        </View>
        {!!Config.CHATWOOT_WEBSITE_TOKEN && !!Config.CHATWOOT_BASE_URL && !!showWidget && (
          <ChatWootWidget
            websiteToken={Config.CHATWOOT_WEBSITE_TOKEN}
            locale="en"
            baseUrl={Config.CHATWOOT_BASE_URL}
            closeModal={() => toggleWidget(false)}
            isModalVisible={showWidget}
            user={userDetails}
            customAttributes={customAttributes}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

SettingsScreen.propTypes = propTypes;
export default SettingsScreen;
