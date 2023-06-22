import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet, Dimensions } from 'react-native';
import i18n from 'i18n';
import { useDispatch } from 'react-redux';

import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import ConversationAgentItems from 'components/ConversationAgentItem';
import { inboxAgentSelectors } from 'reducer/inboxAgentsSlice';
import {
  actions as conversationWatchersActions,
  selectConversationWatchers,
} from 'reducer/conversationWatchersSlice';
import { selectUserId } from 'reducer/authSlice';
import { Text, Icon, UserAvatarGroup, Pressable } from 'components';

const deviceHeight = Dimensions.get('window').height;

const createStyles = theme => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    separator: {
      backgroundColor: colors.backgroundLight,
      width: '100%',
      paddingVertical: spacing.smaller,
      paddingLeft: spacing.small,
    },
    separatorView: {
      width: '100%',
    },
    accordionItemWrapper: {
      flexDirection: 'column',
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      width: '100%',
    },
    totalWatchersWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.smaller,
    },
    addParticipantsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundLight,
      borderRadius: borderRadius.micro,
      paddingVertical: spacing.micro,
      paddingHorizontal: spacing.micro,
    },
    watchersWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.tiny,
      height: 26,
    },
    watchConversationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    watchConversationButtonText: {
      marginLeft: spacing.micro,
    },
  });
};

const propTypes = {
  conversationId: PropTypes.number.isRequired,
};

const ConversationParticipants = ({ conversationId }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  const userId = useSelector(selectUserId);
  const agents = useSelector(state => inboxAgentSelectors.inboxAssignedAgents(state));
  const conversationParticipantList = useSelector(selectConversationWatchers);
  const conversationWatchers = conversationId ? conversationParticipantList[conversationId] : null;

  const currentAgent = agents.find(agent => agent.id === userId);

  const [watchersList, setWatchersList] = useState([]);
  useEffect(() => {
    if (conversationWatchers) {
      setWatchersList(conversationWatchers);
    }
  }, [conversationWatchers]);

  const updateConversationWatchers = agent => {
    setWatchersList(prevList => {
      const agentId = agent.id;
      const isAgentSelected = prevList.some(participant => participant.id === agentId);
      let updatedList;
      if (isAgentSelected) {
        updatedList = prevList.filter(participant => participant.id !== agentId);
      } else {
        updatedList = [...prevList, agent];
      }
      const userIds = updatedList.map(el => el.id);
      updateConversationParticipant(userIds);
      return updatedList;
    });
  };
  const updateConversationParticipant = userIds => {
    dispatch(conversationWatchersActions.update({ conversationId, userIds }));
  };

  const activeConversationWatchersIds = useMemo(
    () => watchersList?.map(watcher => watcher.id),
    [watchersList],
  );

  const hasMultipleWatchers = watchersList?.length > 1;

  const isConversationWatchersExist = watchersList?.length > 0;

  const watchersText = hasMultipleWatchers
    ? i18n.t('CONVERSATION_PARTICIPANTS.TOTAL_PARTICIPANTS_TEXT', {
        count: conversationWatchers.length,
      })
    : i18n.t('CONVERSATION_PARTICIPANTS.TOTAL_PARTICIPANT_TEXT', {
        count: 1,
      });

  const moreAvatarText = hasMultipleWatchers
    ? i18n.t('CONVERSATION_PARTICIPANTS.REMAINING_PARTICIPANTS_TEXT')
    : i18n.t('CONVERSATION_PARTICIPANTS.REMAINING_PARTICIPANT_TEXT');

  const isCurrentUserWatching = conversationWatchers?.some(user => user.id === userId);

  // Bottom sheet modal actions and snap points
  const conversationParticipantsModal = useRef(null);
  const conversationParticipantsModalSnapPoints = useMemo(
    () => [deviceHeight - 120, deviceHeight - 120],
    [],
  );
  const toggleConversationParticipantsModal = useCallback(() => {
    conversationParticipantsModal.current.present() ||
      conversationParticipantsModal.current?.dismiss();
  }, []);
  const closeConversationParticipantsModal = useCallback(() => {
    conversationParticipantsModal.current?.dismiss();
  }, []);

  return (
    <View>
      <View>
        <View style={styles.separatorView}>
          <View style={styles.separator}>
            <Text bold sm color={colors.textDark}>
              {i18n.t('CONVERSATION_PARTICIPANTS.TITLE')}
            </Text>
          </View>
          <View style={styles.accordionItemWrapper}>
            <View style={styles.totalWatchersWrapper}>
              {!isConversationWatchersExist ? (
                <Text sm color={colors.textGrayLighter}>
                  {i18n.t('CONVERSATION_PARTICIPANTS.NO_PARTICIPANTS_TEXT')}
                </Text>
              ) : (
                <Text sm color={colors.textDark}>
                  {watchersText}
                </Text>
              )}
              <Pressable
                style={styles.addParticipantsButton}
                onPress={toggleConversationParticipantsModal}>
                <Icon color={colors.text} icon="settings-outline" size={16} />
              </Pressable>
            </View>
            <View style={styles.watchersWrapper}>
              {isConversationWatchersExist ? (
                <UserAvatarGroup
                  users={watchersList}
                  size={24}
                  fontSize={10}
                  showMoreText
                  moreText={moreAvatarText}
                  length={6}
                />
              ) : (
                <View />
              )}
              {isCurrentUserWatching ? (
                <Text sm color={colors.textGrayLighter}>
                  {i18n.t('CONVERSATION_PARTICIPANTS.YOU_ARE_WATCHING')}
                </Text>
              ) : (
                <Pressable
                  style={styles.watchConversationButton}
                  onPress={() => updateConversationWatchers(currentAgent)}>
                  <Icon color={colors.primaryColor} icon="arrow-right" size={12} />
                  <Text xs color={colors.primaryColor} style={styles.watchConversationButtonText}>
                    {i18n.t('CONVERSATION_PARTICIPANTS.WATCH_CONVERSATION')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
      <BottomSheetModal
        bottomSheetModalRef={conversationParticipantsModal}
        initialSnapPoints={conversationParticipantsModalSnapPoints}
        showHeader
        headerTitle={i18n.t('CONVERSATION_PARTICIPANTS.ADD_PARTICIPANTS')}
        closeFilter={closeConversationParticipantsModal}
        children={
          <ConversationAgentItems
            colors={colors}
            title={i18n.t('CONVERSATION_PARTICIPANTS.SELECT_PARTICIPANTS')}
            agentsList={agents}
            activeValue={activeConversationWatchersIds}
            onClick={updateConversationWatchers}
          />
        }
      />
    </View>
  );
};

ConversationParticipants.propTypes = propTypes;
export default ConversationParticipants;
