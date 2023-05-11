import React, { useMemo, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { View, StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable, UserAvatar } from 'components';
import i18n from 'i18n';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import conversationActions from 'reducer/conversationSlice.action';
import { inboxAgentSelectors } from 'reducer/inboxAgentsSlice';

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
      paddingHorizontal: spacing.half,
      backgroundColor: colors.background,
      borderBottomWidth: 0.4,
      height: 46,
      borderRadius: borderRadius.small,
    },
    bottomSheetItemActive: {
      backgroundColor: colors.primaryColorLight,
      borderRightColor: colors.borderLight,
      borderRightWidth: 0.4,
      borderLeftColor: colors.borderLight,
      borderLeftWidth: 0.4,
    },
    bottomSheetItemView: {
      height: '100%',
      flexDirection: 'column',
      paddingTop: spacing.smaller,
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
    },
    searchWrap: {
      position: 'relative',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
    },
    searchInput: {
      backgroundColor: colors.backgroundLight,
      borderWidth: 0.4,
      borderColor: colors.borderLight,
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
    agentDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    agentName: {
      marginLeft: spacing.smaller,
    },
    emptyView: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.small,
      marginTop: spacing.small,
    },
    itemText: {
      paddingBottom: spacing.smaller,
    },
  });
};

const AssignAgent = ({ colors, conversationDetails, closeModal }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    id: conversationId,
    meta: { assignee },
  } = conversationDetails;

  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const onChangeSearch = value => {
    setSearch(value);
  };

  const [assigneeId, setAssignee] = useState(assignee ? assignee.id : null);

  const agents = useSelector(state => inboxAgentSelectors.inboxAssignedAgents(state));

  const isAgentSelected = assigneeId !== null;

  const agentsList = () => {
    return [
      ...(isAgentSelected
        ? [
            {
              confirmed: true,
              name: 'None',
              id: 0,
              role: 'agent',
              account_id: 0,
              email: 'None',
            },
          ]
        : []),
      ...agents,
    ];
  };

  const filteredAgentsOnSearch = agentsList().filter(agent => {
    return agent.name.toLowerCase().includes(search.toLowerCase());
  });

  const updateAssignee = id => {
    setAssignee(id);
    if (!assignee || assignee.id !== id) {
      AnalyticsHelper.track(CONVERSATION_EVENTS.ASSIGNEE_CHANGED);
      dispatch(
        conversationActions.assignConversation({
          conversationId: conversationId,
          assigneeId: id,
        }),
      );
    }
    closeModal();
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

        <View style={styles.bottomSheetItemView}>
          {filteredAgentsOnSearch.length !== 0 && (
            <Text sm medium color={colors.textDark} style={styles.itemText}>
              {i18n.t('CONVERSATION_AGENTS.SELECT_AGENT')}
            </Text>
          )}
          {filteredAgentsOnSearch.map(item => (
            <Pressable
              style={[
                styles.bottomSheetItem,
                assigneeId === item.id && styles.bottomSheetItemActive,
              ]}
              key={item.id}
              onPress={() => updateAssignee(item.id)}>
              <View style={styles.agentDetails}>
                <UserAvatar
                  thumbnail={item.thumbnail}
                  userName={item.name}
                  size={24}
                  fontSize={12}
                />
                <Text sm medium color={colors.text} style={styles.agentName}>
                  {`${item.name}`}
                </Text>
              </View>
              {assigneeId === item.id && (
                <View>
                  <Icon icon="checkmark-outline" color={colors.textDark} size={20} />
                </View>
              )}
            </Pressable>
          ))}
          {filteredAgentsOnSearch && filteredAgentsOnSearch.length === 0 && (
            <View style={styles.emptyView}>
              <Text sm medium color={colors.textDark}>
                {i18n.t('CONVERSATION_AGENTS.NO_RESULT')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

AssignAgent.propTypes = propTypes;
export default AssignAgent;
