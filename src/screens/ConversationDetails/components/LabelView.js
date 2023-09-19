import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import LabelBox from 'src/components/LabelBox';
import AddLabelButton from './AddButton';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'components';
import i18n from 'i18n';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { LABEL_EVENTS } from 'constants/analyticsEvents';

import {
  actions as conversationLabelActions,
  selectConversationLabels,
  selectConversationLabelsLoading,
} from 'reducer/conversationLabelSlice';

import { labelsSelector, selectLabelLoading } from 'reducer/labelSlice';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    labelWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    labelViews: {
      flexDirection: 'row',
      marginVertical: spacing.tiny,
      minHeight: 30,
      flexWrap: 'wrap',
    },
    itemValue: {
      paddingHorizontal: spacing.micro,
      marginBottom: spacing.micro,
    },
    spinnerView: {
      marginLeft: spacing.micro,
      marginTop: spacing.tiny,
    },
  });
};

const propTypes = {
  conversationDetails: PropTypes.object,
  conversationId: PropTypes.number,
  openLabelsBottomSheet: PropTypes.func,
};

const LabelView = ({ conversationDetails, conversationId, openLabelsBottomSheet }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(conversationLabelActions.index({ conversationId }));
  }, [conversationId, dispatch]);

  const conversationLabels = useSelector(selectConversationLabels);
  const labels = useSelector(labelsSelector.selectAll);
  const isConversationLabelsLoading = useSelector(selectConversationLabelsLoading);
  const isLabelsLoading = useSelector(selectLabelLoading);
  const savedLabels = conversationLabels[conversationId] || [];

  const activeLabels =
    labels && savedLabels
      ? labels.filter(({ title }) => {
          return savedLabels?.includes(title);
        })
      : [];

  const onClickRemoveLabel = value => {
    const result =
      labels && savedLabels
        ? activeLabels.map(label => label.title).filter(label => label !== value)
        : [];
    AnalyticsHelper.track(LABEL_EVENTS.DELETED);
    dispatch(
      conversationLabelActions.update({
        conversationId: conversationId,
        labels: result,
      }),
    );
  };

  const shouldShowEmptyMessage =
    savedLabels && savedLabels.length === 0 && !isConversationLabelsLoading && !isLabelsLoading;
  return (
    <React.Fragment>
      <View style={styles.labelWrapper}>
        <View style={styles.labelViews}>
          <AddLabelButton
            buttonLabel={i18n.t('CONVERSATION_LABELS.ADD_LABEL')}
            iconName="add-circle-outline"
            onClickOpen={openLabelsBottomSheet}
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
          {isConversationLabelsLoading && (
            <View style={styles.spinnerView}>
              <ActivityIndicator
                size="small"
                color={colors.textDark}
                animating={isConversationLabelsLoading}
              />
            </View>
          )}
        </View>
        {shouldShowEmptyMessage && (
          <Text sm color={colors.text} style={styles.itemValue}>
            {i18n.t('CONVERSATION_LABELS.NO_LABEL')}
          </Text>
        )}
      </View>
    </React.Fragment>
  );
};

LabelView.propTypes = propTypes;
export default LabelView;
