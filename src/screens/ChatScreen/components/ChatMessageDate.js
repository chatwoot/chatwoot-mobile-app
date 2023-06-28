import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { Text } from 'components';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    mainView: {
      flex: 1,
      flexDirection: 'row',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateView: {
      padding: spacing.smaller,
      marginTop: spacing.tiny,
      marginBottom: 6,
      borderRadius: borderRadius.small,
      backgroundColor: colors.backgroundDate,
    },
  });
};

const ChatMessageDateComponent = ({ date }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.mainView}>
      <View style={styles.dateView}>
        <Text xs medium color={colors.textDark}>
          {date}
        </Text>
      </View>
    </View>
  );
};

const propTypes = {
  date: PropTypes.string,
};

const defaultProps = {
  date: null,
};

ChatMessageDateComponent.defaultProps = defaultProps;
ChatMessageDateComponent.propTypes = propTypes;
export default ChatMessageDateComponent;
