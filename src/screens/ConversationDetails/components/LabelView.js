import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import LabelBox from 'src/components/LabelsBox';
import { captureEvent } from 'helpers/Analytics';
import { Spinner } from '@ui-kitten/components';
import { View } from 'react-native';

import { getAllLabels, getConversationLabels, updateConversationLabels } from 'src/actions/label';

const styles = theme => ({
  labelView: {
    flexDirection: 'row',
    marginVertical: 2,
    flexWrap: 'wrap',
  },
  spinnerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    margin: 30,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  conversationId: PropTypes.number,
};

const LabelView = ({ conversationId, eva: { style, theme } }) => {
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
      dispatch(getConversationLabels({ conversationId }));
    });
  };

  return (
    <React.Fragment>
      {!isUpdatingConversationLabels && !isAllLabelsLoaded && !isConversationLabelsLoaded ? (
        <TouchableOpacity style={style.labelView}>
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
          <Spinner size="large" />
        </View>
      )}
    </React.Fragment>
  );
};

LabelView.propTypes = propTypes;

export default withStyles(LabelView, styles);
