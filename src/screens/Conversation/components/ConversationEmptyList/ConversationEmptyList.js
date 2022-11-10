import React, { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { ConversationEmptyItem } from '../index';
import createStyles from './ConversationEmptyList.style';
const LoaderData = new Array(24).fill(0);

const keyExtractor = item => item.id;

const renderItemLoader = (item, index) => <ConversationEmptyItem key={index} />;

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
      <FlatList keyExtractor={keyExtractor} data={LoaderData} renderItem={renderItemLoader} />
    </View>
  );
};

ConversationEmptyList.propTypes = propTypes;
export default ConversationEmptyList;
