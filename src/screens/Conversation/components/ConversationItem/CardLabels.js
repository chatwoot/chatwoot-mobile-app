import React, { useMemo, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text } from 'components';
import { useDispatch, useSelector } from 'react-redux';
import { View, StyleSheet } from 'react-native';

import {
  actions as conversationLabelActions,
  selectConversationLabels,
} from 'reducer/conversationLabelSlice';

import { actions as labelActions, labelsSelector } from 'reducer/labelSlice';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    cardLabelWrap: {
      marginTop: spacing.micro,
      paddingTop: spacing.tiny,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    labelView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 4,
      marginBottom: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: colors.borderLight,
    },
  });
};

const propTypes = {
  conversationDetails: PropTypes.object,
  conversationId: PropTypes.number,
};

const CardLabel = ({ conversationDetails, conversationId }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(labelActions.index());
    dispatch(conversationLabelActions.index({ conversationId }));
  }, [conversationId, dispatch]);

  const labels = useSelector(labelsSelector.selectAll);
  const savedLabels = conversationDetails.labels || [];

  const getLabelColor = clr => {
    return {
      backgroundColor: clr,
      width: 8,
      height: 8,
      borderRadius: 3,
      marginRight: 2,
    };
  };

  const activeLabels =
    labels && savedLabels
      ? labels.filter(({ title }) => {
          return savedLabels.includes(title);
        })
      : [];

  return (
    <View style={styles.cardLabelWrap}>
      {activeLabels.map(({ id, title, color }) => (
        <View style={styles.labelView} key={id}>
          <View style={[getLabelColor(color)]} />
          <Text xs medium color={colors.text}>
            {title}
          </Text>
        </View>
      ))}
    </View>
  );
};

CardLabel.propTypes = propTypes;
export default CardLabel;
