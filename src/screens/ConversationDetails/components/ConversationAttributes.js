import React from 'react';
import { withStyles } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import ConversationDetailsItem from '../../../components/ConversationDetailsItem';
import CustomText from 'components/Text';
import i18n from 'i18n';
import { customAttributeSelector } from 'reducer/customAttributeSlice';
const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },

  wrapper: {
    paddingHorizontal: 20,
  },

  avatarContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  userNameContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 8,
  },

  description: {
    fontSize: theme['font-size-small'],
    color: theme['text-light-color'],
    lineHeight: 20,
  },

  socialIconsContainer: {
    flexDirection: 'row',
  },

  separationView: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },

  a: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },

  nameLabel: {
    textTransform: 'capitalize',
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-large'],
  },

  itemListViewTitle: {
    paddingTop: 12,
    fontWeight: theme['font-semi-bold'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  conversationDetails: PropTypes.object.isRequired,
};

const ConversationAttributes = ({ conversationDetails, eva: { style, theme } }) => {
  const { additional_attributes: additionalAttributes } = conversationDetails;
  const attributes = useSelector(customAttributeSelector.selectAll);
  const { meta } = conversationDetails;
  const { sender } = meta;
  if (!additionalAttributes) {
    return null;
  }

  const { custom_attributes: conversationAttributes } = conversationDetails;

  const {
    browser: {
      browser_name: browserName,
      browser_version: browserVersion,
      platform_name: platformName,
      platform_version: platformVersion,
    } = {},
    initiated_at: { timestamp } = {},
    referer,
  } = additionalAttributes;
  const { additional_attributes: { created_at_ip: createdAtIp } = {} } = sender;

  const displayKeys = [
    {
      key: 'timestamp',
      value: timestamp,
      title: i18n.t('CONVERSATION_DETAILS.INITIATED_AT'),
    },
    {
      key: 'referer',
      value: referer,
      title: i18n.t('CONVERSATION_DETAILS.INITIATED_FROM'),
    },
    {
      key: 'browserName',
      value:
        browserName && browserVersion !== undefined ? `${browserName} ${browserVersion}` : null,
      title: i18n.t('CONVERSATION_DETAILS.BROWSER'),
    },
    {
      key: 'platformName',
      value:
        platformName && platformVersion !== undefined ? `${platformName} ${platformVersion}` : null,
      title: i18n.t('CONVERSATION_DETAILS.OPERATING_SYSTEM'),
    },
    {
      key: 'createdAtIp',
      value: createdAtIp,
      title: i18n.t('CONVERSATION_DETAILS.IP_ADDRESS'),
    },
  ];

  const displayItems = displayKeys
    .map(({ key, value, title }) =>
      value ? <ConversationDetailsItem key={key} title={title} value={value} type={key} /> : null,
    )
    .filter(displayItem => !!displayItem);

  const getConversationAttributes = () => {
    return attributes
      .filter(attribute => attribute.attribute_model === 'conversation_attribute')
      .map(attribute => {
        const { attribute_key: attributeKey, attribute_display_name: displayName } = attribute;
        if (conversationAttributes[attributeKey] !== undefined) {
          return (
            <ConversationDetailsItem
              key={attributeKey}
              title={displayName}
              value={String(conversationAttributes[attributeKey])}
              type={attributeKey}
            />
          );
        }
      });
  };

  const conversationAttributesHasValue = Object.keys(conversationAttributes).length > 0;
  return (
    <View>
      {displayItems.length > 0 || conversationAttributesHasValue ? (
        <View>
          <View style={style.separationViewLabels} />
          <CustomText style={style.itemListViewTitle}>
            {i18n.t('CONVERSATION_DETAILS.TITLE')}
          </CustomText>
          <View style={style.itemListView}>
            {displayItems}
            {getConversationAttributes()}
          </View>
        </View>
      ) : null}
    </View>
  );
};

ConversationAttributes.propTypes = propTypes;

export default withStyles(ConversationAttributes, styles);
