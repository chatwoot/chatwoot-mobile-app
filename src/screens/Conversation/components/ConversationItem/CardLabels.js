import React, { useMemo, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text } from 'components';
import { useDispatch, useSelector } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import {
  actions as conversationLabelActions,
  selectConversationLabels,
} from 'reducer/conversationLabelSlice';

import { actions as labelActions, labelsSelector } from 'reducer/labelSlice';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    scrollView: {
      marginTop: spacing.micro,
      paddingTop: spacing.tiny,
      flexDirection: 'row',
      overflow: 'scroll',
      flex: 1,
    },
    labelView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 4,
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

  const conversationLabels = useSelector(selectConversationLabels);
  const labels = useSelector(labelsSelector.selectAll);
  const savedLabels = conversationLabels[conversationId] || [];

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

  const renderItem = ({ item }) => (
    <View style={styles.labelView} key={item.id}>
      <View style={[getLabelColor(item.color)]} />
      <Text xs medium color={colors.text}>
        {item.title}
      </Text>
    </View>
  );

  const keyExtractor = item => item.id.toString();

  return (
    <View style={styles.scrollView}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        data={activeLabels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  );
};

CardLabel.propTypes = propTypes;
export default CardLabel;
