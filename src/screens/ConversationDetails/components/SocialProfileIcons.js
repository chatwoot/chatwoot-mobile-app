import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Icon, Pressable } from 'components';

import { openURL } from 'src/helpers/UrlHelper';

const createStyles = theme => {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    container: {
      paddingVertical: spacing.smaller,
    },
    socialIconWrap: {
      marginRight: spacing.small,
      borderRadius: borderRadius.larger,
    },
  });
};
const propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
};

const SocialProfileIcons = ({ type, value, iconName }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const generateSocialProfileLink = () => {
    switch (type) {
      case 'facebook':
        return `https://www.facebook.com/${value}`;
      case 'twitter':
        return `https://twitter.com/${value}`;
      case 'linkedin':
        return `https://www.linkedin.com/${value}`;
      case 'github':
        return `https://github.com/${value}`;
      default:
        return '';
    }
  };

  const url = generateSocialProfileLink();

  return (
    <React.Fragment>
      <View style={styles.container}>
        <Pressable style={styles.socialIconWrap} onPress={() => openURL({ URL: url })}>
          <Icon icon={iconName} color={colors.textDark} size={16} />
        </Pressable>
      </View>
    </React.Fragment>
  );
};

SocialProfileIcons.propTypes = propTypes;
export default SocialProfileIcons;
