import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { captureEvent } from 'helpers/Analytics';
import { Divider, withStyles } from '@ui-kitten/components';
import HeaderBar from 'src/components/HeaderBar';
import TextInput from 'src/components/TextInput';
import LoaderButton from 'src/components/LoaderButton';
import UserAvatar from 'src/components/UserAvatar';
import { useNavigation } from '@react-navigation/native';
import { profileUpdate } from 'src/actions/auth';
import i18n from 'i18n';

const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  contentView: {
    flex: 1,
    paddingVertical: 12,
  },
  formView: {
    paddingTop: 16,
  },
  inputField: {
    marginBottom: 12,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  route: PropTypes.object,
};

const ProfileSettings = ({ route, eva: { style, theme } }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isUpdatingProfile = useSelector(state => state.auth.isUpdatingProfile);
  const { userDetails } = route.params;
  const { name, displayName, avatar_url: avatarUrl, email } = userDetails;

  useEffect(() => {
    setFullName(name);
    setDisplayName(displayName);
    setEmailId(email);
  }, [name, displayName, email]);

  const [updatedFullName, setFullName] = useState('Full name');
  const [updatedDisplayName, setDisplayName] = useState('Display name');
  const [updatedEmail, setEmailId] = useState('Your email address');

  const goBack = () => {
    navigation.goBack();
  };

  const onChangeFullName = value => {
    setFullName(value);
  };

  const onChangeDisplayName = value => {
    setDisplayName(value);
  };

  const onChangeEmailId = value => {
    setEmailId(value);
  };

  const onClickUpdateProfile = () => {
    const payload = {
      displayName: updatedDisplayName,
      profileAttributes: { email: updatedEmail, name: updatedFullName },
    };
    captureEvent({ eventName: 'Profile updated' });
    dispatch(profileUpdate(payload));
  };

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('SETTINGS.PROFILE_SETTINGS.HEADER_TITLE')}
        showLeftButton
        onBackPress={goBack}
      />
      <ScrollView style={style.scrollView}>
        <View style={style.contentView}>
          <View style={style.avatarContainer}>
            <UserAvatar
              userName={updatedFullName}
              thumbnail={avatarUrl}
              size={76}
              fontSize={40}
              defaultBGColor={theme['color-primary-default']}
            />
          </View>
          <View style={style.formView}>
            <View style={style.inputField}>
              <TextInput
                label={i18n.t('SETTINGS.PROFILE_SETTINGS.FULLNAME')}
                placeholder="useless placeholder"
                onChangeText={onChangeFullName}
                value={updatedFullName}
                keyboardType="default"
              />
            </View>
            <View style={style.inputField}>
              <TextInput
                label={i18n.t('SETTINGS.PROFILE_SETTINGS.DISPLAY_NAME')}
                placeholder="useless placeholder"
                onChangeText={onChangeDisplayName}
                value={updatedDisplayName}
                keyboardType="default"
              />
            </View>
            <View style={style.inputField}>
              <TextInput
                label={i18n.t('SETTINGS.PROFILE_SETTINGS.EMAIL')}
                placeholder="useless placeholder"
                onChangeText={onChangeEmailId}
                value={updatedEmail}
                // error={'error'}
                keyboardType="email-address"
              />
            </View>
            <View style={style.forgotButtonView}>
              <LoaderButton
                style={style.forgotButton}
                loading={isUpdatingProfile}
                onPress={onClickUpdateProfile}
                size="large"
                text={i18n.t('SETTINGS.PROFILE_SETTINGS.UPDATE_BUTTON')}
                textStyle={style.forgotButtonText}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <Divider />
    </SafeAreaView>
  );
};

ProfileSettings.propTypes = propTypes;
export default withStyles(ProfileSettings, styles);
