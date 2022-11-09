import React, { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import ConversationItemLoader from './ConversationItemLoader';

const LoaderData = new Array(24).fill(0);

const renderItemLoader = () => <ConversationItemLoader />;

const createStyles = theme => ({
  container: {
    minHeight: 64,
  },
});

const propTypes = {
  unReadCount: PropTypes.number,
  content: PropTypes.string,
  messageType: PropTypes.number,
  isPrivate: PropTypes.bool,
};

const ConversationEmptyList = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <FlatList data={LoaderData} renderItem={renderItemLoader} />
    </View>
  );
};

ConversationEmptyList.propTypes = propTypes;
export default ConversationEmptyList;
