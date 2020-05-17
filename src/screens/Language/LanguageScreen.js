/* eslint-disable react/prop-types */
import React from 'react';
import { withStyles, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { StackActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';

import i18n from '../../i18n';
import styles from './LanguageScreen.style';
import LanguageItem from '../../components/LanguageItem';
import Icon from '../../components/Icon';
import { setLocale } from '../../actions/settings';
import { LANGUAGES } from '../../constants';

const BackIcon = ({ style: { tintColor } }) => {
  return <Icon name="arrow-ios-back-outline" color={tintColor} />;
};
const LanguageScreenComponent = ({ eva: { style }, navigation }) => {
  const settings = useSelector((state) => state.settings);

  const localeValue = settings.localeValue || 'en';

  const dispatch = useDispatch();

  const onCheckedChange = ({ item }) => {
    dispatch(setLocale(item));
  };

  const renderLeftControl = () => (
    <TopNavigationAction onPress={() => navigation.goBack()} icon={BackIcon} />
  );

  const languages = Object.keys(i18n.translations);

  return (
    <SafeAreaView style={style.container}>
      <TopNavigation
        accessoryLeft={renderLeftControl}
        title={i18n.t('SETTINGS.CHANGE_LANGUAGE')}
        titleStyle={style.headerTitle}
      />
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
          onPress={() => navigation.dispatch(StackActions.replace('Tab'))}
          text={i18n.t('SETTINGS.SUBMIT')}
        />
      </View>
    </SafeAreaView>
  );
};

const LanguageScreen = withStyles(LanguageScreenComponent, styles);
export default LanguageScreen;
