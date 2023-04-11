import React, { useRef, useCallback, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Share, ActivityIndicator, Dimensions } from 'react-native';
import { getTypingUsersText, getCustomerDetails } from 'helpers';
import { selectConversationToggleStatus } from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
import { UserAvatar, Pressable, Text, Icon } from 'components';
import { getInboxName } from 'helpers';
import Banner from 'screens/ChatScreen/components/Banner';
import InboxName from 'screens/ChatScreen/components/InboxName';
import TypingStatus from 'screens/ChatScreen/components/UserTypingStatus';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import i18n from 'i18n';
import { getTextSubstringWithEllipsis } from 'helpers';
import { getConversationUrl } from 'helpers/UrlHelper';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { INBOX_ICON, CONVERSATION_STATUS } from 'constants/index';
import { inboxesSelector } from 'reducer/inboxSlice';
import { selectUserId } from 'reducer/authSlice';
import differenceInHours from 'date-fns/differenceInHours';
import createStyles from './ChatHeader.styles.js';
const deviceHeight = Dimensions.get('window').height;

// Bottom sheet items
import ConversationAction from '../../ConversationAction/ConversationAction';
import SnoozeConversationItems from './SnoozeConversation';

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
  const inboxDetails = inboxes ? inboxes.find(inbox => inbox.id === inboxId) : {};

  const {
    id: currentConversationId,
    account_id: accountId,
    inbox_id: inboxId,
    status: conversationStatus,
    can_reply: canReply,
    meta: {
      sender: { availability_status: availabilityStatus },
      channel: channelType,
    },
    additional_attributes: additionalAttributes = {},
    muted,
  } = conversationDetails;

  const snoozedConversation = conversationStatus === CONVERSATION_STATUS.SNOOZED;
  const pendingConversation = conversationStatus === CONVERSATION_STATUS.PENDING;

  const muteConversation = () => {
    if (!muted) {
      AnalyticsHelper.track(CONVERSATION_EVENTS.MUTE_CONVERSATION);
      dispatch(conversationActions.muteConversation({ conversationId }));
    }
  };

  const UnmuteConversation = () => {
    if (muted) {
      AnalyticsHelper.track(CONVERSATION_EVENTS.UN_MUTE_CONVERSATION);
      dispatch(conversationActions.unmuteConversation({ conversationId }));
    }
  };

  const renderLeftControl = () => (
    <Pressable style={styles.backButtonView} onPress={onBackPress}>
      <Icon icon="arrow-chevron-left-outline" color={colors.textDark} size={24} />
    </Pressable>
  );
  const renderRightControl = () => {
    if (conversationDetails) {
      const openConversation = conversationStatus === CONVERSATION_STATUS.OPEN;
      const resolvedConversation = conversationStatus === CONVERSATION_STATUS.RESOLVED;
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
                <Pressable
                  style={styles.statusView}
                  onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.RESOLVED)}>
                  <Icon icon="checkmark-outline" color={colors.successColor} size={24} />
                </Pressable>
              )}
              {resolvedConversation && (
                <Pressable
                  style={styles.statusView}
                  onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.OPEN)}>
                  <Icon icon="arrow-redo-outline" color={colors.warningColor} size={24} />
                </Pressable>
              )}
              {snoozedConversation && (
                <Pressable
                  style={styles.statusView}
                  onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.OPEN)}>
                  <Icon
                    icon="person-arrow-back-outline"
                    color={colors.primaryColorDarker}
                    size={24}
                  />
                </Pressable>
              )}
              {pendingConversation && (
                <Pressable
                  style={styles.statusView}
                  onPress={() => toggleStatusForConversations(CONVERSATION_STATUS.OPEN)}>
                  <Icon
                    icon="person-arrow-back-outline"
                    color={colors.primaryColorDarker}
                    size={24}
                  />
                </Pressable>
              )}
            </React.Fragment>
          )}
          {!muted ? (
            <Pressable style={styles.statusView} onPress={muteConversation}>
              <Icon icon="speaker-mute-outline" color={colors.textDark} size={24} />
            </Pressable>
          ) : (
            <Pressable style={styles.statusView} onPress={UnmuteConversation}>
              <Icon icon="speaker-1-outline" color={colors.textDark} size={24} />
            </Pressable>
          )}
          <Pressable style={styles.statusView} onPress={toggleActionModal}>
            <Icon icon="more-horizontal" color={colors.textDark} size={24} />
          </Pressable>
        </View>
      );
    }
    return null;
  };

  const isAWhatsappChannel =
    conversationMetaDetails && conversationMetaDetails.channel === 'Channel::Whatsapp';

  const canReplyInCurrentChat = canReply === true;

  const iconName = INBOX_ICON[channelType];
  const inboxName = getInboxName({ inboxes, inboxId });

  const onClickShareConversationURL = async () => {
    try {
      const conversationURL = await getConversationUrl({
        conversationId: currentConversationId,
        accountId: accountId,
      });

      await Share.share({
        url: conversationURL,
      });
    } catch (error) {
      //error
    }
  };

  const onPressAction = ({ itemType }) => {
    if (itemType !== 'share') {
      closeActionModal();
    }
    if (conversationDetails) {
      if (itemType === 'self_assign') {
        AnalyticsHelper.track(CONVERSATION_EVENTS.SELF_ASSIGN_CONVERSATION);
        dispatch(
          conversationActions.assignConversation({
            conversationId: conversationDetails.id,
            assigneeId: userId,
          }),
        );
      }
      if (itemType === 'assignee') {
        navigation.navigate('AgentScreen', { conversationDetails });
      }
      if (itemType === 'unassign') {
        AnalyticsHelper.track(CONVERSATION_EVENTS.UNASSIGN_CONVERSATION);
        dispatch(
          conversationActions.assignConversation({
            conversationId: conversationDetails.id,
            assigneeId: 0,
          }),
        );
      }
      if (itemType === 'details') {
        navigation.navigate('ConversationDetails', { conversationDetails });
      }
      if (itemType === 'label') {
        navigation.navigate('LabelScreen', { conversationDetails });
      }
      if (itemType === 'team') {
        navigation.navigate('TeamScreen', { conversationDetails });
      }
      if (itemType === 'pending') {
        toggleStatusForConversations(CONVERSATION_STATUS.PENDING);
      }
      if (itemType === 'snooze') {
        toggleSnoozeActionModal();
      }
      if (itemType === 'share') {
        onClickShareConversationURL();
      }
    }
  };

  const toggleStatusForConversations = status => {
    let chatStatus = '';
    if (status === CONVERSATION_STATUS.RESOLVED) {
      chatStatus = CONVERSATION_STATUS.RESOLVED;
    } else if (status === CONVERSATION_STATUS.OPEN) {
      chatStatus = CONVERSATION_STATUS.OPEN;
    } else if (status === CONVERSATION_STATUS.PENDING) {
      chatStatus = CONVERSATION_STATUS.PENDING;
    }
    try {
      AnalyticsHelper.track(CONVERSATION_EVENTS.TOGGLE_STATUS);
      dispatch(
        conversationActions.toggleConversationStatus({
          conversationId: conversationId,
          status: chatStatus,
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
  const actionModalModalSnapPoints = useMemo(() => [deviceHeight - 410, deviceHeight - 410], []);
  const toggleActionModal = useCallback(() => {
    actionModal.current.present() || actionModal.current?.close();
  }, []);
  const closeActionModal = useCallback(() => {
    actionModal.current?.close();
  }, []);

  // Conversation action modal
  const snoozeActionModal = useRef(null);
  const snoozeActionModalSnapPoints = useMemo(() => [deviceHeight - 410, deviceHeight - 410], []);
  const toggleSnoozeActionModal = useCallback(() => {
    snoozeActionModal.current.present() || snoozeActionModal.current?.close();
  }, []);
  const closeSnoozeActionModal = useCallback(() => {
    snoozeActionModal.current?.close();
  }, []);

  const closeModals = () => {
    closeSnoozeActionModal();
    closeActionModal();
  };

  return (
    <React.Fragment>
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderLeft}>
          {renderLeftControl()}
          <Pressable style={styles.headerView} onPress={showConversationDetails}>
            {customerDetails.name && (
              <UserAvatar
                thumbnail={customerDetails.thumbnail}
                userName={customerDetails.name}
                size={40}
                fontSize={16}
                channel={customerDetails.channel}
                inboxInfo={inboxDetails}
                chatAdditionalInfo={additionalAttributes}
                availabilityStatus={availabilityStatus !== 'offline' ? availabilityStatus : ''}
              />
            )}

            <View style={styles.titleView}>
              <View style={styles.customerName}>
                {customerDetails.name && (
                  <Text md medium color={colors.textDark}>
                    {getTextSubstringWithEllipsis(customerDetails.name, 13)}
                  </Text>
                )}
                <View style={styles.infoIcon}>
                  <Icon icon="info-outline" color={colors.textLighter} size={13} />
                </View>
              </View>
              <View style={styles.inboxNameTypingWrap}>
                {typingUser ? (
                  <TypingStatus typingUser={typingUser} />
                ) : (
                  <View style={styles.inboxNameWrap}>
                    {conversationDetails && (
                      <InboxName
                        iconName={iconName}
                        inboxName={getTextSubstringWithEllipsis(inboxName, 22)}
                        size={'small'}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </View>
        <View>{renderRightControl()}</View>
      </View>
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
        showHeader
        headerTitle={i18n.t('CONVERSATION.SNOOZE')}
        closeFilter={closeSnoozeActionModal}
        children={
          <SnoozeConversationItems
            colors={colors}
            conversationId={conversationId}
            activeSnoozeValue={activeSnoozeValue()}
            closeModal={closeModals}
          />
        }
      />
    </React.Fragment>
  );
};

ChatHeader.propTypes = propTypes;
export default ChatHeader;
