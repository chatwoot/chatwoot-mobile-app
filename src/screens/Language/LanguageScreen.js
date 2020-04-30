/* eslint-disable react/prop-types */
import React from 'react';
import {
  withStyles,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';
import { StackActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';

import i18n from '../../i18n';
import styles from './LanguageScreen.style';
import LanguageItem from '../../components/LanguageItem';
import { setLocale } from '../../actions/settings';
import { LANGUAGES } from '../../constants';

const BackIcon = (style) => <Icon {...style} name="arrow-ios-back-outline" />;

const BackAction = (props) => (
  <TopNavigationAction {...props} icon={BackIcon} />
);

const LanguageScreenComponent = ({ themedStyle, navigation }) => {
  const settings = useSelector((state) => state.settings);

  const localeValue = settings.localeValue || 'en';

  const dispatch = useDispatch();

  const onCheckedChange = ({ item }) => {
    dispatch(setLocale(item));
  };

  const languages = Object.keys(i18n.translations);

  return (
    <SafeAreaView style={themedStyle.container}>
      <TopNavigation
        leftControl={<BackAction onPress={() => navigation.goBack()} />}
        title={i18n.t('SETTINGS.CHANGE_LANGUAGE')}
        titleStyle={themedStyle.headerTitle}
      />
      <View style={themedStyle.itemMainView}>
        {languages.map((item) => {
          return (
            <LanguageItem
              key={LANGUAGES[item]}
              item={item}
              title={LANGUAGES[item]}
              isChecked={localeValue === item ? true : false}
              onCheckedChange={onCheckedChange}
            />
          );
        })}
      </View>
      <View style={themedStyle.languageButtonView}>
        <LoaderButton
          style={themedStyle.languageButton}
          size="large"
          textStyle={themedStyle.languageButtonText}
          onPress={() => navigation.dispatch(StackActions.replace('Tab'))}>
          {i18n.t('SETTINGS.SUBMIT')}
        </LoaderButton>
      </View>
    </SafeAreaView>
  );
};

const LanguageScreen = withStyles(LanguageScreenComponent, styles);
export default LanguageScreen;
