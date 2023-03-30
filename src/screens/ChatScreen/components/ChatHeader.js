import React, { createRef } from 'react';
import {
  withStyles,
  Icon,
  TopNavigation,
  TopNavigationAction,
  Spinner,
} from '@ui-kitten/components';
import ActionSheet from 'react-native-actions-sheet';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, TouchableOpacity } from 'react-native';
import { getTypingUsersText, getCustomerDetails } from 'helpers';
import CustomText from 'components/Text';
import { selectConversationToggleStatus } from 'reducer/conversationSlice';
import conversationActions from 'reducer/conversationSlice.action';
import { UserAvatar, Pressable } from 'components';
import { getInboxName } from 'helpers';
import ConversationAction from '../../ConversationAction/ConversationAction';
import Banner from 'src/screens/ChatScreen/components/Banner';
import InboxName from 'src/screens/ChatScreen/components/InboxName';
import TypingStatus from 'src/screens/ChatScreen/components/UserTypingStatus';
import i18n from 'i18n';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { INBOX_ICON } from 'src/constants/index';
import { inboxesSelector } from 'reducer/inboxSlice';
import { selectUserId } from 'reducer/authSlice';
const styles = theme => ({
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarView: {
    marginHorizontal: 4,
  },
  titleView: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    height: 34,
  },
  headerTitle: {
    textTransform: 'capitalize',
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-medium'],
  },
  actionIcon: {
    flexDirection: 'row',
  },
  loadingSpinner: {
    marginTop: 2,
    marginRight: 4,
    padding: 4,
  },
  inboxNameTypingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inboxNameWrap: {
    marginTop: 2,
    marginLeft: 4,
  },
  statusView: {
    padding: 4,
  },
  backButtonView: {
    padding: 2,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
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
  eva: { style, theme },
  onBackPress,
}) => {
  const navigation = useNavigation();
  const actionSheetRef = createRef();
  const dispatch = useDispatch();
  const conversationToggleStatus = useSelector(selectConversationToggleStatus);
  const userId = useSelector(selectUserId);

  const showActionSheet = () => {
    actionSheetRef.current?.setModalVisible();
  };

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

  const ResolveIcon = () => {
    return (
      <TouchableOpacity style={style.statusView} onPress={toggleStatusForConversations}>
        <Icon
          fill={theme['color-success-500']}
          name="checkmark-circle-outline"
          height={24}
          width={24}
        />
      </TouchableOpacity>
    );
  };

  const ReopenIcon = () => {
    return (
      <TouchableOpacity style={style.statusView} onPress={toggleStatusForConversations}>
        <Icon fill={theme['color-warning-600']} name="undo-outline" height={24} width={24} />
      </TouchableOpacity>
    );
  };

  const MenuIcon = () => {
    return (
      <TouchableOpacity style={style.statusView} onPress={showActionSheet}>
        <Icon fill={theme['color-black-900']} name="more-vertical" height={24} width={24} />
      </TouchableOpacity>
    );
  };

  const BackIcon = () => (
    <TouchableOpacity style={style.backButtonView} onPress={onBackPress}>
      <Icon fill={theme['color-black-900']} name="arrow-ios-back-outline" height={24} width={24} />
    </TouchableOpacity>
  );

  const BackAction = props => <TopNavigationAction {...props} icon={BackIcon} />;

  const renderLeftControl = () => <BackAction onPress={onBackPress} />;
  const renderRightControl = () => {
    if (conversationDetails) {
      const { status } = conversationDetails;
      const openConversation = status === 'open';
      const resolvedConversation = status === 'resolved';
      return (
        <View style={style.actionIcon}>
          {conversationToggleStatus ? (
            <View style={style.loadingSpinner}>
              <Spinner size="small" />
            </View>
          ) : (
            <React.Fragment>
              {openConversation && (
                <TopNavigationAction
                  style={style.resolveIcon}
                  onPress={toggleStatusForConversations}
                  icon={ResolveIcon}
                />
              )}
              {resolvedConversation && (
                <TopNavigationAction onPress={toggleStatusForConversations} icon={ReopenIcon} />
              )}
            </React.Fragment>
          )}
          <TopNavigationAction onPress={showActionSheet} icon={MenuIcon} />
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

  const onPressAction = ({ itemType }) => {
    actionSheetRef.current?.hide();
    if (itemType === 'self_assign') {
      if (conversationDetails) {
        AnalyticsHelper.track(CONVERSATION_EVENTS.SELF_ASSIGN_CONVERSATION);
        dispatch(
          conversationActions.assignConversation({
            conversationId: conversationDetails.id,
            assigneeId: userId,
          }),
        );
      }
    }
    if (itemType === 'assignee') {
      if (conversationDetails) {
        navigation.navigate('AgentScreen', { conversationDetails });
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
    }
    if (itemType === 'label') {
      if (conversationDetails) {
        navigation.navigate('LabelScreen', { conversationDetails });
      }
    }
    if (itemType === 'team') {
      if (conversationDetails) {
        navigation.navigate('TeamScreen', { conversationDetails });
      }
    }
    if (itemType === 'mute_conversation') {
      const { muted } = conversationDetails;
      if (!muted) {
        AnalyticsHelper.track(CONVERSATION_EVENTS.MUTE_CONVERSATION);
        dispatch(conversationActions.muteConversation({ conversationId }));
      }
    }
    if (itemType === 'unmute_conversation') {
      AnalyticsHelper.track(CONVERSATION_EVENTS.UN_MUTE_CONVERSATION);
      const { muted } = conversationDetails;
      if (muted) {
        dispatch(conversationActions.unmuteConversation({ conversationId }));
      }
    }
  };

  const toggleStatusForConversations = () => {
    try {
      AnalyticsHelper.track(CONVERSATION_EVENTS.TOGGLE_STATUS);
      dispatch(conversationActions.toggleConversationStatus({ conversationId }));
    } catch (error) {}
  };

  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId,
  });
  const customerDetails = getCustomerDetails({ conversationDetails, conversationMetaDetails });

  return (
    <React.Fragment>
      <TopNavigation
        title={() => (
          <Pressable style={style.headerView} onPress={showConversationDetails}>
            {customerDetails.name && (
              <UserAvatar
                thumbnail={customerDetails.thumbnail}
                userName={customerDetails.name}
                size={42}
                fontSize={14}
                channel={customerDetails.channel}
                inboxInfo={inboxDetails}
                chatAdditionalInfo={additionalAttributes}
                availabilityStatus={availabilityStatus !== 'offline' ? availabilityStatus : ''}
              />
            )}

            <View style={style.titleView}>
              <View>
                {customerDetails.name && (
                  <CustomText style={style.headerTitle}>
                    {customerDetails.name && customerDetails.name.length > 24
                      ? ` ${customerDetails.name.substring(0, 20)}...`
                      : ` ${customerDetails.name}`}
                  </CustomText>
                )}
              </View>
              <View style={style.inboxNameTypingWrap}>
                {typingUser ? (
                  <TypingStatus typingUser={typingUser} />
                ) : (
                  <View style={style.inboxNameWrap}>
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
      <ActionSheet ref={actionSheetRef} gestureEnabled defaultOverlayOpacity={0.3}>
        <ConversationAction
          conversationDetails={conversationDetails}
          onPressAction={onPressAction}
        />
      </ActionSheet>
    </React.Fragment>
  );
};

ChatHeader.propTypes = propTypes;

const ChatHeaderItem = React.memo(withStyles(ChatHeader, styles));
export default ChatHeaderItem;
