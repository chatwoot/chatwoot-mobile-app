import React from 'react';
import { View } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import CustomText from '../../../components/Text';

const styles = theme => ({
  mainView: {
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateView: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme['color-background-date'],
  },
  text: {
    fontSize: theme['font-size-extra-small'],
  },
});

const ChatMessageDateComponent = ({ date, eva: { style } }) => {
  return (
    <View style={style.mainView}>
      <View style={style.dateView}>
        <CustomText style={style.text}>{date}</CustomText>
      </View>
    </View>
  );
};

const propTypes = {
  date: PropTypes.string,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
};

const defaultProps = {
  date: null,
};

ChatMessageDateComponent.defaultProps = defaultProps;
ChatMessageDateComponent.propTypes = propTypes;

const ChatMessageDate = withStyles(ChatMessageDateComponent, styles);

export default ChatMessageDate;
