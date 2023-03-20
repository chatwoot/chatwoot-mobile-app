import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import ConversationDetailsItem from 'components/ConversationDetailsItem.js';
import { Text } from 'components';
import i18n from 'i18n';

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
      paddingBottom: spacing.medium,
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      width: '100%',
    },
  });
};

const propTypes = {
  conversationDetails: PropTypes.object.isRequired,
};

const ContactAttributes = ({ conversationDetails }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { meta } = conversationDetails;
  const { sender } = meta;
  const { custom_attributes: contactAttributes } = sender;

  if (contactAttributes === {}) {
    return null;
  }

  const contactAttributesHasValue = Object.keys(contactAttributes).length > 0;
  return (
    <View>
      {contactAttributesHasValue ? (
        <View>
          <View style={styles.separatorView}>
            <View style={styles.separator}>
              <Text bold sm color={colors.textDark}>
                {i18n.t('CONTACT_ATTRIBUTES.TITLE')}
              </Text>
            </View>
            <View style={styles.accordionItemWrapper}>
              {Object.keys(contactAttributes).map(key => {
                return (
                  <ConversationDetailsItem
                    key={key}
                    title={key}
                    value={String(contactAttributes[key])}
                    type={key}
                  />
                );
              })}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

ContactAttributes.propTypes = propTypes;

export default ContactAttributes;
