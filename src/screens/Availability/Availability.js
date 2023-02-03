/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View } from 'react-native';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';

import i18n from '../../i18n';
import styles from './Availability.style';
import AvailabilityItem from '../../components/AvailabilityItem';
import { AVAILABILITY_TYPES } from '../../constants';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { PROFILE_EVENTS } from 'constants/analyticsEvents';

import { actions as authActions } from 'reducer/authSlice';

import { selectCurrentUserAvailability } from 'reducer/authSlice';

const AvailabilityScreenComponent = ({ eva: { style }, navigation }) => {
  const dispatch = useDispatch();

  const availability_status = useSelector(selectCurrentUserAvailability) || 'offline';

  const [availabilityStatus, setAvailabilityStatus] = useState(availability_status);

  const onCheckedChange = ({ item }) => {
    AnalyticsHelper.track(PROFILE_EVENTS.TOGGLE_AVAILABILITY_STATUS, {
      from: availability_status,
      to: item,
    });
    setAvailabilityStatus(item);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const saveAvailabilityStatus = () => {
    dispatch(authActions.updateAvailability({ availability: availabilityStatus }));
    navigation.goBack();
  };

  const availabilityTypes = Object.keys(AVAILABILITY_TYPES);

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('SETTINGS.AVAILABILITY')} showLeftButton onBackPress={goBack} />
      <View style={style.itemMainView}>
        {availabilityTypes.map(item => {
          return (
            <AvailabilityItem
              key={item}
              item={item}
              title={i18n.t(`AVAILABILITY.${AVAILABILITY_TYPES[item]}`)}
              isChecked={availabilityStatus === item ? true : false}
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
          onPress={saveAvailabilityStatus}
          text={i18n.t('SETTINGS.SUBMIT')}
        />
      </View>
    </SafeAreaView>
  );
};

const AvailabilityScreen = withStyles(AvailabilityScreenComponent, styles);
export default AvailabilityScreen;
