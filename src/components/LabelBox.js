import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { View } from 'react-native-animatable';
import { StyleSheet } from 'react-native';
import { Text, Icon, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    labelView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 6,
      paddingHorizontal: spacing.micro,
      paddingVertical: spacing.micro,
      height: spacing.medium,
      marginRight: spacing.micro,
      borderColor: colors.borderLight,
      borderRadius: borderRadius.micro,
      borderWidth: 0.5,
    },
    labelCloseIcon: {
      marginLeft: spacing.micro,
    },
  });
};
const propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  color: PropTypes.string,
  conversationId: PropTypes.number,
  onClickRemoveLabel: PropTypes.func,
};

const LabelBox = ({ id, title, color, onClickRemoveLabel }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors, spacing, borderRadius } = theme;

  const getLabelColor = clr => {
    return {
      backgroundColor: clr,
      width: spacing.half,
      height: spacing.half,
      borderRadius: borderRadius.micro,
      marginRight: spacing.micro,
    };
  };

  return (
    <React.Fragment>
      <View>
        <View style={styles.labelView} key={id}>
          <View style={[getLabelColor(color)]} />
          <Text xs medium color={colors.textDark} style={styles.label}>
            {title}
          </Text>
          <Pressable style={styles.labelCloseIcon} onPress={() => onClickRemoveLabel()}>
            <Icon icon="dismiss-outline" color={colors.textDark} size={12} />
          </Pressable>
        </View>
      </View>
    </React.Fragment>
  );
};

LabelBox.propTypes = propTypes;
export default LabelBox;
