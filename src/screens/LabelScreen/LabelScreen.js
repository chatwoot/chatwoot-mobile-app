/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, View, ScrollView, Text } from 'react-native';

import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './LabelScreen.style';
import LabelItem from 'src/components/LabelItem';
import { getAllLabels, getConversationLabels, updateConversationLabels } from '../../actions/label';
import { captureEvent } from 'helpers/Analytics';
import Snackbar from 'react-native-snackbar';

const LabelScreenComponent = ({ eva: { style }, navigation, route }) => {
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

  const { isAllLabelsLoaded } = conversation;

  const [selectedLabels, setSelectedlabels] = useState(savedLabels);

  const onUpdateLabels = value => {
    if (value) {
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
        setSelectedlabels(savedLabels);
      });
    }
  };

  const goBack = () => {
    onUpdateLabels(selectedLabels);
    navigation.goBack();
  };

  const onClickAddRemoveLabels = value => {
    if (savedLabels.includes(value.title)) {
      const array = [...selectedLabels];
      const index = array.indexOf(value.title);
      if (index !== -1) {
        array.splice(index, 1);
        savedLabels.splice(index, 1);
      }
      setSelectedlabels(array);
      captureEvent({ eventName: 'Conversation label removed' });
    } else {
      const array = [...selectedLabels];
      array.push(value.title);
      savedLabels.push(value.title);
      setSelectedlabels(array);
      captureEvent({ eventName: 'Conversation label added' });
    }
  };

  const shouldShowEmptyMessage = labels && labels.length === 0 && !isAllLabelsLoaded;

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('CONVERSATION_LABELS.ADD_LABEL')}
        showLeftButton
        onBackPress={goBack}
      />
      <ScrollView>
        {!isAllLabelsLoaded ? (
          <View>
            {accountLabels &&
              savedLabels &&
              accountLabels.map(item => (
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
