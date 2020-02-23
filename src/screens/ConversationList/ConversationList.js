import React, { Component } from 'react';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Tab,
  TabView,
  List,
} from 'react-native-ui-kitten';
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

class ConversationList extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    conversations: PropTypes.shape([]),
    isFetching: PropTypes.bool,
    getInboxes: PropTypes.func,
    loadInitialMessages: PropTypes.func,
    getConversations: PropTypes.func,
    selectConversation: PropTypes.func,
    inboxSelected: PropTypes.shape({}),
    conversationStatus: PropTypes.string,
    item: PropTypes.shape({}),
  };

  static defaultProps = {
    isFetching: false,
    getInboxes: () => {},
    getConversations: () => {},
    loadInitialMessages: () => {},
    selectConversation: () => {},
    item: {},
    conversationStatus: 'Open',
  };

  state = {
    selectedIndex: 0,
  };

  componentDidMount = () => {
    this.props.getInboxes();
    this.loadConversations();
    this.initActionCable();
  };

  initActionCable = async () => {
    const pubSubToken = await getPubSubToken();
    ActionCable.init({ pubSubToken });
  };

  loadConversations = () => {
    const { selectedIndex } = this.state;
    const { conversationStatus, inboxSelected } = this.props;

    this.props.getConversations({
      assigneeType: selectedIndex,
      conversationStatus,
      inboxSelected,
    });
  };

  onSelectConversation = item => {
    const { messages, meta } = item;

    const conversationId = item.id;

    const { navigation, loadInitialMessages, selectConversation } = this.props;
    selectConversation({ conversationId });
    loadInitialMessages({ messages });
    navigation.navigate('ChatScreen', {
      conversationId,
      meta,
      messages,
      refresh: this.loadConversations,
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
    });
    this.loadConversations();
  };

  renderItem = ({ item }) => (
    <ConversationItem
      item={item}
      onSelectConversation={this.onSelectConversation}
    />
  );

  renderList = () => {
    const { conversations } = this.props;

    const { payload } = conversations;

    const filterConversations = payload.filter(
      item => item.messages.length !== 0,
    );

    return (
      <Layout style={styles.tabContainer}>
        <List data={filterConversations} renderItem={this.renderItem} />
      </Layout>
    );
  };

  renderEmptyList = () => {
    return (
      <Layout style={styles.tabContainer}>
        <List data={LoaderData} renderItem={renderItemLoader} />
      </Layout>
    );
  };

  renderEmptyMessage = () => {
    return (
      <Layout style={styles.emptyView}>
        <CustomText style={styles.emptyText}>
          {i18n.t('CONVERSATION.EMPTY')}
        </CustomText>
      </Layout>
    );
  };

  renderTab = ({ tabIndex, selectedIndex, tabTitle, payload, isFetching }) => (
    <Tab
      title={tabTitle}
      titleStyle={
        selectedIndex === tabIndex
          ? styles.tabActiveTitle
          : styles.tabNotActiveTitle
      }>
      <View style={styles.tabView}>
        {!isFetching ? (
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

  render() {
    const { selectedIndex } = this.state;
    const { conversations, isFetching, inboxSelected } = this.props;
    const { payload, meta } = conversations;
    const { name: inBoxName } = inboxSelected;

    const mineCount = meta ? `(${meta.mine_count})` : '';
    const unAssignedCount = meta ? `(${meta.unassigned_count})` : '';
    const allCount = meta ? `(${meta.all_count})` : '';

    const headerTitle =
      inBoxName || i18n.t('CONVERSATION.DEFAULT_HEADER_TITLE');

    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title={headerTitle}
          alignment="center"
          rightControls={this.renderRightControls()}
          titleStyle={styles.headerTitle}
        />
        <TabView
          selectedIndex={selectedIndex}
          indicatorStyle={styles.tabViewIndicator}
          onSelect={this.onChangeTab}
          tabBarStyle={styles.tabBar}>
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
    getConversations: ({ assigneeType, conversationStatus, inboxSelected }) =>
      dispatch(
        getConversations({ assigneeType, conversationStatus, inboxSelected }),
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
    conversations: state.conversation.data,
    conversationStatus: state.conversation.conversationStatus,
    inboxSelected: state.inbox.inboxSelected,
  };
}

export default connect(mapStateToProps, bindAction)(ConversationList);
