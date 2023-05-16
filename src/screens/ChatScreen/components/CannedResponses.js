import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, Pressable } from 'components';
import { View, FlatList, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    mainView: {
      backgroundColor: colors.colorWhite,
      borderRadius: borderRadius.micro,
      paddingHorizontal: spacing.small,
      maxHeight: 200,
      borderTopColor: colors.borderLight,
      borderTopWidth: 1,
    },
    itemView: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.tiny,
    },
    lastItemView: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    content: {
      flex: 1,
    },
  });
};

const CannedResponseComponent = ({ shortCode, content, lastItem, onClick }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      style={[styles.itemView, !lastItem && styles.lastItemView]}
      onPress={() => onClick(content)}>
      <Text bold color={colors.primaryColor}>
        {shortCode} -
      </Text>
      <Text medium color={colors.primaryColor} style={styles.content}>
        {content}
      </Text>
    </Pressable>
  );
};

CannedResponseComponent.propTypes = {
  shortCode: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  lastItem: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const CannedResponse = React.memo(CannedResponseComponent);

const propTypes = {
  cannedResponses: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
};

const CannedResponses = ({ cannedResponses, onClick }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.mainView}>
      <FlatList
        data={cannedResponses}
        renderItem={({ item, index }) => (
          <CannedResponse
            shortCode={item.shortCode}
            content={item.content}
            lastItem={cannedResponses.length - 1 === index}
            onClick={onClick}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

CannedResponses.propTypes = propTypes;
export default CannedResponses;
