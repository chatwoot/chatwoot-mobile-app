import React, { Component } from 'react';
import {
  Layout,
  TopNavigation,
  Icon,
  TopNavigationAction,
  Text,
  withStyles,
} from '@ui-kitten/components';

import { connect } from 'react-redux';

import { View, SafeAreaView } from 'react-native';

import PropTypes from 'prop-types';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { setInbox } from '../../actions/inbox';
import { setConversationStatus, getConversations } from '../../actions/conversation';
import CustomText from '../../components/Text';
import FilterItem from '../../components/FilterItem';

import styles from './ConversationFilter.style';
import { INBOX_ICON } from '../../constants';

const BackIcon = (style) => <Icon {...style} name="arrow-ios-back-outline" />;

const BackAction = (props) => <TopNavigationAction {...props} icon={BackIcon} />;

const statusOptions = [
  {
    name: i18n.t('FILTER.OPEN'),
    itemType: 'status',
    icon: 'book-open-outline',
  },
  {
    name: i18n.t('FILTER.RESOLVED'),
    itemType: 'status',
    icon: 'done-all-outline',
  },
];

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  route: PropTypes.object,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  inboxes: PropTypes.array.isRequired,
  inboxSelected: PropTypes.shape({}),
  setInbox: PropTypes.func,
  setConversationStatus: PropTypes.func,
  getConversations: PropTypes.func,
  conversationStatus: PropTypes.string,
};

class FilterScreenComponent extends Component {
  constructor(props) {
    super(props);
    const { inboxes } = this.props;
    this.state = {
      allInboxes: inboxes,
    };
  }
  componentDidMount = () => {
    const { inboxSelected } = this.props;
    this.processEntries({ inboxSelected });
  };

  onCheckedChange = ({ item }) => {
    const { itemType, name } = item;

    if (itemType === 'inbox') {
      this.processEntries({ inboxSelected: item });
      this.props.setInbox({ inbox: item });
    } else {
      this.props.setConversationStatus({ status: name });
    }
  };

  submitFilters = () => {
    const { navigation, conversationStatus, inboxSelected, route } = this.props;
    const {
      params: { assigneeType },
    } = route;

    this.props.getConversations({
      assigneeType,
      conversationStatus,
      inboxSelected,
    });

    navigation.goBack();
  };

  onBackPress = () => {
    this.submitFilters();
  };

  renderLeftControl = () => <BackAction onPress={this.onBackPress} />;

  processEntries = ({ inboxSelected }) => {
    const { inboxes } = this.props;
    const allInboxes = inboxes.map((inbox) => ({
      ...inbox,
      itemType: 'inbox',
      isChecked: inboxSelected && inboxSelected.id === inbox.id ? true : false,
    }));

    this.setState({ allInboxes });
  };

  render() {
    const { allInboxes } = this.state;
    const {
      conversationStatus,
      eva: { style: themedStyle },
    } = this.props;

    return (
      <SafeAreaView style={themedStyle.container}>
        <TopNavigation
          accessoryLeft={this.renderLeftControl}
          title={i18n.t('FILTER.HEADER_TITLE')}
          titleStyle={themedStyle.headerTitle}
        />
        <Layout>
          <View style={themedStyle.itemMainView}>
            <View>
              <CustomText style={themedStyle.itemHeaderTitle}>
                {i18n.t('FILTER.CHOOSE_INBOX')}
              </CustomText>

              {allInboxes.map((item, index) => {
                return (
                  <FilterItem
                    key={item.id.toString()}
                    item={item}
                    isChecked={item.isChecked}
                    iconName={INBOX_ICON[item.channel_type]}
                    onCheckedChange={this.onCheckedChange}
                  />
                );
              })}
            </View>
          </View>
          <View style={themedStyle.itemMainView}>
            <View>
              <Text style={themedStyle.itemHeaderTitle}>{i18n.t('FILTER.CHOOSE_STATUS')}</Text>
              {statusOptions.map((item, index) => {
                return (
                  <FilterItem
                    item={item}
                    key={item.name}
                    iconName={item.icon}
                    isChecked={conversationStatus === item.name ? true : false}
                    onCheckedChange={this.onCheckedChange}
                  />
                );
              })}
            </View>
          </View>
        </Layout>
        <View style={themedStyle.filterButtonView}>
          <LoaderButton
            style={themedStyle.filterButton}
            size="large"
            textStyle={themedStyle.filterButtonText}
            onPress={() => this.submitFilters()}
            text={i18n.t('FILTER.SUBMIT')}
          />
        </View>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    setInbox: ({ inbox }) => dispatch(setInbox({ inbox })),
    setConversationStatus: ({ status }) => dispatch(setConversationStatus({ status })),
    getConversations: ({ assigneeType, conversationStatus, inboxSelected }) =>
      dispatch(getConversations({ assigneeType, conversationStatus, inboxSelected })),
  };
}
function mapStateToProps(state) {
  return {
    inboxes: state.inbox.data,
    inboxSelected: state.inbox.inboxSelected,
    conversationStatus: state.conversation.conversationStatus,
  };
}

FilterScreenComponent.propTypes = propTypes;
const FilterScreen = withStyles(FilterScreenComponent, styles);
export default connect(mapStateToProps, bindAction)(FilterScreen);
