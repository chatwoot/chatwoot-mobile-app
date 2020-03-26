import React, { Component } from 'react';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Tab,
  TabView,
  List,
  Spinner,
  withStyles,
} from '@ui-kitten/components';
import { SafeAreaView, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getInboxes } from '../../actions/inbox';

import {
  getConversations,
  loadInitialMessage,
  setConversation,
} from '../../actions/conversation';

import ConversationItem from '../../components/ConversationItem';
import ConversationItemLoader from '../../components/ConversationItemLoader';

import styles from './ConversationList.style';

import CustomText from '../../components/Text';

import i18n from '../../i18n';

const MenuIcon = style => <Icon {...style} name="funnel-outline" />;

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <ConversationItemLoader />;

import ActionCable from '../../helpers/ActionCable';
import { getPubSubToken } from '../../helpers/AuthHelper';

class ConversationListComponent extends Component {
  static propTypes = {
    themedStyle: PropTypes.object,
    theme: PropTypes.object,
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
    inboxSelected: PropTypes.shape({
      name: PropTypes.string,
    }),
    conversationStatus: PropTypes.string,
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
    conversationStatus: 'Open',
  };

  state = {
    selectedIndex: 0,
    onEndReachedCalledDuringMomentum: true,
    pageNumber: 1,
  };

  componentDidMount = () => {
    setTimeout(() => {
      this.props.getInboxes();
      this.loadConversations();
      this.initActionCable();
    }, 200);
  };

  initActionCable = async () => {
    const pubSubToken = await getPubSubToken();
    ActionCable.init({ pubSubToken });
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
      await this.setState(state => ({
        pageNumber: state.pageNumber + 1,
      }));

      this.loadConversations();
      this.setState({
        onEndReachedCalledDuringMomentum: true,
      });
    }
  };

  onSelectConversation = item => {
    const { messages, meta } = item;

    const conversationId = item.id;

    const { navigation, selectConversation } = this.props;
    selectConversation({ conversationId });
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

  onChangeTab = index => {
    this.setState({
      selectedIndex: index,
      pageNumber: 1,
    });
    this.loadConversations();
  };

  renderItem = ({ item }) => (
    <ConversationItem
      item={item}
      onSelectConversation={this.onSelectConversation}
    />
  );

  renderMoreLoader = () => {
    const { isAllConversationsLoaded, themedStyle } = this.props;

    return (
      <View style={themedStyle.loadMoreSpinnerView}>
        {!isAllConversationsLoaded ? <Spinner size="medium" /> : null}
      </View>
    );
  };

  renderList = () => {
    const { conversations, themedStyle } = this.props;

    const { payload } = conversations;

    const filterConversations = payload.filter(
      item => item.messages.length !== 0,
    );

    return (
      <Layout style={themedStyle.tabContainer}>
        <List
          data={filterConversations}
          renderItem={this.renderItem}
          ref={ref => {
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
        />
      </Layout>
    );
  };

  renderEmptyList = () => {
    const { themedStyle } = this.props;
    return (
      <Layout style={themedStyle.tabContainer}>
        <List data={LoaderData} renderItem={renderItemLoader} />
      </Layout>
    );
  };

  renderEmptyMessage = () => {
    const { themedStyle } = this.props;
    return (
      <Layout style={themedStyle.emptyView}>
        <CustomText appearance="hint" style={themedStyle.emptyText}>
          {i18n.t('CONVERSATION.EMPTY')}
        </CustomText>
      </Layout>
    );
  };

  renderTab = ({
    tabIndex,
    selectedIndex,
    tabTitle,
    payload,
    isFetching,
    renderList,
  }) => {
    const { themedStyle } = this.props;

    return (
      <Tab
        title={tabTitle}
        titleStyle={
          selectedIndex === tabIndex
            ? themedStyle.tabActiveTitle
            : themedStyle.tabNotActiveTitle
        }>
        <View style={themedStyle.tabView}>
          {!isFetching || payload.length ? (
            <React.Fragment>
              {payload && payload.length
                ? this.renderList()
                : this.renderEmptyMessage()}
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
      themedStyle,
    } = this.props;

    const { payload, meta } = conversations;
    const { name: inBoxName } = inboxSelected;

    const mineCount = meta ? `(${meta.mine_count})` : '';
    const unAssignedCount = meta ? `(${meta.unassigned_count})` : '';
    const allCount = meta ? `(${meta.all_count})` : '';

    const headerTitle = `${inBoxName} (${conversationStatus})`;

    return (
      <SafeAreaView style={themedStyle.container}>
        <TopNavigation
          title={headerTitle}
          alignment="center"
          rightControls={this.renderRightControls()}
          titleStyle={themedStyle.headerTitle}
        />

        <TabView
          selectedIndex={selectedIndex}
          indicatorStyle={themedStyle.tabViewIndicator}
          onSelect={this.onChangeTab}
          tabBarStyle={themedStyle.tabBar}>
          {this.renderTab({
            tabIndex: 0,
            selectedIndex,
            tabTitle: `${i18n.t('CONVERSATION.MINE')} ${mineCount}`,
            payload,
            isFetching,
          })}
          {this.renderTab({
            tabIndex: 1,
            selectedIndex,
            tabTitle: `${i18n.t(
              'CONVERSATION.UN_ASSIGNED',
            )} ${unAssignedCount}`,
            payload,
            isFetching,
          })}
          {this.renderTab({
            tabIndex: 2,
            selectedIndex,
            tabTitle: `${i18n.t('CONVERSATION.ALL')} ${allCount}`,
            payload,
            isFetching,
          })}
        </TabView>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    getInboxes: () => dispatch(getInboxes()),
    getConversations: ({
      assigneeType,
      conversationStatus,
      inboxSelected,
      pageNumber,
    }) =>
      dispatch(
        getConversations({
          assigneeType,
          conversationStatus,
          inboxSelected,
          pageNumber,
        }),
      ),

    selectConversation: ({ conversationId }) =>
      dispatch(setConversation({ conversationId })),
    loadInitialMessages: ({ messages }) =>
      dispatch(loadInitialMessage({ messages })),
  };
}
function mapStateToProps(state) {
  return {
    isFetching: state.conversation.isFetching,
    isAllConversationsLoaded: state.conversation.isAllConversationsLoaded,
    conversations: state.conversation.data,
    conversationStatus: state.conversation.conversationStatus,
    inboxSelected: state.inbox.inboxSelected,
  };
}

const ConversationList = withStyles(ConversationListComponent, styles);
export default connect(mapStateToProps, bindAction)(ConversationList);
