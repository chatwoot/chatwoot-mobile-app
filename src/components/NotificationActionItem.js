import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { Divider, withStyles } from '@ui-kitten/components';

import CustomText from './Text';

const styles = (theme) => ({
  section: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
    height: 60,
  },
  sectionTitleView: {
    flex: 8,
  },
  sectionText: {
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    paddingLeft: 8,
  },
  sectionActionView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 4,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  name: PropTypes.string,
  text: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
  availabilityStatus: PropTypes.string,
};

const NotificationActionItem = ({ text, itemType, name, onPressItem, eva: { style, theme } }) => {
  return (
    <React.Fragment>
      <TouchableOpacity style={style.section} onPress={() => onPressItem({ itemType })}>
        <View style={style.sectionTitleView}>
          <CustomText style={style.sectionText}>{text}</CustomText>
        </View>
        <View style={style.sectionActionView}>
          <CustomText style={style.sectionText}>{name}</CustomText>
        </View>
      </TouchableOpacity>
      <Divider />
    </React.Fragment>
  );
};

NotificationActionItem.propTypes = propTypes;

export default withStyles(NotificationActionItem, styles);
