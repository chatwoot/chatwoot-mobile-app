import React, { Component } from 'react';
import {
  TopNavigation,
  withStyles,
  TopNavigationAction,
  Icon,
  Layout,
  List,
  Spinner,
  OverflowMenu,
  MenuItem,
} from '@ui-kitten/components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView, SectionList, View } from 'react-native';

import i18n from '../../i18n';
import { loadInitialMessage, setConversation } from '../../actions/conversation';

import styles from './NotificationScreen.style';
import NotificationItem from '../../components/NotificationItem';
import { getAllNotifications, markAllNotificationAsRead } from '../../actions/notification';
import CustomText from '../../components/Text';
import { getGroupedNotifications } from '../../helpers';
import NotificationItemLoader from '../../components/NotificationItemLoader';

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <NotificationItemLoader />;

const MenuIcon = (style) => <Icon {...style} name="more-horizontal-outline" />;

const InfoIcon = (props) => <Icon {...props} name="checkmark-outline" />;

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
  };

  static defaultProps = {
    allNotifications: [],
    isFetching: false,
    getConversations: () => {},
    selectConversation: () => {},
    isAllNotificationsLoaded: false,
  };

  state = {
    onEndReachedCalledDuringMomentum: true,
    pageNo: 1,
    menuVisible: false,
  };

  componentDidMount = () => {
    this.loadNotifications({ pageNo: 1 });
  };

  loadNotifications = () => {
    const { pageNo } = this.state;
    this.props.getAllNotifications({
      pageNo,
    });
  };

  loadMoreNotifications = async () => {
    const { isAllNotificationsLoaded } = this.props;
    await this.setState((state) => ({
      pageNo: state.pageNo + 2,
    }));
    if (!isAllNotificationsLoaded) {
      this.loadNotifications();
    }
  };

  renderRightControls = () => {
    return <TopNavigationAction icon={MenuIcon} />;
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
    const {
      eva: { style },
    } = this.props;
    return (
      <Layout style={style.emptyView}>
        <CustomText appearance="hint" style={style.emptyText}>
          {i18n.t('NOTIFICATION.EMPTY')}
        </CustomText>
      </Layout>
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
          <CustomText> {i18n.t('NOTIFICATION.ALL_NOTIFICATION_LOADED')} 🎉</CustomText>
        )}
      </View>
    );
  };

  toggleMenu = () => {
    this.setState({ menuVisible: !this.state.menuVisible });
  };

  markAllNotificationAsRead = () => {
    this.toggleMenu();
    this.props.markAllNotificationAsRead();
  };

  onSelectNotification = (item) => {
    const {
      primary_actor: { id: conversationId, meta, messages },
    } = item;

    const { navigation, selectConversation, loadInitialMessages } = this.props;
    selectConversation({ conversationId });
    loadInitialMessages({ messages });
    navigation.navigate('ChatScreen', {
      conversationId,
      meta,
      messages,
    });
  };

  renderMenuAction = () => <TopNavigationAction icon={MenuIcon} onPress={this.toggleMenu} />;

  renderRightActions = () => (
    <React.Fragment>
      <OverflowMenu
        anchor={this.renderMenuAction}
        visible={this.state.menuVisible}
        onSelect={(index) => this.markAllNotificationAsRead()}
        onBackdropPress={this.toggleMenu}>
        <MenuItem accessoryLeft={InfoIcon} title="Mark all as read" />
      </OverflowMenu>
    </React.Fragment>
  );

  render() {
    const {
      eva: { style },
      allNotifications,
      isFetching,
    } = this.props;
    // const splitArray = allNotifications.slice(0, 2);
    const groupedNotifications = getGroupedNotifications({ notifications: allNotifications });

    return (
      <SafeAreaView style={style.container}>
        <TopNavigation
          title={i18n.t('NOTIFICATION.HEADER_TITLE')}
          titleStyle={style.headerTitle}
          alignment="center"
          {...(groupedNotifications.length && { accessoryRight: this.renderRightActions })}
        />
        <View>
          {!isFetching || groupedNotifications.length ? (
            <React.Fragment>
              {groupedNotifications && groupedNotifications.length ? (
                <SectionList
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
                  renderItem={({ item }) => (
                    <NotificationItem
                      item={item}
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
  };
}
function mapStateToProps(state) {
  return {
    allNotifications: state.notification.data.payload,
    isFetching: state.notification.isFetching,
    isAllNotificationsLoaded: state.notification.isAllNotificationsLoaded,
  };
}

const NotificationScreen = withStyles(NotificationScreenComponent, styles);
export default connect(mapStateToProps, bindAction)(NotificationScreen);
