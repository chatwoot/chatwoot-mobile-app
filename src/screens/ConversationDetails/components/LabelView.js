import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import LabelBox from 'src/components/LabelsBox';
import { captureEvent } from 'helpers/Analytics';
import { Spinner, Icon } from '@ui-kitten/components';
import { View, Text } from 'react-native';
import i18n from '../../../i18n';
import Snackbar from 'react-native-snackbar';

import { getAllLabels, getConversationLabels, updateConversationLabels } from 'src/actions/label';

const styles = theme => ({
  labelView: {
    flexDirection: 'row',
    marginVertical: 2,
    flexWrap: 'wrap',
  },
  spinnerView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingBottom: 6,
  },
  itemValue: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-regular'],
  },
  addLabelButtonWrap: {
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderColor: theme['color-secondary-600'],
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    marginBottom: 6,
    marginRight: 6,
  },
  addLabelButton: {
    color: theme['color-secondary-800'],
    marginRight: 6,
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
  const { isAllLabelsLoaded, isConversationLabelsLoaded, isUpdatingConversationLabels } =
    conversation;

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
      dispatch(getConversationLabels({ conversationId }));
    });
  };

  const onClickOpenLabelScreen = () => {
    navigation.navigate('LabelScreen', { conversationDetails });
  };

  return (
    <React.Fragment>
      {!isUpdatingConversationLabels && !isAllLabelsLoaded && !isConversationLabelsLoaded ? (
        <TouchableOpacity style={style.labelView}>
          <TouchableOpacity style={style.addLabelButtonWrap} onPress={onClickOpenLabelScreen}>
            <Text style={style.addLabelButton}>{i18n.t('CONVERSATION_LABELS.ADD_LABEL')}</Text>
            <Icon
              name="plus-circle-outline"
              height={14}
              width={14}
              fill={theme['color-secondary-600']}
            />
          </TouchableOpacity>
          {activeLabels.map(({ id, title, color }) => (
            <LabelBox
              id={id}
              title={title}
              color={color}
              onClickRemoveLabel={() => onClickRemoveLabel(title)}
            />
          ))}
        </TouchableOpacity>
      ) : (
        <View style={style.spinnerView}>
          <Spinner size="small" />
        </View>
      )}
      {savedLabels &&
        savedLabels.length === 0 &&
        !isUpdatingConversationLabels &&
        !isAllLabelsLoaded &&
        !isConversationLabelsLoaded && (
          <Text style={style.itemValue}>{i18n.t('CONVERSATION_LABELS.NO_LABEL')}</Text>
        )}
    </React.Fragment>
  );
};

LabelView.propTypes = propTypes;

export default withStyles(LabelView, styles);
