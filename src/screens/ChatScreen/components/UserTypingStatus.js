import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'components';
import PropTypes from 'prop-types';
import { View } from 'react-native-animatable';

const createStyles = theme => {
  return StyleSheet.create({
    subHeaderTitle: {
      paddingLeft: 1,
    },
  });
};

const propTypes = {
  typingUser: PropTypes.string,
};

const TypingStatusComponent = ({ typingUser }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <React.Fragment>
      <TouchableOpacity>
        <View>
          <Text xs medium color={colors.successColor} style={styles.subHeaderTitle}>
            {typingUser ? `${typingUser}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

TypingStatusComponent.propTypes = propTypes;
export default TypingStatusComponent;
