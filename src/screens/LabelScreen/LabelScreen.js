/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, View, ScrollView, Text } from 'react-native';

import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './LabelScreen.style';
import LabelItem from 'src/components/LabelItem';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { LABEL_EVENTS } from 'constants/analyticsEvents';

import { actions as labelActions, labelsSelector } from 'reducer/labelSlice';
import {
  actions as conversationLabelActions,
  selectConversationLabels,
  selectConversationLabelsLoading,
} from 'reducer/conversationLabelSlice';

const LabelScreenComponent = ({ eva: { style }, navigation, route }) => {
  const { conversationDetails } = route.params;
  const { id: conversationId } = conversationDetails;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(labelActions.index());
    dispatch(conversationLabelActions.index({ conversationId }));
  }, [conversationId, dispatch]);

  const conversationLabels = useSelector(selectConversationLabels);
  const isLoading = useSelector(selectConversationLabelsLoading);
  const labels = useSelector(labelsSelector.selectAll);
  const savedLabels = conversationLabels[conversationId] || [];

  const onUpdateLabels = selectedLabels => {
    dispatch(
      conversationLabelActions.update({
        conversationId: conversationId,
        labels: selectedLabels,
      }),
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  const onClickAddRemoveLabels = value => {
    if (savedLabels.includes(value.title)) {
      const array = [...savedLabels];
      const index = array.indexOf(value.title);
      if (index !== -1) {
        array.splice(index, 1);
      }
      onUpdateLabels(array);
      AnalyticsHelper.track(LABEL_EVENTS.DELETED);
    } else {
      const array = [...savedLabels];
      array.push(value.title);
      onUpdateLabels(array);
      AnalyticsHelper.track(LABEL_EVENTS.CREATE);
    }
  };

  const shouldShowEmptyMessage = labels && labels.length === 0 && !isLoading;

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('CONVERSATION_LABELS.ADD_LABEL')}
        showLeftButton
        onBackPress={goBack}
      />
      <ScrollView>
        {!isLoading ? (
          <View>
            {labels &&
              savedLabels &&
              labels.map(item => (
                <LabelItem
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
        {shouldShowEmptyMessage && (
          <View>
            <Text style={style.emptyList}>{i18n.t('CONVERSATION_LABELS.EMPTY_LIST')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const LabelScreen = withStyles(LabelScreenComponent, styles);
export default LabelScreen;
