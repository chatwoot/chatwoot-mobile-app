import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { Text } from 'components';
import { Image, View, Dimensions } from 'react-native';
import { StyleSheet } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    emptyView: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.small,
    },

    image: {
      width: deviceWidth * 0.2,
      height: deviceWidth * 0.7,
      aspectRatio: 2,
      resizeMode: 'contain',
    },
    titleView: {
      marginTop: Dimensions.get('window').height * 0.02,
      paddingLeft: spacing.larger,
      paddingRight: spacing.larger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleText: {
      textAlign: 'center',
    },
    subTitleText: {
      textAlign: 'center',
    },
  });
};

const propTypes = {
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  subTitle: PropTypes.string,
};

const Empty = ({ image, title, subTitle }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.emptyView}>
      <View style={styles.logoView}>
        <Image style={styles.image} source={image} accessible accessibilityLabel="empty-image" />
      </View>
      <View style={styles.titleView}>
        <Text sm color={colors.textLight} style={styles.titleText}>
          {title}
        </Text>
      </View>
      {subTitle && (
        <View style={styles.titleView}>
          <Text sm appearance="hint" color={colors.textLight} style={styles.subTitleText}>
            {subTitle}
          </Text>
        </View>
      )}
    </View>
  );
};
Empty.propTypes = propTypes;
export default Empty;
