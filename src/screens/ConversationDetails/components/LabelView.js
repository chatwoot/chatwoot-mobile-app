import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import LabelBox from 'src/components/LabelBox';
import AddLabelButton from './AddButton';
import { captureEvent } from 'helpers/Analytics';
import { Spinner } from '@ui-kitten/components';
import { View, Text } from 'react-native';
import i18n from '../../../i18n';
import Snackbar from 'react-native-snackbar';

import { getAllLabels, getConversationLabels, updateConversationLabels } from 'src/actions/label';

const styles = theme => ({
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  labelViews: {
    flexDirection: 'row',
    marginVertical: 2,
    minHeight: 30,
    flexWrap: 'wrap',
  },
  spinnerView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingLeft: 4,
  },
  itemValue: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-regular'],
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  addLabelButtonWrap: {
    flexDirection: 'row',
    height: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme['color-primary-50'],
    borderColor: theme['color-primary-75'],
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    marginRight: 6,
  },
  addLabelButton: {
    marginRight: 6,
    color: theme['color-primary-700'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-extra-small'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  conversationDetails: PropTypes.object,
  conversationId: PropTypes.number,
};

const LabelView = ({ conversationDetails, conversationId, eva: { style, theme } }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllLabels());
    dispatch(getConversationLabels({ conversationId }));
  }, [conversationId, dispatch]);

  const conversation = useSelector(state => state.conversation);
  const { isAllLabelsLoaded, isConversationLabelsLoaded } = conversation;

  const availableLabels = useSelector(state => state.conversation.availableLabels);
  const conversationLabels = useSelector(state => state.conversation.conversationLabels);

  const accountLabels = availableLabels && availableLabels.payload;
  const savedLabels = conversationLabels && conversationLabels.payload;

  const activeLabels =
    accountLabels && savedLabels
      ? accountLabels.filter(({ title }) => {
          return savedLabels.includes(title);
        })
      : [];

  const onClickRemoveLabel = value => {
    const result =
      accountLabels && savedLabels
        ? activeLabels.map(label => label.title).filter(label => label !== value)
        : [];
    captureEvent({ eventName: 'Conversation label removed through the contact details page' });
    dispatch(
      updateConversationLabels({
        conversationId: conversationId,
        labels: result,
      }),
    ).then(() => {
      Snackbar.show({
        text: i18n.t('CONVERSATION_LABELS.UPDATE_LABEL'),
        duration: Snackbar.LENGTH_SHORT,
      });
    });
  };

  const onClickOpenLabelScreen = () => {
    navigation.navigate('LabelScreen', { conversationDetails });
  };

  const shouldShowEmptyMessage =
    savedLabels && savedLabels.length === 0 && !isAllLabelsLoaded && !isConversationLabelsLoaded;

  return (
    <React.Fragment>
      <View style={style.labelWrapper}>
        <View style={style.labelViews}>
          <AddLabelButton
            buttonLabel={i18n.t('CONVERSATION_LABELS.ADD_LABEL')}
            iconName="plus-circle-outline"
            onClickOpen={onClickOpenLabelScreen}
          />
          {activeLabels.map(item => (
            <LabelBox
              key={item.title}
              id={item.id}
              title={item.title}
              color={item.color}
              onClickRemoveLabel={() => onClickRemoveLabel(item.title)}
            />
          ))}
          {isConversationLabelsLoaded && (
            <View style={style.spinnerView}>
              <Spinner size="tiny" />
            </View>
          )}
        </View>
        {shouldShowEmptyMessage && (
          <Text style={style.itemValue}>{i18n.t('CONVERSATION_LABELS.NO_LABEL')}</Text>
        )}
      </View>
    </React.Fragment>
  );
};

LabelView.propTypes = propTypes;

export default withStyles(LabelView, styles);
