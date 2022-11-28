import React, { Component, createRef } from 'react';
import { withStyles, Layout, List, Spinner } from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView, SectionList, View } from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import i18n from '../../i18n';
import { loadInitialMessage, setConversation } from '../../actions/conversation';

import styles from './NotificationScreen.style';
import NotificationItem from '../../components/NotificationItem';
import {
  getAllNotifications,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from '../../actions/notification';
import CustomText from '../../components/Text';
import { getGroupedNotifications } from '../../helpers';
import NotificationItemLoader from '../../components/NotificationItemLoader';
import { TouchableOpacity } from 'react-native-gesture-handler';
import HeaderBar from '../../components/HeaderBar';
import images from '../../constants/images';
import Empty from '../../components/Empty';
import NotificationActionItem from '../../components/NotificationActionItem';
import { captureEvent } from 'helpers/Analytics';

const LoaderData = new Array(24).fill(0);
const renderItemLoader = () => <NotificationItemLoader />;
const actionSheetRef = createRef();

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

class NotificationScreenComponent extends Component {
  static propTypes = {
    eva: PropTypes.shape({
      style: PropTypes.object,
      theme: PropTypes.object,
    }).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    loadInitialMessages: PropTypes.func,
    selectConversation: PropTypes.func,
    allNotifications: PropTypes.array.isRequired,
    isFetching: PropTypes.bool,
    isAllNotificationsLoaded: PropTypes.bool,
    getAllNotifications: PropTypes.func,
    markAllNotificationAsRead: PropTypes.func,
    unReadCount: PropTypes.number,
    markNotificationAsRead: PropTypes.func,
  };

  static defaultProps = {
    allNotifications: [],
    isFetching: false,
    selectConversation: () => {},
    isAllNotificationsLoaded: false,
  };

  state = {
    onEndReachedCalledDuringMomentum: true,
    pageNo: 1,
    menuVisible: false,
    refreshing: false,
  };
  componentDidMount() {
    this.loadNotifications();
  }

  loadNotifications = () => {
    const { pageNo } = this.state;
    this.props.getAllNotifications({
      pageNo,
    });
  };

  loadMoreNotifications = async () => {
    const { isAllNotificationsLoaded } = this.props;
    await this.setState(state => ({
      pageNo: state.pageNo + 1,
    }));
    if (!isAllNotificationsLoaded) {
      this.loadNotifications();
    }
  };

  onEndReached = ({ distanceFromEnd }) => {
    const { onEndReachedCalledDuringMomentum } = this.state;
    if (!onEndReachedCalledDuringMomentum) {
      this.loadMoreNotifications();
      this.setState({
        onEndReachedCalledDuringMomentum: true,
      });
    }
  };

  renderEmptyMessage = () => {
    return (
      <Empty
        image={images.emptyNotifications}
        title={i18n.t('NOTIFICATION.EMPTY')}
        subTitle={i18n.t('NOTIFICATION.EMPTY_MORE_TEXT')}
      />
    );
  };

  renderEmptyList = () => {
    const {
      eva: { style },
    } = this.props;
    return (
      <Layout style={style.tabContainer}>
        <List data={LoaderData} renderItem={renderItemLoader} />
      </Layout>
    );
  };

  renderMoreLoader = () => {
    const {
      isAllNotificationsLoaded,
      eva: { style },
    } = this.props;
    return (
      <View style={style.loadMoreSpinnerView}>
        {!isAllNotificationsLoaded ? (
          <Spinner size="medium" />
        ) : (
          <CustomText>{`${i18n.t('NOTIFICATION.ALL_NOTIFICATION_LOADED')} 🎉`}</CustomText>
        )}
      </View>
    );
  };

  toggleMenu = () => {
    this.setState({ menuVisible: !this.state.menuVisible });
  };

  onSelectNotification = item => {
    const {
      primary_actor_id,
      primary_actor_type,
      primary_actor: { id: conversationId, meta },
    } = item;

    const { navigation, selectConversation } = this.props;

    this.props.markNotificationAsRead({
      primaryActorId: primary_actor_id,
      primaryActorType: primary_actor_type,
    });
    selectConversation({ conversationId });
    navigation.navigate('ChatScreen', {
      conversationId,
      meta,
    });
  };

  renderRightActions = () => {
    const {
      eva: { style },
    } = this.props;
    return (
      <React.Fragment>
        <TouchableOpacity onPress={this.showActionSheet}>
          <CustomText style={style.markAllText}>{i18n.t('NOTIFICATION.MARK_ALL')}</CustomText>
        </TouchableOpacity>
      </React.Fragment>
    );
  };

  showActionSheet = () => {
    actionSheetRef.current?.setModalVisible();
  };

  onPressAction = ({ itemType }) => {
    actionSheetRef.current?.hide();
    if (itemType === 'mark_all') {
      captureEvent({ eventName: 'All notifications are read' });
      this.props.markAllNotificationAsRead();
    }
  };

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.loadNotifications();
    wait(1000).then(() => this.setState({ refreshing: false }));
  };

  render() {
    const {
      eva: { style },
      allNotifications,
      isFetching,
      unReadCount,
    } = this.props;

    const groupedNotifications = getGroupedNotifications({ notifications: allNotifications });

    return (
      <SafeAreaView style={style.container}>
        <HeaderBar
          title={i18n.t('NOTIFICATION.HEADER_TITLE')}
          {...(groupedNotifications.length && unReadCount && { showRightButton: true })}
          onRightPress={this.showActionSheet}
          buttonType="more"
        />
        <View>
          {!isFetching || groupedNotifications.length ? (
            <React.Fragment>
              {groupedNotifications && groupedNotifications.length ? (
                <SectionList
                  onRefresh={() => this.onRefresh()}
                  refreshing={this.state.refreshing}
                  scrollEventThrottle={1900}
                  onEndReached={this.onEndReached.bind(this)}
                  onEndReachedThreshold={0.5}
                  onMomentumScrollBegin={() => {
                    this.setState({
                      onEndReachedCalledDuringMomentum: false,
                    });
                  }}
                  sections={groupedNotifications}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item, index }) => (
                    <NotificationItem
                      item={item}
                      read_at={item.read_at}
                      index={index}
                      onSelectNotification={this.onSelectNotification}
                    />
                  )}
                  renderSectionHeader={({ section: { title } }) => (
                    <View style={style.sectionView}>
                      <CustomText style={style.sectionHeader}>{title}</CustomText>
                    </View>
                  )}
                  ListFooterComponent={this.renderMoreLoader}
                />
              ) : (
                this.renderEmptyMessage()
              )}
            </React.Fragment>
          ) : (
            this.renderEmptyList()
          )}
        </View>
        <ActionSheet ref={actionSheetRef} initialOffsetFromBottom={0.6} defaultOverlayOpacity={0.3}>
          <NotificationActionItem
            onPressItem={this.onPressAction}
            text={i18n.t('NOTIFICATION.MARK_ALL')}
            itemType="mark_all"
          />
          <NotificationActionItem
            onPressItem={this.onPressAction}
            text={i18n.t('NOTIFICATION.CANCEL')}
            itemType="cancel"
          />
        </ActionSheet>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    getAllNotifications: ({ pageNo }) => dispatch(getAllNotifications({ pageNo })),
    markAllNotificationAsRead: () => dispatch(markAllNotificationAsRead()),
    selectConversation: ({ conversationId }) => dispatch(setConversation({ conversationId })),
    loadInitialMessages: ({ messages }) => dispatch(loadInitialMessage({ messages })),
    markNotificationAsRead: ({ primaryActorId, primaryActorType }) =>
      dispatch(markNotificationAsRead({ primaryActorId, primaryActorType })),
  };
}
function mapStateToProps(state) {
  return {
    allNotifications: state.notification.data.payload,
    unReadCount: state.notification.data.meta.unread_count,
    isFetching: state.notification.isFetching,
    isAllNotificationsLoaded: state.notification.isAllNotificationsLoaded,
  };
}

const NotificationScreen = withStyles(NotificationScreenComponent, styles);
export default connect(mapStateToProps, bindAction)(NotificationScreen);
