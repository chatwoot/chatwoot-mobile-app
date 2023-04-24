import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { View, StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import i18n from 'i18n';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { LABEL_EVENTS } from 'constants/analyticsEvents';
import { labelsSelector } from 'reducer/labelSlice';
import {
  actions as conversationLabelActions,
  selectConversationLabels,
} from 'reducer/conversationLabelSlice';

const propTypes = {
  colors: PropTypes.object,
  conversationDetails: PropTypes.object,
  closeModal: PropTypes.func,
};

const createStyles = theme => {
  const { spacing, colors, borderRadius, fontSize } = theme;
  return StyleSheet.create({
    bottomSheet: {
      flex: 1,
    },
    bottomSheetContent: {
      marginBottom: spacing.large,
      position: 'relative',
    },
    bottomSheetItem: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderBottomColor: colors.borderLight,
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
      backgroundColor: colors.background,
      borderBottomWidth: 0.4,
      height: 46,
      borderRadius: borderRadius.small,
    },
    selectedView: {
      backgroundColor: colors.backgroundLight,
      flexDirection: 'column',
      paddingBottom: spacing.small,
      paddingTop: spacing.smaller,
    },
    searchWrap: {
      position: 'relative',
      backgroundColor: colors.backgroundLight,
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
    },
    searchInput: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.small,
      paddingRight: spacing.half,
      paddingLeft: spacing.large,
      paddingVertical: spacing.micro,
      height: spacing.large,
      fontSize: fontSize.sm,
    },
    searchIcon: {
      position: 'absolute',
      left: spacing.medium,
      top: 20,
    },
    clearIcon: {
      position: 'absolute',
      right: spacing.medium,
      top: 20,
    },
    labelItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelColorDisplay: {
      width: spacing.half,
      height: spacing.half,
      borderRadius: borderRadius.micro,
      marginRight: spacing.smaller,
    },
    emptyView: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.small,
      marginTop: spacing.small,
    },
    itemText: {
      paddingHorizontal: spacing.small,
      paddingBottom: spacing.smaller,
    },
  });
};

const ConversationLabels = ({ colors, conversationDetails }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { id: conversationId } = conversationDetails;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(conversationLabelActions.index({ conversationId }));
  }, [conversationId, dispatch]);

  const conversationLabels = useSelector(selectConversationLabels);
  const labels = useSelector(labelsSelector.selectAll);
  const savedLabels = conversationLabels[conversationId];

  const [search, setSearch] = useState('');
  const onChangeSearch = value => {
    setSearch(value);
  };

  const [conversationSavedLabels, setConversationSavedLabels] = useState([]);

  useEffect(() => {
    setConversationSavedLabels(savedLabels);
  }, [savedLabels]);

  const activeLabels =
    labels && conversationSavedLabels
      ? labels.filter(({ title }) => {
          return conversationSavedLabels.includes(title);
        })
      : [];

  const filteredLabelsOnSearch = labels.filter(label => {
    if (conversationSavedLabels.includes(label.title)) {
      return false;
    }
    return label.title.toLowerCase().includes(search.toLowerCase());
  });

  const createLabelEvent = () => {
    AnalyticsHelper.track(LABEL_EVENTS.CREATE);
  };

  const deleteLabelEvent = () => {
    AnalyticsHelper.track(LABEL_EVENTS.DELETED);
  };

  const onClickAddLabel = value => {
    const labelTitle = value.title;
    setConversationSavedLabels(prevLabels => [...prevLabels, labelTitle]);
    const array = [...savedLabels];
    array.push(labelTitle);
    onUpdateLabels(array);
    createLabelEvent();
  };

  const onClickRemoveLabel = value => {
    const labelTitle = value.title;
    setConversationSavedLabels(prevLabels => {
      const labelIndex = prevLabels.indexOf(labelTitle);
      if (labelIndex !== -1) {
        return prevLabels.slice(0, labelIndex).concat(prevLabels.slice(labelIndex + 1));
      }
      return prevLabels;
    });
    const array = savedLabels.slice();
    const index = array.indexOf(labelTitle);
    if (index !== -1) {
      array.splice(index, 1);
      onUpdateLabels(array);
      deleteLabelEvent();
    }
  };

  const onUpdateLabels = selectedLabels => {
    dispatch(
      conversationLabelActions.update({
        conversationId: conversationId,
        labels: selectedLabels,
      }),
    );
  };

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetContent}>
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Search"
            value={search}
            onChangeText={onChangeSearch}
            style={styles.searchInput}
          />
          <View style={styles.searchIcon}>
            <Icon icon="search-bold" color={colors.textDark} size={18} />
          </View>
          {search && (
            <Pressable style={styles.clearIcon} onPress={() => onChangeSearch('')}>
              <Icon icon="dismiss-circle-outline" color={colors.textDark} size={18} />
            </Pressable>
          )}
        </View>
        {conversationSavedLabels && activeLabels && (
          <View style={styles.selectedView}>
            <Text sm medium color={colors.textDark} style={styles.itemText}>
              {i18n.t('CONVERSATION_LABELS.SELECTED')}
            </Text>
            {activeLabels.map(item => (
              <Pressable
                style={styles.bottomSheetItem}
                key={item.id}
                onPress={() => onClickRemoveLabel(item)}>
                <View style={styles.labelItem}>
                  <View
                    style={[
                      {
                        backgroundColor: item.color,
                      },
                      styles.labelColorDisplay,
                    ]}
                  />
                  <Text sm medium color={colors.primaryColor}>
                    {`${item.title}`}
                  </Text>
                </View>
                <View>
                  <Icon icon="dismiss-circle-outline" color={colors.textLight} size={20} />
                </View>
              </Pressable>
            ))}

            {activeLabels.length === 0 && (
              <Pressable style={styles.bottomSheetItem}>
                <View>
                  <Text sm color={colors.textDark}>
                    {i18n.t('CONVERSATION_LABELS.NOT_SELECTED')}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        )}
        {labels &&
          filteredLabelsOnSearch.map(item => (
            <Pressable
              style={styles.bottomSheetItem}
              key={item.id}
              onPress={() => onClickAddLabel(item)}>
              <View style={styles.labelItem}>
                <View
                  style={[
                    {
                      backgroundColor: item.color,
                    },
                    styles.labelColorDisplay,
                  ]}
                />
                <Text sm medium color={colors.primaryColor}>
                  {`${item.title}`}
                </Text>
              </View>
              <View>
                <Icon icon="add-circle-outline" color={colors.primaryColor} size={20} />
              </View>
            </Pressable>
          ))}
        {filteredLabelsOnSearch && filteredLabelsOnSearch.length === 0 && (
          <View style={styles.emptyView}>
            <Text sm medium color={colors.textDark}>
              {i18n.t('CONVERSATION_LABELS.NO_RESULT')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

ConversationLabels.propTypes = propTypes;
export default ConversationLabels;
