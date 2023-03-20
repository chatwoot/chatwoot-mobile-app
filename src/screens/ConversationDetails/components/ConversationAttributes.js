import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Text } from 'components';
import ConversationDetailsItem from '../../../components/ConversationDetailsItem';
import i18n from 'i18n';
import { customAttributeSelector } from 'reducer/customAttributeSlice';

const createStyles = theme => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    separator: {
      backgroundColor: colors.backgroundLight,
      width: '100%',
      paddingVertical: spacing.smaller,
      paddingLeft: spacing.small,
    },

    separatorView: {
      width: '100%',
    },

    accordionItemWrapper: {
      flexDirection: 'column',
      paddingBottom: spacing.small,
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      width: '100%',
    },
  });
};

const propTypes = {
  conversationDetails: PropTypes.object.isRequired,
};

const ConversationAttributes = ({ conversationDetails }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          <View style={styles.separatorView}>
            <View style={styles.separator}>
              <Text bold sm color={colors.textDark}>
                {i18n.t('CONVERSATION_DETAILS.TITLE')}
              </Text>
            </View>
            <View style={styles.accordionItemWrapper}>
              {displayItems}
              {getConversationAttributes()}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

ConversationAttributes.propTypes = propTypes;
export default ConversationAttributes;
