import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';

import { openURL } from 'src/helpers/UrlHelper';
import CustomText from '../../../components/Text';
import { View } from 'react-native-animatable';

const styles = theme => ({
  bannerWrapper: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 8,
    maxHeight: 60,
  },
  bannerText: {
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    paddingTop: 2,
    paddingLeft: 8,
  },
  bannerHrefText: {
    textDecorationLine: 'underline',
  },
  bannerWrap: {
    flexDirection: 'row',
  },
  iconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 6,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  text: PropTypes.string,
  color: PropTypes.string,
  hrefText: PropTypes.string,
  hrefLink: PropTypes.string,
  closeButton: PropTypes.bool,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
};

const BannerComponent = ({
  text,
  color,
  hrefText,
  hrefLink,
  closeButton,
  itemType,
  onPressItem,
  eva: { style, theme },
}) => {
  const bannerColor = () => {
    if (color === 'primary') {
      return { backgroundColor: theme['color-primary-500'] };
    }
    if (color === 'secondary') {
      return { backgroundColor: theme['color-secondary-200'] };
    }
    if (color === 'alert') {
      return { backgroundColor: theme['color-danger-500'] };
    }
    if (color === 'warning') {
      return { backgroundColor: theme['color-warning-500'] };
    }
    if (color === 'gray') {
      return { backgroundColor: theme['color-black-500'] };
    }
  };

  const bannerTextColor = () => {
    if (color === 'secondary') {
      return { color: theme['color-secondary-800'] };
    }
    if (color === 'warning') {
      return { color: theme['color-warning-900'] };
    } else {
      return { color: theme['color-white'] };
    }
  };

  const onPressOpenURL = () => {
    return openURL({ URL: hrefLink });
  };

  return (
    <React.Fragment>
      <TouchableOpacity style={[style.bannerWrapper, bannerColor()]}>
        <View style={style.bannerWrap}>
          <View>
            <CustomText style={[style.bannerText, bannerTextColor()]}>
              {text}
              {hrefText && hrefLink ? (
                <CustomText
                  style={[style.bannerText, style.bannerHrefText, bannerTextColor()]}
                  onPress={onPressOpenURL}>
                  {hrefText}
                </CustomText>
              ) : null}
            </CustomText>
          </View>
          {closeButton ? (
            <View style={style.iconWrap}>
              <Icon
                name="close-circle-outline"
                width={18}
                height={18}
                fill={theme['color-white']}
                onPress={() => onPressItem({ itemType })}
              />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

BannerComponent.propTypes = propTypes;

export default withStyles(BannerComponent, styles);
