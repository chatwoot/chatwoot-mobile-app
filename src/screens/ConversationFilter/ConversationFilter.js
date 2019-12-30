import React, { Component } from 'react';
import {
  Layout,
  TopNavigation,
  Icon,
  TopNavigationAction,
  Text,
} from 'react-native-ui-kitten';

import { connect } from 'react-redux';

import { View } from 'react-native';

import PropTypes from 'prop-types';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { setAgent } from '../../actions/agent';
import {
  setConversationStatus,
  getConversations,
} from '../../actions/conversation';
import CustomText from '../../components/Text';
import FilterItem from '../../components/FilterItem';

import styles from './ConversationFilter.style';

const BackIcon = style => <Icon {...style} name="arrow-ios-back-outline" />;

const BackAction = props => <TopNavigationAction {...props} icon={BackIcon} />;

const statusOptions = [
  {
    name: i18n.t('FILTER.OPEN'),
    itemType: 'status',
  },
  {
    name: i18n.t('FILTER.RESOLVED'),
    itemType: 'status',
  },
];

class FilterScreen extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    agents: PropTypes.shape([]),
    agentSelected: PropTypes.shape({}),
    setAgent: PropTypes.func,
    setConversationStatus: PropTypes.func,
    getConversations: PropTypes.func,
    conversationStatus: PropTypes.string,
  };

  constructor(props) {
    super(props);
    const { agents } = this.props;
    this.state = {
      allAgents: agents,
    };
  }
  componentDidMount = () => {
    const { agentSelected } = this.props;
    this.processEntries({ agentSelected });
  };

  onCheckedChange = ({ item }) => {
    const { itemType, name } = item;

    if (itemType === 'inbox') {
      this.processEntries({ agentSelected: item });
      this.props.setAgent({ agent: item });
    } else {
      this.props.setConversationStatus({ status: name });
    }
  };

  submitFilters = () => {
    const { navigation, conversationStatus, agentSelected } = this.props;
    const {
      state: {
        params: { assigneeType },
      },
    } = navigation;

    this.props.getConversations({
      assigneeType,
      conversationStatus,
      agentSelected,
    });

    navigation.goBack();
  };

  onBackPress = () => {
    const { navigation } = this.props;

    navigation.goBack();
  };

  renderLeftControl = () => <BackAction onPress={this.onBackPress} />;

  processEntries = ({ agentSelected }) => {
    const { agents } = this.props;
    const temp = agents.map(agent => ({
      ...agent,
      itemType: 'inbox',
      isChecked: agentSelected && agentSelected.id === agent.id ? true : false,
    }));
    this.setState({ allAgents: temp });
  };

  render() {
    const { allAgents } = this.state;
    const { conversationStatus } = this.props;

    return (
      <Layout style={styles.container}>
        <TopNavigation
          leftControl={this.renderLeftControl()}
          title={i18n.t('FILTER.HEADER_TITLE')}
          titleStyle={styles.headerTitle}
        />
        <Layout>
          <View style={styles.itemMainView}>
            <View>
              <CustomText style={styles.itemHeaderTitle}>
                {i18n.t('FILTER.CHOOSE_INBOX')}
              </CustomText>

              {allAgents.map((item, index) => {
                return (
                  <FilterItem
                    item={item}
                    isChecked={item.isChecked}
                    onCheckedChange={this.onCheckedChange}
                  />
                );
              })}
            </View>
          </View>
          <View style={styles.itemMainView}>
            <View>
              <Text style={styles.itemHeaderTitle}>
                {i18n.t('FILTER.CHOOSE_STATUS')}
              </Text>
              {statusOptions.map((item, index) => {
                return (
                  <FilterItem
                    item={item}
                    isChecked={conversationStatus === item.name ? true : false}
                    onCheckedChange={this.onCheckedChange}
                  />
                );
              })}
            </View>
          </View>
        </Layout>
        <View style={styles.filterButtonView}>
          <LoaderButton
            style={styles.filterButton}
            size="large"
            textStyle={styles.filterButtonText}
            onPress={() => this.submitFilters()}>
            {i18n.t('FILTER.SUBMIT')}
          </LoaderButton>
        </View>
      </Layout>
    );
  }
}

function bindAction(dispatch) {
  return {
    setAgent: ({ agent }) => dispatch(setAgent({ agent })),
    setConversationStatus: ({ status }) =>
      dispatch(setConversationStatus({ status })),
    getConversations: ({ assigneeType, conversationStatus, agentSelected }) =>
      dispatch(
        getConversations({ assigneeType, conversationStatus, agentSelected }),
      ),
  };
}
function mapStateToProps(state) {
  return {
    agents: state.agent.data,
    agentSelected: state.agent.agentSelected,
    conversationStatus: state.conversation.conversationStatus,
  };
}

export default connect(mapStateToProps, bindAction)(FilterScreen);
