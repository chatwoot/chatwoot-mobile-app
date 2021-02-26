import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Divider, Icon, withStyles } from '@ui-kitten/components';

import CustomText from '../../../components/Text';

const styles = (theme) => ({
  section: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
    height: 60,
  },
  sectionText: {
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    paddingTop: 2,
    paddingLeft: 8,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  name: PropTypes.string,
  thumbnail: PropTypes.string,
  text: PropTypes.string,
  checked: PropTypes.bool,
  iconName: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
};

const AttachmentActionItem = ({
  text,
  itemType,
  name,
  iconName,
  onPressItem,
  eva: { style, theme },
}) => {
  return (
    <React.Fragment>
      <TouchableOpacity style={style.section} onPress={() => onPressItem({ itemType })}>
        <Icon name={iconName} fill={theme['color-primary-default']} width={26} height={26} />
        <CustomText style={style.sectionText}>{text}</CustomText>
      </TouchableOpacity>
      <Divider />
    </React.Fragment>
  );
};

AttachmentActionItem.propTypes = propTypes;

export default withStyles(AttachmentActionItem, styles);
