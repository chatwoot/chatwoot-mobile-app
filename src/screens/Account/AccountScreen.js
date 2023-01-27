/* eslint-disable react/prop-types */
import React from 'react';
import { withStyles } from '@ui-kitten/components';
import { StackActions } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView, View, ScrollView } from 'react-native';
import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './AccountScreen.style';
import AccountItem from '../../components/AccountItem';
import { setAccount } from '../../actions/auth';
import { clearAllConversations } from 'reducer/conversationSlice';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { ACCOUNT_EVENTS } from 'constants/analyticsEvents';
const AccountScreenComponent = ({ eva: { style }, navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { account_id, accounts } = user;

  const dispatch = useDispatch();

  const onCheckedChange = ({ item }) => {
    const [currentAccount] = accounts.filter(account => account.id === account_id);
    AnalyticsHelper.track(ACCOUNT_EVENTS.CHANGE_ACCOUNT, {
      from: currentAccount.name,
      to: item.name,
    });
    dispatch(clearAllConversations());
    dispatch(setAccount({ accountId: item.id }));
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('SETTINGS.SWITCH_ACCOUNT')} showLeftButton onBackPress={goBack} />
      <ScrollView style={style.itemMainView}>
        {accounts.map(item => {
          return (
            <AccountItem
              key={item.name}
              item={item}
              name={item.name}
              isChecked={account_id === item.id ? true : false}
              onCheckedChange={onCheckedChange}
            />
          );
        })}

        <View style={style.accountButtonView}>
          <LoaderButton
            style={style.accountButton}
            size="large"
            textStyle={style.accountButtonText}
            onPress={() => navigation.dispatch(StackActions.replace('Tab'))}
            text={i18n.t('SETTINGS.SUBMIT')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AccountScreen = withStyles(AccountScreenComponent, styles);
export default AccountScreen;
