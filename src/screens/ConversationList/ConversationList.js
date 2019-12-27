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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getAgents } from '../../actions/agent';

import { getConversations } from '../../actions/conversation';

import ConversationItem from '../../components/ConversationItem';
import ConversationItemLoader from '../../components/ConversationItemLoader';

import styles from './ConversationList.style';

import CustomText from '../../components/Text';

import i18n from '../../i18n';

const MenuIcon = style => <Icon {...style} name="funnel-outline" />;

// eslint-disable-next-line react/prop-types
const renderItem = ({ item }) => <ConversationItem item={item} />;

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <ConversationItemLoader />;

class HomeScreen extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    conversations: PropTypes.array,
    isFetching: PropTypes.bool,
    getAgents: PropTypes.func,
    getConversations: PropTypes.func,
    item: PropTypes.shape({}),
  };

  static defaultProps = {
    conversations: [],
    isFetching: false,
    getAgents: () => {},
    getConversations: () => {},
    item: {},
  };

  state = {
    selectedIndex: 0,
  };

  componentDidMount = () => {
    this.props.getAgents();
    this.loadConversations();
  };

  loadConversations = () => {
    const { selectedIndex } = this.state;
    this.props.getConversations({ assigneeType: selectedIndex });
  };

  openFilter = () => {
    const { navigation } = this.props;
    navigation.navigate('ConversationFilter');
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

  renderList = () => {
    const { conversations } = this.props;
    const { payload } = conversations;

    if (payload.length) {
      return (
        <Layout style={styles.tabContainer}>
          <List data={payload} renderItem={renderItem} />
        </Layout>
      );
    }
    return (
      <Layout style={styles.tabContainer}>
        <CustomText style={styles.emptyText}>
          {i18n.t('CONVERSATION.EMPTY')}
        </CustomText>
      </Layout>
    );
  };

  render() {
    const { selectedIndex } = this.state;
    const { conversations, isFetching } = this.props;
    const { payload, meta } = conversations;

    const mineCount = meta ? `(${meta.mine_count})` : '';
    const unAssignedCount = meta ? `(${meta.unassigned_count})` : '';
    const allCount = meta ? `(${meta.all_count})` : '';

    return (
      <Layout style={styles.container}>
        <TopNavigation
          title="Chatwoot"
          alignment="center"
          rightControls={this.renderRightControls()}
          titleStyle={styles.headerTitle}
        />
        <TabView
          selectedIndex={selectedIndex}
          indicatorStyle={styles.tabViewIndicator}
          onSelect={this.onChangeTab}
          tabBarStyle={styles.tabBar}>
          <Tab
            title={`${i18n.t('CONVERSATION.MINE')} ${mineCount}`}
            titleStyle={
              selectedIndex === 0
                ? styles.tabActiveTitle
                : styles.tabNotActiveTitle
            }>
            {!isFetching ? (
              this.renderList()
            ) : (
              <Layout style={styles.tabContainer}>
                <List data={LoaderData} renderItem={renderItemLoader} />
              </Layout>
            )}
          </Tab>
          <Tab
            title={`${i18n.t('CONVERSATION.UN_ASSIGNED')} ${unAssignedCount}`}
            titleStyle={
              selectedIndex === 1
                ? styles.tabActiveTitle
                : styles.tabNotActiveTitle
            }>
            {!isFetching ? (
              <List data={payload} renderItem={renderItem} />
            ) : (
              <List data={LoaderData} renderItem={renderItemLoader} />
            )}
          </Tab>
          <Tab
            title={`${i18n.t('CONVERSATION.ALL')} ${allCount}`}
            titleStyle={
              selectedIndex === 2
                ? styles.tabActiveTitle
                : styles.tabNotActiveTitle
            }>
            {!isFetching ? (
              <List data={payload} renderItem={renderItem} />
            ) : (
              <List data={LoaderData} renderItem={renderItemLoader} />
            )}
          </Tab>
        </TabView>
      </Layout>
    );
  }
}

function bindAction(dispatch) {
  return {
    getAgents: () => dispatch(getAgents()),
    getConversations: ({ assigneeType }) =>
      dispatch(getConversations({ assigneeType })),
  };
}
function mapStateToProps(state) {
  return {
    isFetching: state.conversation.isFetching,
    conversations: state.conversation.data,
  };
}

export default connect(mapStateToProps, bindAction)(HomeScreen);
