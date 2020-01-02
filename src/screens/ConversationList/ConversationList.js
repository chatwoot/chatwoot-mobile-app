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
import { SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getInboxes } from '../../actions/inbox';

import { getConversations } from '../../actions/conversation';

import ConversationItem from '../../components/ConversationItem';
import ConversationItemLoader from '../../components/ConversationItemLoader';

import styles from './ConversationList.style';

import CustomText from '../../components/Text';

import i18n from '../../i18n';
import { View } from 'react-native';

const MenuIcon = style => <Icon {...style} name="funnel-outline" />;

// eslint-disable-next-line react/prop-types
const renderItem = ({ item }) => <ConversationItem item={item} />;

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <ConversationItemLoader />;

class ConversationList extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    conversations: PropTypes.shape([]),
    isFetching: PropTypes.bool,
    getInboxes: PropTypes.func,
    getConversations: PropTypes.func,
    inboxSelected: PropTypes.shape({}),
    conversationStatus: PropTypes.string,
    item: PropTypes.shape({}),
  };

  static defaultProps = {
    isFetching: false,
    getInboxes: () => {},
    getConversations: () => {},
    item: {},
    conversationStatus: 'Open',
  };

  state = {
    selectedIndex: 0,
  };

  componentDidMount = () => {
    const { selectedIndex } = this.state;
    this.props.getInboxes();
    this.loadConversations({ assigneeType: selectedIndex });
  };

  loadConversations = ({ assigneeType }) => {
    const { conversationStatus, inboxSelected } = this.props;

    this.props.getConversations({
      assigneeType,
      conversationStatus,
      inboxSelected,
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
    this.loadConversations({ assigneeType: index });
    this.setState({
      selectedIndex: index,
    });
  };

  renderList = () => {
    const { conversations } = this.props;
    const { payload } = conversations;
    return (
      <Layout style={styles.tabContainer}>
        <List data={payload} renderItem={renderItem} />
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
