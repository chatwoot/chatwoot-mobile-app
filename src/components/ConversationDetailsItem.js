import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { openURL } from 'src/helpers/UrlHelper';
import { Text } from 'components';

const createStyles = theme => {
  const { spacing } = theme;

  return StyleSheet.create({
    itemTitleView: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing.micro,
      paddingTop: spacing.small,
    },
  });
};

const propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
};

const ConversationDetailsItem = ({ value, title, type }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const link = type === 'referer';
  return (
    <React.Fragment>
      <View key={type}>
        <View style={styles.itemTitleView}>
          <Text medium sm color={colors.textDark}>
            {title}
          </Text>
        </View>
        <View>
          {link ? (
            <Text sm color={colors.primaryColor} onPress={() => openURL({ URL: value })}>
              {value}
            </Text>
          ) : (
            <Text sm color={colors.textDark}>
              {value}
            </Text>
          )}
        </View>
      </View>
    </React.Fragment>
  );
};
ConversationDetailsItem.propTypes = propTypes;
export default ConversationDetailsItem;
