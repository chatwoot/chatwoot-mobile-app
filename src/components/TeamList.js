import { Radio, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from './Text';

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  key: PropTypes.number,
  name: PropTypes.string,
  selectedTeam: PropTypes.bool,
  onClickCheckedChange: PropTypes.func,
};
const TeamListComponent = ({ eva, key, name, selectedTeam, onClickCheckedChange }) => {
  const { style } = eva;

  return (
    <TouchableOpacity activeOpacity={0.5} style={style.container}>
      <View style={style.itemView} key={key}>
        <View>
          <View style={style.nameView}>
            <CustomText style={style.name}>
              {name.length < 36 ? `${name}` : `${name.substring(0, 20)}...`}
            </CustomText>
          </View>
        </View>
      </View>
      <View style={style.radioView}>
        <Radio checked={selectedTeam} onChange={onClickCheckedChange} />
      </View>
    </TouchableOpacity>
  );
};

const styles = theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: theme['background-basic-color-1'],
    borderColor: theme['item-border-color'],
    borderBottomWidth: 0.5,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    padding: 2,
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

TeamListComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(TeamListComponent, styles);

export default React.memo(ChatMessageItem);
