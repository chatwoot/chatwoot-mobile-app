import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import i18n from 'i18n';

import { selectConversationWatchers } from 'reducer/conversationWatchersSlice';
import { selectUserId } from 'reducer/authSlice';
import { Text, Icon, UserAvatarGroup, Pressable } from 'components';

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

const ConversationParticipant = ({ conversationId }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const userId = useSelector(selectUserId);
  const conversationParticipantList = useSelector(selectConversationWatchers);
  const conversationWatchers = conversationId ? conversationParticipantList[conversationId] : null;

  const hasMultipleWatchers = conversationWatchers?.length > 1;

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

  const isConversationWatchersExist = conversationWatchers?.length > 0;

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
              <Pressable style={styles.addParticipantsButton}>
                <Icon color={colors.text} icon="settings-outline" size={16} />
              </Pressable>
            </View>
            <View style={styles.watchersWrapper}>
              {isConversationWatchersExist ? (
                <UserAvatarGroup
                  users={conversationWatchers}
                  size={24}
                  fontSize={10}
                  showMoreText
                  moreText={moreAvatarText}
                  length={7}
                />
              ) : (
                <View />
              )}
              {isCurrentUserWatching ? (
                <Text sm color={colors.textGrayLighter}>
                  {i18n.t('CONVERSATION_PARTICIPANTS.YOU_ARE_WATCHING')}
                </Text>
              ) : (
                <Pressable style={styles.watchConversationButton}>
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
    </View>
  );
};

ConversationParticipant.propTypes = propTypes;
export default ConversationParticipant;
