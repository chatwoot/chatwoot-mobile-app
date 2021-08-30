import React from 'react';
import { Layout, List, withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';

import ConversationItemLoader from './ConversationItemLoader';

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <ConversationItemLoader />;

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
      <List data={LoaderData} renderItem={renderItemLoader} />
    </Layout>
  );
};

ConversationEmptyList.propTypes = propTypes;

const ConversationEmptyListItem = withStyles(ConversationEmptyList, styles);
export default ConversationEmptyListItem;
