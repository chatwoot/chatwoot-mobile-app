import React, { Component } from 'react';
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  Tab,
  TabView,
  List,
  Spinner,
  withStyles,
  Icon,
} from '@ui-kitten/components';

import { SafeAreaView, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getInboxes } from '../../actions/inbox';

import { getConversations, loadInitialMessage, setConversation } from '../../actions/conversation';

import ConversationItem from '../../components/ConversationItem';
import ConversationItemLoader from '../../components/ConversationItemLoader';

import styles from './ConversationList.style';

import CustomText from '../../components/Text';

import i18n from '../../i18n';

const MenuIcon = (style) => <Icon {...style} name="funnel-outline" />;

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <ConversationItemLoader />;

import ActionCable from '../../helpers/ActionCable';
import { getPubSubToken } from '../../helpers/AuthHelper';

class ConversationListComponent extends Component {
  static propTypes = {
    eva: PropTypes.shape({
      style: PropTypes.object,
      theme: PropTypes.object,
    }).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    conversations: PropTypes.shape([]),
    isFetching: PropTypes.bool,
    isAllConversationsLoaded: PropTypes.bool,
    getInboxes: PropTypes.func,
    loadInitialMessages: PropTypes.func,
    getConversations: PropTypes.func,
    selectConversation: PropTypes.func,
    saveDeviceDetails: PropTypes.func,
    inboxSelected: PropTypes.shape({
      name: PropTypes.string,
    }),
    conversationTypingUsers: PropTypes.shape({}),
    inboxes: PropTypes.array.isRequired,
    conversationStatus: PropTypes.string,
    webSocketUrl: PropTypes.string,
    item: PropTypes.shape({}),
  };

  static defaultProps = {
    isFetching: false,
    isAllConversationsLoaded: false,
    getInboxes: () => {},
    getConversations: () => {},
    loadInitialMessages: () => {},
    selectConversation: () => {},
    item: {},
    inboxes: [],
    conversationStatus: 'Open',
  };

  state = {
    selectedIndex: 0,
    onEndReachedCalledDuringMomentum: true,
    pageNumber: 1,
  };

  componentDidMount = () => {
    this.props.getInboxes();
    this.loadConversations();
    this.initActionCable();
  };

  initActionCable = async () => {
    const pubSubToken = await getPubSubToken();
    const { webSocketUrl } = this.props;

    ActionCable.init({ pubSubToken, webSocketUrl });
  };

  loadConversations = () => {
    const { selectedIndex, pageNumber } = this.state;

    const { conversationStatus, inboxSelected } = this.props;

    this.props.getConversations({
      assigneeType: selectedIndex,
      conversationStatus,
      inboxSelected,
      pageNumber,
    });
  };

  onEndReached = async ({ distanceFromEnd }) => {
    const { onEndReachedCalledDuringMomentum } = this.state;

    if (!onEndReachedCalledDuringMomentum) {
      await this.setState((state) => ({
        pageNumber: state.pageNumber + 1,
      }));

      this.loadConversations();
      this.setState({
        onEndReachedCalledDuringMomentum: true,
      });
    }
  };

  onSelectConversation = (item) => {
    const { messages, meta } = item;

    const conversationId = item.id;

    const { navigation, selectConversation, loadInitialMessages } = this.props;
    selectConversation({ conversationId });
    loadInitialMessages({ messages });
    navigation.navigate('ChatScreen', {
      conversationId,
      meta,
      messages,
    });
  };

  openFilter = () => {
    const { navigation, inboxSelected } = this.props;
    const { selectedIndex } = this.state;
    navigation.navigate('ConversationFilter', {
      assigneeType: selectedIndex,
      inboxSelected,
    });
  };

  renderRightControls = () => {
    return <TopNavigationAction icon={MenuIcon} onPress={this.openFilter} />;
  };

  onChangeTab = async (index) => {
    await this.setState({
      selectedIndex: index,
      pageNumber: 1,
    });
    this.loadConversations();
  };

  renderItem = ({ item }) => (
    <ConversationItem
      item={item}
      onSelectConversation={this.onSelectConversation}
      inboxes={this.props.inboxes}
      conversationTypingUsers={this.props.conversationTypingUsers}
    />
  );

  renderMoreLoader = () => {
    const {
      isAllConversationsLoaded,
      eva: { style },
    } = this.props;

    return (
      <View style={style.loadMoreSpinnerView}>
        {!isAllConversationsLoaded ? <Spinner size="medium" /> : null}
      </View>
    );
  };

  renderList = () => {
    const {
      conversations,
      eva: { style },
    } = this.props;

    const { payload } = conversations;

    const filterConversations = payload.filter((item) => item.messages.length !== 0);

    return (
      <Layout style={style.tabContainer}>
        <List
          keyboardShouldPersistTaps="handled"
          data={filterConversations}
          renderItem={this.renderItem}
          ref={(ref) => {
            this.myFlatListRef = ref;
          }}
          onEndReached={this.onEndReached.bind(this)}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.setState({
              onEndReachedCalledDuringMomentum: false,
            });
          }}
          ListFooterComponent={this.renderMoreLoader}
          keyExtractor={(item) => item.id.toString()}
        />
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

  renderEmptyMessage = () => {
    const {
      eva: { style },
    } = this.props;
    return (
      <Layout style={style.emptyView}>
        <CustomText appearance="hint" style={style.emptyText}>
          {i18n.t('CONVERSATION.EMPTY')}
        </CustomText>
      </Layout>
    );
  };

  renderTab = ({ tabIndex, selectedIndex, tabTitle, payload, isFetching, renderList, style }) => {
    return (
      <Tab
        title={tabTitle}
        titleStyle={selectedIndex === tabIndex ? style.tabActiveTitle : style.tabNotActiveTitle}>
        <View style={style.tabView}>
          {!isFetching || payload.length ? (
            <React.Fragment>
              {payload && payload.length ? this.renderList() : this.renderEmptyMessage()}
            </React.Fragment>
          ) : (
            this.renderEmptyList()
          )}
        </View>
      </Tab>
    );
  };

  render() {
    const { selectedIndex } = this.state;
    const {
      conversations,
      isFetching,
      inboxSelected,
      conversationStatus,
      eva: { style },
    } = this.props;

    const { payload, meta } = conversations;
    const { name: inBoxName } = inboxSelected;

    const mineCount = meta ? `(${meta.mine_count})` : '';
    const unAssignedCount = meta ? `(${meta.unassigned_count})` : '';
    const allCount = meta ? `(${meta.all_count})` : '';

    const headerTitle = inBoxName ? `${inBoxName} (${conversationStatus})` : '';

    return (
      <SafeAreaView style={style.container}>
        <TopNavigation
          title={headerTitle}
          alignment="center"
          accessoryRight={this.renderRightControls}
          titleStyle={style.headerTitle}
        />

        <TabView
          selectedIndex={selectedIndex}
          indicatorStyle={style.tabViewIndicator}
          onSelect={this.onChangeTab}
          tabBarStyle={style.tabBar}>
          {this.renderTab({
            tabIndex: 0,
            selectedIndex,
            tabTitle: `${i18n.t('CONVERSATION.MINE')} ${mineCount}`,
            payload,
            isFetching,
            style,
          })}
          {this.renderTab({
            tabIndex: 1,
            selectedIndex,
            tabTitle: `${i18n.t('CONVERSATION.UN_ASSIGNED')} ${unAssignedCount}`,
            payload,
            isFetching,
            style,
          })}
          {this.renderTab({
            tabIndex: 2,
            selectedIndex,
            tabTitle: `${i18n.t('CONVERSATION.ALL')} ${allCount}`,
            payload,
            isFetching,
            style,
          })}
        </TabView>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    getInboxes: () => dispatch(getInboxes()),
    getConversations: ({ assigneeType, conversationStatus, inboxSelected, pageNumber }) =>
      dispatch(
        getConversations({
          assigneeType,
          conversationStatus,
          inboxSelected,
          pageNumber,
        }),
      ),

    selectConversation: ({ conversationId }) => dispatch(setConversation({ conversationId })),
    loadInitialMessages: ({ messages }) => dispatch(loadInitialMessage({ messages })),
  };
}
function mapStateToProps(state) {
  return {
    webSocketUrl: state.settings.webSocketUrl,
    isFetching: state.conversation.isFetching,
    isAllConversationsLoaded: state.conversation.isAllConversationsLoaded,
    conversations: state.conversation.data,
    conversationStatus: state.conversation.conversationStatus,
    inboxSelected: state.inbox.inboxSelected,
    inboxes: state.inbox.data,
    conversationTypingUsers: state.conversation.conversationTypingUsers,
  };
}

const ConversationList = withStyles(ConversationListComponent, styles);
export default connect(mapStateToProps, bindAction)(ConversationList);
