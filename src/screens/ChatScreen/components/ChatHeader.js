import React, { useRef, useCallback, useMemo } from 'react';
import { TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { useTheme } from '@react-navigation/native';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Share, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { getTypingUsersText, getCustomerDetails } from 'helpers';
import { selectConversationToggleStatus } from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
import { UserAvatar, Pressable, Text, Icon } from 'components';
import { getInboxName } from 'helpers';
import Banner from 'src/screens/ChatScreen/components/Banner';
import InboxName from 'src/screens/ChatScreen/components/InboxName';
import TypingStatus from 'src/screens/ChatScreen/components/UserTypingStatus';
import i18n from 'i18n';
import { getConversationUrl } from 'src/helpers/UrlHelper';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { INBOX_ICON, CONVERSATION_STATUS } from 'src/constants/index';
import { inboxesSelector } from 'reducer/inboxSlice';
import { selectUserId } from 'reducer/authSlice';
import differenceInHours from 'date-fns/differenceInHours';
const deviceHeight = Dimensions.get('window').height;

// Bottom sheet items
import ConversationAction from '../../ConversationAction/ConversationAction';
import SnoozeConversationItems from './SnoozeConversation';

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    headerView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleView: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginHorizontal: spacing.smaller,
      height: spacing.large,
    },
    chatHeader: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    actionIcon: {
      flexDirection: 'row',
    },
    loadingSpinner: {
      marginTop: spacing.tiny,
      marginRight: spacing.smaller,
      padding: spacing.micro,
    },
    inboxNameTypingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    inboxNameWrap: {
      marginTop: spacing.tiny,
      marginLeft: spacing.micro,
    },
    statusView: {
      padding: spacing.micro,
    },
    backButtonView: {
      padding: spacing.tiny,
    },
  });
};

const propTypes = {
  conversationId: PropTypes.number,
  onBackPress: PropTypes.func,
  showConversationDetails: PropTypes.func,
  conversationDetails: PropTypes.object,
  conversationMetaDetails: PropTypes.object,
  conversationTypingUsers: PropTypes.shape({}),
};

const ChatHeader = ({
  conversationDetails,
  conversationMetaDetails,
  conversationId,
  conversationTypingUsers,
  showConversationDetails,
  onBackPress,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const conversationToggleStatus = useSelector(selectConversationToggleStatus);
  const userId = useSelector(selectUserId);

  const inboxes = useSelector(inboxesSelector.selectAll);
  const inboxId = conversationDetails && conversationDetails.inbox_id;
  const inboxDetails = inboxes ? inboxes.find(inbox => inbox.id === inboxId) : {};
  const channelType =
    conversationDetails && conversationDetails.meta && conversationDetails.meta.channel;

  const {
    meta: {
      sender: { availability_status: availabilityStatus },
    },
    additional_attributes: additionalAttributes = {},
  } = conversationDetails;

  const snoozedConversation = conversationDetails.status === CONVERSATION_STATUS.SNOOZED;
  const pendingConversation = conversationDetails.status === CONVERSATION_STATUS.PENDING;

  const ResolveIcon = () => {
    return (
      <Pressable
        style={styles.statusView}
        onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.RESOLVED)}>
        <Icon icon="checkmark-double-outline" color={colors.successColor} size={24} />
      </Pressable>
    );
  };

  const ReopenIcon = () => {
    return (
      <Pressable
        style={styles.statusView}
        onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.OPEN)}>
        <Icon icon="arrow-redo-outline" color={colors.warningColor} size={24} />
      </Pressable>
    );
  };

  const SnoozePendingOpenIcon = () => {
    return (
      <Pressable
        style={styles.statusView}
        onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.OPEN)}>
        <Icon icon="person-arrow-back-outline" color={colors.primaryColorDarker} size={24} />
      </Pressable>
    );
  };

  const MenuIcon = () => {
    return (
      <Pressable style={styles.statusView} onPress={toggleActionModal}>
        <Icon icon="more-vertical" color={colors.textDark} size={24} />
      </Pressable>
    );
  };

  const BackIcon = () => (
    <Pressable style={styles.backButtonView} onPress={onBackPress}>
      <Icon icon="arrow-chevron-left-outline" color={colors.textDark} size={24} />
    </Pressable>
  );

  const BackAction = props => <TopNavigationAction {...props} icon={BackIcon} />;

  const renderLeftControl = () => <BackAction onPress={onBackPress} />;
  const renderRightControl = () => {
    if (conversationDetails) {
      const { status } = conversationDetails;
      const openConversation = status === 'open';
      const resolvedConversation = status === 'resolved';
      return (
        <View style={styles.actionIcon}>
          {conversationToggleStatus ? (
            <View style={styles.loadingSpinner}>
              <ActivityIndicator
                size="small"
                color={colors.textDark}
                animating={conversationToggleStatus}
              />
            </View>
          ) : (
            <React.Fragment>
              {openConversation && (
                <TopNavigationAction
                  style={styles.resolveIcon}
                  onPress={toggleStatusForConversations}
                  icon={ResolveIcon}
                />
              )}
              {resolvedConversation && (
                <TopNavigationAction onPress={toggleStatusForConversations} icon={ReopenIcon} />
              )}
              {snoozedConversation && (
                <TopNavigationAction
                  onPress={toggleStatusForConversations}
                  icon={SnoozePendingOpenIcon}
                />
              )}
              {pendingConversation && (
                <TopNavigationAction
                  onPress={toggleStatusForConversations}
                  icon={SnoozePendingOpenIcon}
                />
              )}
            </React.Fragment>
          )}
          <TopNavigationAction onPress={toggleActionModal} icon={MenuIcon} />
        </View>
      );
    }
    return null;
  };

  const isAWhatsappChannel =
    conversationMetaDetails && conversationMetaDetails.channel === 'Channel::Whatsapp';

  const canReplyInCurrentChat = conversationDetails && conversationDetails.can_reply === true;

  const iconName = INBOX_ICON[channelType];
  const inboxName = getInboxName({ inboxes, inboxId });

  const onClickShareConversationURL = async () => {
    const { id, account_id } = conversationDetails;
    try {
      const conversationURL = await getConversationUrl({
        conversationId: id,
        accountId: account_id,
      });

      await Share.share({
        url: conversationURL,
      });
    } catch (error) {
      //error
    }
  };

  const onPressAction = ({ itemType }) => {
    if (itemType === 'self_assign') {
      if (conversationDetails) {
        AnalyticsHelper.track(CONVERSATION_EVENTS.SELF_ASSIGN_CONVERSATION);
        dispatch(
          conversationActions.assignConversation({
            conversationId: conversationDetails.id,
            assigneeId: userId,
          }),
        );
        closeActionModal();
      }
    }
    if (itemType === 'assignee') {
      if (conversationDetails) {
        navigation.navigate('AgentScreen', { conversationDetails });
        closeActionModal();
      }
    }
    if (itemType === 'unassign') {
      AnalyticsHelper.track(CONVERSATION_EVENTS.UNASSIGN_CONVERSATION);
      dispatch(
        conversationActions.assignConversation({
          conversationId: conversationDetails.id,
          assigneeId: 0,
        }),
      );
      closeActionModal();
    }
    if (itemType === 'details') {
      if (conversationDetails) {
        navigation.navigate('ConversationDetails', { conversationDetails });
        closeActionModal();
      }
    }
    if (itemType === 'label') {
      if (conversationDetails) {
        navigation.navigate('LabelScreen', { conversationDetails });
        closeActionModal();
      }
    }
    if (itemType === 'team') {
      if (conversationDetails) {
        navigation.navigate('TeamScreen', { conversationDetails });
        closeActionModal();
      }
    }
    if (itemType === 'pending') {
      if (conversationDetails) {
        toggleStatusForConversations(CONVERSATION_STATUS.PENDING);
        closeActionModal();
      }
    }
    if (itemType === 'snooze') {
      if (conversationDetails) {
        toggleSnoozeActionModal();
      }
    }
    if (itemType === 'share') {
      if (conversationDetails) {
        onClickShareConversationURL();
        closeActionModal();
      }
    }
    if (itemType === 'mute_conversation') {
      const { muted } = conversationDetails;
      if (!muted) {
        AnalyticsHelper.track(CONVERSATION_EVENTS.MUTE_CONVERSATION);
        dispatch(conversationActions.muteConversation({ conversationId }));
        closeActionModal();
      }
    }
    if (itemType === 'unmute_conversation') {
      AnalyticsHelper.track(CONVERSATION_EVENTS.UN_MUTE_CONVERSATION);
      const { muted } = conversationDetails;
      if (muted) {
        dispatch(conversationActions.unmuteConversation({ conversationId }));
        closeActionModal();
      }
    }
    if (itemType === 'close') {
      closeActionModal();
    }
  };

  const toggleStatusForConversations = status => {
    let conversationStatus = '';
    if (status === CONVERSATION_STATUS.RESOLVED) {
      conversationStatus = CONVERSATION_STATUS.RESOLVED;
    } else if (status === CONVERSATION_STATUS.OPEN) {
      conversationStatus = CONVERSATION_STATUS.OPEN;
    } else if (status === CONVERSATION_STATUS.PENDING) {
      conversationStatus = CONVERSATION_STATUS.PENDING;
    }
    try {
      AnalyticsHelper.track(CONVERSATION_EVENTS.TOGGLE_STATUS);
      dispatch(
        conversationActions.toggleConversationStatus({
          conversationId: conversationId,
          status: conversationStatus,
        }),
      );
    } catch (error) {}
  };

  const activeSnoozeValue = () => {
    if (snoozedConversation) {
      const { snoozed_until: snoozedUntil } = conversationDetails;
      if (snoozedUntil) {
        const MAX_TIME_DIFFERENCE = 33;
        const isSnoozedUntilTomorrow =
          differenceInHours(new Date(snoozedUntil), new Date()) <= MAX_TIME_DIFFERENCE;
        return isSnoozedUntilTomorrow ? 'tomorrow' : 'nextWeek';
      }
      return 'nextReply';
    }
    return '';
  };

  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId,
  });
  const customerDetails = getCustomerDetails({ conversationDetails, conversationMetaDetails });

  // Conversation action modal
  const actionModal = useRef(null);
  const actionModalModalSnapPoints = useMemo(() => [deviceHeight - 382, deviceHeight - 382.1], []);
  const toggleActionModal = useCallback(() => {
    actionModal.current.present() || actionModal.current?.close();
  }, []);
  const closeActionModal = useCallback(() => {
    actionModal.current?.close();
  }, []);

  // Conversation action modal
  const snoozeActionModal = useRef(null);
  const snoozeActionModalSnapPoints = useMemo(() => [deviceHeight - 382, deviceHeight - 382.1], []);
  const toggleSnoozeActionModal = useCallback(() => {
    snoozeActionModal.current.present() || snoozeActionModal.current?.close();
  }, []);
  const closeSnoozeActionModal = useCallback(() => {
    snoozeActionModal.current?.close();
  }, []);

  return (
    <React.Fragment>
      <TopNavigation
        style={styles.chatHeader}
        title={() => (
          <Pressable style={styles.headerView} onPress={showConversationDetails}>
            {customerDetails.name && (
              <UserAvatar
                thumbnail={customerDetails.thumbnail}
                userName={customerDetails.name}
                size={40}
                fontSize={14}
                channel={customerDetails.channel}
                inboxInfo={inboxDetails}
                chatAdditionalInfo={additionalAttributes}
                availabilityStatus={availabilityStatus !== 'offline' ? availabilityStatus : ''}
              />
            )}

            <View style={styles.titleView}>
              <View>
                {customerDetails.name && (
                  <Text md medium color={colors.textDark}>
                    {customerDetails.name && customerDetails.name.length > 24
                      ? ` ${customerDetails.name.substring(0, 20)}...`
                      : ` ${customerDetails.name}`}
                  </Text>
                )}
              </View>
              <View style={styles.inboxNameTypingWrap}>
                {typingUser ? (
                  <TypingStatus typingUser={typingUser} />
                ) : (
                  <View style={styles.inboxNameWrap}>
                    {conversationDetails && (
                      <InboxName iconName={iconName} inboxName={inboxName} size={'small'} />
                    )}
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
        accessoryLeft={renderLeftControl}
        accessoryRight={renderRightControl}
      />
      {conversationDetails ? (
        <View>
          {!canReplyInCurrentChat && isAWhatsappChannel ? (
            <Banner
              text={i18n.t('BANNER.TWILIO_WHATSAPP.TEXT')}
              hrefText={i18n.t('BANNER.TWILIO_WHATSAPP.HREF_TEXT')}
              hrefLink={i18n.t('BANNER.TWILIO_WHATSAPP.HREF_LINK')}
              color={'alert'}
              closeButton={false}
            />
          ) : null}
          {!canReplyInCurrentChat && !isAWhatsappChannel ? (
            <Banner
              text={i18n.t('BANNER.FACEBOOK.TEXT')}
              hrefText={i18n.t('BANNER.FACEBOOK.HREF_TEXT')}
              hrefLink={i18n.t('BANNER.FACEBOOK.HREF_LINK')}
              color={'alert'}
              closeButton={false}
            />
          ) : null}
        </View>
      ) : null}
      <BottomSheetModal
        bottomSheetModalRef={actionModal}
        initialSnapPoints={actionModalModalSnapPoints}
        headerTitle="Conversation Actions"
        closeFilter={closeActionModal}
        children={
          <ConversationAction
            conversationDetails={conversationDetails}
            onPressAction={onPressAction}
          />
        }
      />
      <BottomSheetModal
        bottomSheetModalRef={snoozeActionModal}
        initialSnapPoints={snoozeActionModalSnapPoints}
        headerTitle="Conversation Actions"
        closeFilter={closeSnoozeActionModal}
        enablePanDownToClose={false}
        children={
          <SnoozeConversationItems
            colors={colors}
            conversationId={conversationId}
            activeSnoozeValue={activeSnoozeValue()}
            closeModal={closeSnoozeActionModal}
          />
        }
      />
    </React.Fragment>
  );
};

ChatHeader.propTypes = propTypes;
export default ChatHeader;
