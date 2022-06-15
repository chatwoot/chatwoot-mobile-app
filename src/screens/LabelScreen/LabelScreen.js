/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, View, ScrollView, Text } from 'react-native';

import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './LabelScreen.style';
import LabelList from 'src/components/LabelList';
import { getAllLabels, getConversationLabels, updateConversationLabels } from '../../actions/label';
import { captureEvent } from 'helpers/Analytics';
import Snackbar from 'react-native-snackbar';

const LabelScreen = ({ eva: { style }, navigation, route }) => {
  const { conversationDetails } = route.params;
  const { id: conversationId } = conversationDetails;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllLabels());
    dispatch(getConversationLabels({ conversationId }));
  }, [conversationId, dispatch]);

  const conversation = useSelector(state => state.conversation);

  const labels = useSelector(state => state.conversation.availableLabels);
  const conversationLabels = useSelector(state => state.conversation.conversationLabels);
  const accountLabels = labels && labels.payload;
  const savedLabels = conversationLabels && conversationLabels.payload;

  const { isAllLabelsLoaded, isUpdatingConversationLabels } = conversation;

  const goBack = () => {
    navigation.goBack();
  };

  const activeLabels =
    accountLabels && savedLabels
      ? accountLabels.filter(({ title }) => {
          return savedLabels.includes(title);
        })
      : [];

  const onUpdateLabels = value => {
    dispatch(
      updateConversationLabels({
        conversationId: conversationId,
        labels: value,
      }),
    ).then(() => {
      Snackbar.show({
        text: i18n.t('CONVERSATION_LABELS.UPDATE_LABEL'),
        duration: Snackbar.LENGTH_SHORT,
      });
      dispatch(getConversationLabels({ conversationId }));
    });
  };

  const onClickAddLabel = value => {
    const result = activeLabels.map(item => item.title);
    result.push(value.title);
    captureEvent({ eventName: 'Conversation label added' });
    onUpdateLabels(result);
  };

  const onClickRemoveLabel = value => {
    const result =
      accountLabels && savedLabels
        ? activeLabels.map(label => label.title).filter(label => label !== value)
        : [];
    captureEvent({ eventName: 'Conversation label removed' });
    onUpdateLabels(result);
  };

  const onClickAddRemoveLabels = value => {
    if (savedLabels.includes(value.title)) {
      return onClickRemoveLabel(value.title);
    } else {
      return onClickAddLabel(value);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('CONVERSATION_LABELS.ADD_LABEL')}
        showLeftButton
        onBackPress={goBack}
      />
      <ScrollView>
        {!isAllLabelsLoaded && !isUpdatingConversationLabels ? (
          <View>
            {accountLabels &&
              savedLabels &&
              accountLabels.map(item => (
                <LabelList
                  key={item.id}
                  title={item.title}
                  color={item.color}
                  activeLabel={savedLabels.includes(item.title)}
                  onClickAddRemoveLabels={() => onClickAddRemoveLabels(item)}
                />
              ))}
          </View>
        ) : (
          <View style={style.spinnerView}>
            <Spinner size="medium" />
          </View>
        )}
        {labels && labels.length === 0 && !isAllLabelsLoaded && !isUpdatingConversationLabels && (
          <View>
            <Text style={style.emptyList}>{i18n.t('CONVERSATION_LABELS.EMPTY_LIST')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default withStyles(LabelScreen, styles);
