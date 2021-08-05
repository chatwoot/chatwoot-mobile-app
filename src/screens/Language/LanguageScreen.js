/* eslint-disable react/prop-types */
import React from 'react';
import { withStyles } from '@ui-kitten/components';
import { StackActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';

import i18n from '../../i18n';
import styles from './LanguageScreen.style';
import LanguageItem from '../../components/LanguageItem';

import { setLocale } from '../../actions/settings';
import { LANGUAGES } from '../../constants';
import { captureEvent } from 'helpers/Analytics';

const LanguageScreenComponent = ({ eva: { style }, navigation }) => {
  const settings = useSelector((state) => state.settings);
  const auth = useSelector((state) => state.auth);

  const localeValue = settings.localeValue || 'en';
  const isLoggedIn = auth.isLoggedIn;

  const dispatch = useDispatch();

  const onCheckedChange = ({ item }) => {
    dispatch(setLocale(item));
  };

  const onSubmitLanguage = () => {
    captureEvent({ eventName: `Changed the language to ${localeValue}` });
    if (isLoggedIn) {
      navigation.dispatch(StackActions.replace('Tab'));
    } else {
      navigation.dispatch(StackActions.replace('Login'));
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const languages = Object.keys(i18n.translations);

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('SETTINGS.CHANGE_LANGUAGE')} showLeftButton onBackPress={goBack} />
      <View style={style.itemMainView}>
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
      <View style={style.languageButtonView}>
        <LoaderButton
          style={style.languageButton}
          size="large"
          textStyle={style.languageButtonText}
          onPress={() => onSubmitLanguage()}
          text={i18n.t('SETTINGS.SUBMIT')}
        />
      </View>
    </SafeAreaView>
  );
};

const LanguageScreen = withStyles(LanguageScreenComponent, styles);
export default LanguageScreen;
