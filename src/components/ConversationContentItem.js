import React, { Fragment } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';

import CustomText from './Text';
import { MESSAGE_TYPES } from '../constants';

const UndoIcon = (style) => {
  return <Icon {...style} name="undo" />;
};

const styles = (theme) => ({
  itemView: {
    flex: 1,
    flexDirection: 'row',
  },
  messageActive: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    paddingTop: 6,
  },
  messageNotActive: {
    fontSize: theme['text-primary-size'],
    paddingTop: 6,
    color: theme['text-light-color'],
  },
  undoIcon: {
    width: 16,
    height: 16,
    marginTop: 6,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  unReadCount: PropTypes.number,
  content: PropTypes.string,
  messageType: PropTypes.number,
};

const ConversationContentItemComponent = ({ eva, unReadCount, content, messageType }) => {
  const { style, theme } = eva;
  const message = content
    ? content.replace(/\[(@[\w_.]+)\]\(mention:\/\/user\/\d+\/[\w_.]+\)/gi, '$1').trim()
    : '';
  return (
    <Fragment>
      {messageType === MESSAGE_TYPES.OUTGOING ? (
        <View style={style.itemView}>
          <UndoIcon style={style.undoIcon} fill={theme['text-hint-color']} />
          <CustomText
            style={unReadCount ? style.messageActive : style.messageNotActive}
            numberOfLines={1}
            maxLength={8}>
            {message && message.length > 30 ? ` ${message.substring(0, 28)}...` : ` ${message}`}
          </CustomText>
        </View>
      ) : (
        <CustomText
          style={unReadCount ? style.messageActive : style.messageNotActive}
          numberOfLines={1}
          maxLength={8}>
          {message && message.length > 30 ? `${message.substring(0, 28)}...` : `${message}`}
        </CustomText>
      )}
    </Fragment>
  );
};

ConversationContentItemComponent.propTypes = propTypes;

const ConversationContentItem = withStyles(ConversationContentItemComponent, styles);
export default ConversationContentItem;
