import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { TouchableOpacity, View, Switch, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from 'components';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.smaller,
      marginTop: spacing.smaller,
    },
    textView: {
      width: '85%',
    },
    text: {
      textAlign: 'left',
    },
    radioView: {
      width: '15%',
      alignItems: 'flex-end',
    },
    radio: {
      transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }],
    },
  });
};

const propTypes = {
  title: PropTypes.string,
  item: PropTypes.string,
  onCheckedChange: PropTypes.func,
  isChecked: PropTypes.bool,
};

const NotificationPreferenceItemComponent = ({ title, item, onCheckedChange, isChecked }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <TouchableOpacity style={styles.itemView} onPress={() => onCheckedChange({ item })}>
      <View style={styles.textView}>
        <Text sm medium color={colors.textLight} style={styles.channelText}>
          {title}
        </Text>
      </View>

      <View style={styles.radioView}>
        <Switch
          trackColor={{ false: colors.secondaryColorLight, true: colors.primaryColor }}
          thumbColor={colors.colorWhite}
          style={styles.radio}
          ios_backgroundColor={colors.secondaryColorLight}
          onValueChange={() => onCheckedChange({ item })}
          value={isChecked}
        />
      </View>
    </TouchableOpacity>
  );
};

NotificationPreferenceItemComponent.propTypes = propTypes;
export default NotificationPreferenceItemComponent;
