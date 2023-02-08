import React from 'react';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import ConversationDetailsItem from '../../../components/ConversationDetailsItem';
import CustomText from 'components/Text';
import i18n from 'i18n';

const styles = theme => ({
  itemListViewTitle: {
    paddingTop: 12,
    fontWeight: theme['font-semi-bold'],
  },
  separationView: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  conversationDetails: PropTypes.object.isRequired,
};

const ContactAttributes = ({ conversationDetails, eva: { style, theme } }) => {
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
          <View style={style.separationView} />
          <CustomText style={style.itemListViewTitle}>
            {i18n.t('CONTACT_ATTRIBUTES.TITLE')}
          </CustomText>
          <View style={style.itemListView}>
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
      ) : null}
    </View>
  );
};

ContactAttributes.propTypes = propTypes;

export default withStyles(ContactAttributes, styles);
