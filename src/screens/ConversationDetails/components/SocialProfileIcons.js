import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';

import { openURL } from 'src/helpers/UrlHelper';
import { View } from 'react-native-animatable';

const styles = theme => ({
  container: {
    paddingVertical: 8,
  },
  socialIconWrap: {
    marginRight: 10,
    backgroundColor: theme['color-secondary-100'],
    padding: 4,
    borderRadius: 20,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
};

const SocialProfileIcons = ({ type, value, iconName, eva: { style, theme } }) => {
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
      <TouchableOpacity>
        <View style={style.container}>
          <View style={style.socialIconWrap}>
            <Icon
              name={iconName}
              height={16}
              width={16}
              fill={theme['text-light-color']}
              onPress={() => openURL({ URL: url })}
            />
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

SocialProfileIcons.propTypes = propTypes;

export default withStyles(SocialProfileIcons, styles);
