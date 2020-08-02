/* eslint-disable react/prop-types */
import React from 'react';
import { withStyles } from '@ui-kitten/components';
import { StackActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';

import i18n from '../../i18n';
import styles from './Availability.style';
import AvailabilityItem from '../../components/AvailabilityItem';

import { updateProfile } from '../../actions/auth';
import { AVAILABILITY_TYPES } from '../../constants';

const AvailabilityScreenComponent = ({ eva: { style }, navigation }) => {
  const {
    user: { availability_status: availabilityStatus },
  } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const onCheckedChange = ({ item }) => {
    dispatch(updateProfile());
  };

  const goBack = () => {
    navigation.goBack();
  };

  const availabilityTypes = Object.keys(AVAILABILITY_TYPES);

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('SETTINGS.AVAILABILITY')} showLeftButton onBackPress={goBack} />
      <View style={style.itemMainView}>
        {availabilityTypes.map((item) => {
          return (
            <AvailabilityItem
              key={item}
              item={item}
              title={AVAILABILITY_TYPES[item]}
              isChecked={availabilityStatus === AVAILABILITY_TYPES[item] ? true : false}
              onCheckedChange={onCheckedChange}
            />
          );
        })}
      </View>
      <View style={style.availabilityButtonView}>
        <LoaderButton
          style={style.availabilityButton}
          size="large"
          textStyle={style.availabilityButtonText}
          onPress={() => navigation.dispatch(StackActions.replace('Tab'))}
          text={i18n.t('SETTINGS.SUBMIT')}
        />
      </View>
    </SafeAreaView>
  );
};

const AvailabilityScreen = withStyles(AvailabilityScreenComponent, styles);
export default AvailabilityScreen;
