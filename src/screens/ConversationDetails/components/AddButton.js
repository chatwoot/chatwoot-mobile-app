import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Text, Icon, Pressable } from 'components';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    addButtonWrap: {
      flexDirection: 'row',
      height: spacing.medium,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: colors.primaryColorLight,
      borderColor: colors.primaryColorLight,
      borderWidth: 0.2,
      borderRadius: borderRadius.micro,
      paddingHorizontal: spacing.smaller,
      marginBottom: spacing.micro,
      marginRight: 6,
    },
    addButton: {
      marginRight: 6,
    },
  });
};

const propTypes = {
  buttonLabel: PropTypes.string,
  iconName: PropTypes.string,
  onClickOpen: PropTypes.func,
};

const AddButton = ({ buttonLabel, iconName, onClickOpen }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <React.Fragment>
      <Pressable style={styles.addButtonWrap} onPress={onClickOpen}>
        <Text xs medium color={colors.primaryColorDarker} style={styles.addButton}>
          {buttonLabel}
        </Text>
        <Icon icon={iconName} color={colors.primaryColorDarker} size={14} />
      </Pressable>
    </React.Fragment>
  );
};

AddButton.propTypes = propTypes;
export default AddButton;
