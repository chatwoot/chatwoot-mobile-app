import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Autocomplete } from 'react-native-ui-kitten';

import { theme } from '../theme';
const styles = StyleSheet.create({
  input: {
    width: 300,
    borderWidth: 2,
    flex: 1,
    fontSize: 32,
    // color: theme['text-primary-color'],
    color: 'pink',
    margin: 0,
    // marginHorizontal: 4,
    // padding: 12,
    height: 48,
  },
});

const propTypes = {
  autoCompleteData: PropTypes.shape([]),
  onChangeText: PropTypes.func,
  typedMessage: PropTypes.func,
  onSelect: PropTypes.func,
};

class ChatInputBox extends Component {
  state = { data: [], value: null };

  onSelect = ({ content }) => {
    this.setState({
      value: content,
    });
  };

  onChangeText = query => {
    const { autoCompleteData } = this.props;

    this.setState({
      value: query,
    });
    if (query === '\\') {
      this.setState({
        data: autoCompleteData,
      });
      // this.setState({
      //   data: autoCompleteData.filter(item =>
      //     item.title.toLowerCase().includes(`'\\'${query.toLowerCase()}`),
      //   ),
      // });
    } else {
      this.setState({
        data: [],
      });
    }
  };

  render() {
    return (
      <Autocomplete
        style={styles.input}
        placeholder="Type message..."
        placeholderTextColor={theme['text-primary-color']}
        value={this.state.value}
        data={this.state.data}
        onChangeText={this.onChangeText}
        onSelect={this.onSelect}
        placement="top start"
        inputProps={{
          style: {
            fontSize: 32,
          },
        }}
      />
    );
  }
}

ChatInputBox.propTypes = propTypes;

export default ChatInputBox;
