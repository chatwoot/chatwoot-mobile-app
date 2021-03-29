import React, { createRef } from 'react';
import { withStyles, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import ActionSheet from 'react-native-actions-sheet';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { TouchableOpacity, View } from 'react-native';
import UserAvatar from 'components/UserAvatar';
import { getTypingUsersText } from 'helpers';
import CustomText from 'components/Text';
import { unAssignConversation, toggleConversationStatus } from 'actions/conversation';
import ConversationAction from '../../ConversationAction/ConversationAction';

const styles = (theme) => ({
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarView: {
    marginHorizontal: 4,
  },
  titleView: {
    marginHorizontal: 8,
  },
  headerTitle: {
    textTransform: 'capitalize',
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-large'],
  },
  subHeaderTitle: {
    fontSize: theme['font-size-extra-small'],
    color: theme['color-gray'],
    paddingTop: 4,
    paddingLeft: 4,
  },
});

const BackIcon = (style) => (
  <Icon {...style} name="arrow-ios-back-outline" height={24} width={24} />
);

const MenuIcon = (style) => {
  return <Icon {...style} name="more-vertical" height={24} width={24} />;
};

const BackAction = (props) => <TopNavigationAction {...props} icon={BackIcon} />;

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

  const renderLeftControl = () => <BackAction onPress={onBackPress} />;
  const renderRightControl = () => {
    if (conversationDetails) {
      return <TopNavigationAction onPress={showActionSheet} icon={MenuIcon} />;
    }
    return null;
  };

  const onPressAction = ({ itemType }) => {
    actionSheetRef.current?.hide();

    if (itemType === 'assignee') {
      if (conversationDetails) {
        navigation.navigate('AgentScreen', { conversationDetails });
      }
    }
    if (itemType === 'toggle_status') {
      dispatch(toggleConversationStatus({ conversationId }));
    }
    if (itemType === 'unassign') {
      dispatch(
        unAssignConversation({
          conversationId: conversationDetails.id,
          assigneeId: 0,
        }),
      );
    }
  };
  const senderDetails = {
    name: null,
    thumbnail: null,
  };
  const typingUser = getTypingUsersText({
    conversationTypingUsers,
    conversationId,
  });

  if (conversationMetaDetails) {
    const {
      sender: { name, thumbnail },
      channel,
    } = conversationMetaDetails;
    senderDetails.name = name;
    senderDetails.thumbnail = thumbnail;
    senderDetails.channel = channel;
  }
  return (
    <React.Fragment>
      <TopNavigation
        title={
          <TouchableOpacity
            style={style.headerView}
            onPress={showConversationDetails}
            activeOpacity={0.5}>
            <UserAvatar
              style={style.avatarView}
              userName={senderDetails.name}
              thumbnail={senderDetails.thumbnail}
              defaultBGColor={theme['color-primary-default']}
              channel={senderDetails.channel}
            />
            <View style={style.titleView}>
              <View>
                <CustomText style={style.headerTitle}>
                  {senderDetails.name.length > 24
                    ? ` ${senderDetails.name.substring(0, 20)}...`
                    : ` ${senderDetails.name}`}
                </CustomText>
              </View>
              {typingUser ? (
                <View>
                  <CustomText style={style.subHeaderTitle}>
                    {typingUser ? `${typingUser}` : ''}
                  </CustomText>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        }
        accessoryLeft={renderLeftControl}
        accessoryRight={renderRightControl}
      />
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

const ChatHeaderItem = withStyles(ChatHeader, styles);
export default ChatHeaderItem;
