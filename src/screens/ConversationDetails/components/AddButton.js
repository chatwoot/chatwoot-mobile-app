import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles } from '@ui-kitten/components';
import { Icon } from '@ui-kitten/components';
import { Text } from 'react-native';

const styles = theme => ({
  addButtonWrap: {
    flexDirection: 'row',
    height: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme['color-primary-50'],
    borderColor: theme['color-primary-75'],
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    marginRight: 6,
  },
  addButton: {
    marginRight: 6,
    color: theme['color-primary-700'],
    fontWeight: theme['font-medium'],
    fontSize: theme['font-size-extra-small'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  buttonLabel: PropTypes.string,
  iconName: PropTypes.string,
  onClickOpen: PropTypes.func,
};

const AddButton = ({ buttonLabel, iconName, onClickOpen, eva: { style, theme } }) => {
  return (
    <React.Fragment>
      <TouchableOpacity style={style.addButtonWrap} onPress={onClickOpen}>
        <Text style={style.addButton}>{buttonLabel}</Text>
        <Icon name={iconName} height={14} width={14} fill={theme['color-primary-700']} />
      </TouchableOpacity>
    </React.Fragment>
  );
};

AddButton.propTypes = propTypes;

export default withStyles(AddButton, styles);
