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
    paddingTop: 4,
  },
  messageNotActive: {
    fontSize: theme['text-primary-size'],
    paddingTop: 4,
    color: theme['text-light-color'],
  },
  undoIcon: {
    width: 16,
    height: 16,
    marginTop: 4,
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
  return (
    <Fragment>
      {messageType === MESSAGE_TYPES.OUTGOING ? (
        <View style={style.itemView}>
          <UndoIcon style={style.undoIcon} fill={theme['text-hint-color']} />
          <CustomText
            style={unReadCount ? style.messageActive : style.messageNotActive}
            numberOfLines={1}
            maxLength={8}>
            {content && content.length > 30 ? ` ${content.substring(0, 30)}...` : ` ${content}`}
          </CustomText>
        </View>
      ) : (
        <CustomText
          style={unReadCount ? style.messageActive : style.messageNotActive}
          numberOfLines={1}
          maxLength={8}>
          {content && content.length > 30 ? `${content.substring(0, 30)}...` : `${content}`}
        </CustomText>
      )}
    </Fragment>
  );
};

ConversationContentItemComponent.propTypes = propTypes;

const ConversationContentItem = withStyles(ConversationContentItemComponent, styles);
export default ConversationContentItem;
