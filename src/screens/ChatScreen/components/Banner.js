import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, Text, Pressable } from 'components';

import { openURL } from 'src/helpers/UrlHelper';
import { View } from 'react-native-animatable';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    bannerWrapper: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      padding: spacing.smaller,
      maxHeight: 60,
    },
    bannerText: {
      paddingTop: spacing.tiny,
      paddingLeft: spacing.smaller,
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
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
    },
  });
};

const propTypes = {
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
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const bannerColor = () => {
    if (color === 'primary') {
      return { backgroundColor: colors.primaryColor };
    }
    if (color === 'secondary') {
      return { backgroundColor: colors.secondaryColorLight };
    }
    if (color === 'alert') {
      return { backgroundColor: colors.dangerColor };
    }
    if (color === 'warning') {
      return { backgroundColor: colors.warningColor };
    }
    if (color === 'gray') {
      return { backgroundColor: colors.colorBlackLight };
    }
  };

  const bannerTextColor = () => {
    if (color === 'secondary') {
      return colors.secondaryColorDarker;
    }
    if (color === 'warning') {
      return colors.warningColorDarker;
    } else {
      return colors.colorWhite;
    }
  };

  const onPressOpenURL = () => {
    return openURL({ URL: hrefLink });
  };

  return (
    <React.Fragment>
      <Pressable style={[styles.bannerWrapper, bannerColor()]}>
        <View style={styles.bannerWrap}>
          <View>
            <Text xs medium color={bannerTextColor()} style={styles.bannerText}>
              {text}
              {hrefText && hrefLink ? (
                <Text
                  xs
                  medium
                  color={bannerTextColor()}
                  style={[styles.bannerText, styles.bannerHrefText]}
                  onPress={onPressOpenURL}>
                  {hrefText}
                </Text>
              ) : null}
            </Text>
          </View>
          {closeButton ? (
            <View style={styles.iconWrap}>
              <Pressable onPress={() => onPressItem({ itemType })}>
                <Icon icon="dismiss-circle-outline" color={colors.colorWhite} size={18} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Pressable>
    </React.Fragment>
  );
};

BannerComponent.propTypes = propTypes;
export default BannerComponent;
