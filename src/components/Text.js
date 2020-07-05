import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from '@ui-kitten/components';

class CustomText extends Component {
  static propTypes = {
    // We may use UI Kitten mapping engine instead of creating own,
    // Notice that using this way we replace RN Text with UI Kitten Text
    // And create mapping.json with needed configuration
    //
    // Now, there is no need to combine `fontWeight` and `fontFamily` props
    // fontFamily will be queried for a given fontWeight.
    // Think if you can use fontSize properties for this to bring more consistency in your app.
    // E.g fontWeight is 400, fontSize should be 18, etc.
    //
    // Notice we don't create defaultProps for 400 - it is used as default in mapping.json.
    // style: PropTypes.arrayOf(PropTypes.object),
    weight: PropTypes.oneOf(['300', '400', '500', '600', '700', '800', '900']),
    locale: PropTypes.string,
  };

  findWeightVariant = (props) => {
    const flatStyle = StyleSheet.flatten(props.style || {});
    return flatStyle.fontWeight || '400';
  };

  render() {
    const weightVariant = this.findWeightVariant(this.props);

    return <Text {...this.props} weight={weightVariant} />;
  }
}

export default CustomText;
