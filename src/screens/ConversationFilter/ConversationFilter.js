import React, { Component } from 'react';
import { Layout, Text, withStyles } from '@ui-kitten/components';

import { connect } from 'react-redux';

import { View, SafeAreaView, ScrollView } from 'react-native';

import PropTypes from 'prop-types';

import i18n from '../../i18n';
import LoaderButton from '../../components/LoaderButton';
import { setInbox } from '../../actions/inbox';
import { setConversationStatus, getConversations } from '../../actions/conversation';
import CustomText from '../../components/Text';
import FilterItem from '../../components/FilterItem';

import HeaderBar from '../../components/HeaderBar';

import styles from './ConversationFilter.style';
import { INBOX_ICON } from '../../constants';

const statusOptions = [
  {
    name: i18n.t('FILTER.OPEN'),
    key: 'open',
    itemType: 'status',
    icon: 'book-open-outline',
  },
  {
    name: i18n.t('FILTER.RESOLVED'),
    key: 'resolved',
    itemType: 'status',
    icon: 'done-all-outline',
  },
  {
    name: i18n.t('FILTER.BOT'),
    key: 'bot',
    itemType: 'status',
    icon: 'tv-outline',
  },
  {
    name: i18n.t('FILTER.PENDING'),
    key: 'pending',
    itemType: 'status',
    icon: 'activity-outline',
  },
  {
    name: i18n.t('FILTER.SNOOZED'),
    key: 'snoozed',
    itemType: 'status',
    icon: 'clock-outline',
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
    const { itemType, key } = item;

    if (itemType === 'inbox') {
      this.processEntries({ inboxSelected: item });
      this.props.setInbox({ inbox: item });
    } else {
      this.props.setConversationStatus({ status: key });
    }
  };

  submitFilters = () => {
    const { navigation, route } = this.props;
    const {
      params: { assigneeType },
    } = route;

    this.props.getConversations({
      assigneeType,
    });

    navigation.goBack();
  };

  onBackPress = () => {
    this.submitFilters();
  };

  processEntries = ({ inboxSelected }) => {
    const { inboxes } = this.props;
    const allInboxes = inboxes.map(inbox => ({
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
        <HeaderBar
          showLeftButton
          title={i18n.t('FILTER.HEADER_TITLE')}
          onBackPress={this.onBackPress}
        />
        <ScrollView>
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
                      isChecked={conversationStatus === item.key ? true : false}
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
        </ScrollView>
      </SafeAreaView>
    );
  }
}

function bindAction(dispatch) {
  return {
    setInbox: ({ inbox }) => dispatch(setInbox({ inbox })),
    setConversationStatus: ({ status }) => dispatch(setConversationStatus({ status })),
    getConversations: ({ assigneeType }) => dispatch(getConversations({ assigneeType })),
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
