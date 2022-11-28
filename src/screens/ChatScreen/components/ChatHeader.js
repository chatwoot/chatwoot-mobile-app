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
import { TouchableOpacity, View } from 'react-native';
import UserAvatar from 'components/UserAvatar';
import { getTypingUsersText, getCustomerDetails } from 'helpers';
import CustomText from 'components/Text';
import {
  unAssignConversation,
  toggleConversationStatus,
  muteConversation,
  unmuteConversation,
} from 'actions/conversation';
import { getInboxName } from 'helpers';
import ConversationAction from '../../ConversationAction/ConversationAction';
import { captureEvent } from '../../../helpers/Analytics';
import Banner from 'src/screens/ChatScreen/components/Banner';
import InboxName from 'src/screens/ChatScreen/components/InboxName';
import TypingStatus from 'src/screens/ChatScreen/components/UserTypingStatus';
import i18n from 'i18n';

import { INBOX_ICON } from 'src/constants/index';

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
  chatHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  inboxNameTypingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inboxNameWrap: {
    marginTop: 2,
    marginLeft: 4,
  },
});

const BackIcon = style => <Icon {...style} name="arrow-back-outline" height={40} width={24} />;

const MenuIcon = style => {
  return <Icon {...style} name="more-vertical" height={40} width={20} />;
};

const BackAction = props => <TopNavigationAction {...props} icon={BackIcon} />;

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

  const showActionSheet = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const inboxes = useSelector(state => state.inbox.data);
  const inboxId = conversationDetails && conversationDetails.inbox_id;
  const channelType =
    conversationDetails && conversationDetails.meta && conversationDetails.meta.channel;

  const conversation = useSelector(state => state.conversation);
  const { isChangingConversationStatus } = conversation;

  const ResolveIcon = () => {
    return (
      <Icon
        fill={theme['color-success-500']}
        name="checkmark-circle-outline"
        height={40}
        width={20}
      />
    );
  };

  const ReopenIcon = () => {
    return <Icon fill={theme['color-warning-600']} name="undo-outline" height={40} width={20} />;
  };

  const renderLeftControl = () => <BackAction onPress={onBackPress} />;
  const renderRightControl = () => {
    if (conversationDetails) {
      const { status } = conversationDetails;
      const openConversation = status === 'open';
      const resolvedConversation = status === 'resolved';
      return (
        <View style={style.actionIcon}>
          {isChangingConversationStatus ? (
            <View style={style.loadingSpinner}>
              <Spinner size="small" />
            </View>
          ) : (
            <View>
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
            </View>
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
    if (itemType === 'assignee') {
      if (conversationDetails) {
        navigation.navigate('AgentScreen', { conversationDetails });
      }
    }
    if (itemType === 'unassign') {
      captureEvent({ eventName: 'Toggle conversation status' });
      dispatch(
        unAssignConversation({
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
        dispatch(muteConversation({ conversationId }));
      }
    }
    if (itemType === 'unmute_conversation') {
      const { muted } = conversationDetails;
      if (muted) {
        dispatch(unmuteConversation({ conversationId }));
      }
    }
  };

  const toggleStatusForConversations = () => {
    try {
      captureEvent({ eventName: 'Toggle conversation status' });
      dispatch(toggleConversationStatus({ conversationId }));
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
        style={style.chatHeader}
        title={() => (
          <TouchableOpacity
            style={style.headerView}
            onPress={showConversationDetails}
            activeOpacity={0.5}>
            {customerDetails.name && (
              <UserAvatar
                style={style.avatarView}
                userName={customerDetails.name}
                size={40}
                fontSize={14}
                thumbnail={customerDetails.thumbnail}
                defaultBGColor={theme['color-primary-default']}
                channel={customerDetails.channel}
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
          </TouchableOpacity>
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
