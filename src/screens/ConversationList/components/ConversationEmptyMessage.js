import React from 'react';
import { Layout, withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';

import Empty from 'components/Empty';
import images from 'constants/images';
import i18n from 'i18n';

const styles = theme => ({
  tabContainer: {
    paddingBottom: 120,
    minHeight: 64,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
};

const ConversationEmptyList = ({ eva: { style, theme } }) => {
  return (
    <Layout style={style.tabContainer}>
      <Empty image={images.emptyConversations} title={i18n.t('CONVERSATION.EMPTY')} />
    </Layout>
  );
};

ConversationEmptyList.propTypes = propTypes;

const ConversationEmptyListItem = withStyles(ConversationEmptyList, styles);
export default ConversationEmptyListItem;
