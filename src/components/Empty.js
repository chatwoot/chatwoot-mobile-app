import React, { Component } from 'react';
import { Image, View } from 'react-native';
import { Dimensions } from 'react-native';

import PropTypes from 'prop-types';
import { withStyles } from '@ui-kitten/components';

import CustomText from './Text';

const deviceWidth = Dimensions.get('window').width;

const styles = (theme) => ({
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  image: {
    width: deviceWidth * 0.2,
    height: deviceWidth * 0.7,
    aspectRatio: 2,
    resizeMode: 'contain',
  },
  titleView: {
    marginTop: Dimensions.get('window').height * 0.02,
    paddingLeft: 48,
    paddingRight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-semi-bold'],
  },
  subTitleText: {
    fontSize: theme['font-size-small'],
    textAlign: 'center',
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  image: PropTypes.number,
  title: PropTypes.string,
  subTitle: PropTypes.string,
};

class EmptyComponent extends Component {
  render() {
    const {
      image,
      title,
      subTitle,
      eva: { style },
    } = this.props;

    return (
      <View style={style.emptyView}>
        <View style={style.logoView}>
          <Image style={style.image} source={image} />
        </View>
        <View style={style.titleView}>
          <CustomText style={style.titleText}>{title}</CustomText>
        </View>
        {subTitle && (
          <View style={style.titleView}>
            <CustomText appearance="hint" style={style.subTitleText}>
              {subTitle}
            </CustomText>
          </View>
        )}
      </View>
    );
  }
}

EmptyComponent.propTypes = propTypes;

const Empty = withStyles(EmptyComponent, styles);

export default Empty;
