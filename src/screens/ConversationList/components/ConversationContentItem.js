import React, { Fragment } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';

import CustomText from 'components/Text';
import { MESSAGE_TYPES } from 'constants';

const UndoIcon = style => {
  return <Icon {...style} name="undo" />;
};

const LockIcon = style => {
  return <Icon {...style} name="lock" />;
};

const styles = theme => ({
  itemView: {
    flex: 1,
    flexDirection: 'row',
  },
  messageActive: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  messageNotActive: {
    fontSize: theme['text-primary-size'],
    paddingTop: 4,
    color: theme['text-light-color'],
  },
  undoIcon: {
    width: 14,
    height: 14,
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
  isPrivate: PropTypes.bool,
};

const ConversationContentItemComponent = ({
  eva,
  unReadCount,
  content,
  messageType,
  isPrivate,
}) => {
  const { style, theme } = eva;
  const message = content
    ? content.replace(/\[(@[\w_. ]+)\]\(mention:\/\/(?:user|team)\/\d+\/(.*?)+\)/gi, '$1').trim()
    : '';
  return (
    <Fragment>
      {messageType === MESSAGE_TYPES.OUTGOING ? (
        <View style={style.itemView}>
          {isPrivate ? (
            <LockIcon style={style.undoIcon} fill={theme['text-hint-color']} />
          ) : (
            <UndoIcon style={style.undoIcon} fill={theme['text-hint-color']} />
          )}
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