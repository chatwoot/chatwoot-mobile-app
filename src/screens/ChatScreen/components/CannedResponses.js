import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, Pressable } from 'components';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  const { width } = Dimensions.get('window');
  return StyleSheet.create({
    mainView: {
      backgroundColor: colors.colorWhite,
      marginHorizontal: spacing.smaller,
      borderRadius: borderRadius.small,
      shadowColor: colors.backdropColor,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 6,
      maxHeight: 200,
      borderColor: colors.borderLight,
      borderWidth: 0.6,
      position: 'absolute',
      width: width - spacing.smaller * 2,
      bottom: 106,
      zIndex: 1,
    },
    contentContainerStyle: {
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.smaller,
    },
    itemView: {
      flexDirection: 'row',
      paddingVertical: spacing.smaller,
    },
    lastItemView: {
      borderBottomWidth: 0.4,
      borderBottomColor: colors.borderLight,
    },
    content: {
      lineHeight: 18,
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
      <Text semiBold sm color={colors.primaryColorDark} style={styles.content}>
        {`${shortCode} - `}
        <Text regular sm color={colors.textDark} style={styles.content}>
          {content}
        </Text>
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
  const isCannedResponsesExist = cannedResponses.length > 0;

  return (
    <View style={[isCannedResponsesExist && styles.mainView]}>
      {isCannedResponsesExist && (
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
          contentContainerStyle={styles.contentContainerStyle}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps={'handled'}
        />
      )}
    </View>
  );
};

CannedResponses.propTypes = propTypes;
export default CannedResponses;
