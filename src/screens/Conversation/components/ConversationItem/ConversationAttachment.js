import React, { Fragment, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { Icon } from 'components';
import Text from 'components/Text';
import i18n from 'i18n';

const propTypes = {
  type: PropTypes.string,
  showAttachment: PropTypes.func,
  attachment: PropTypes.object,
};

const ConversationAttachmentItem = ({ attachment }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { file_type: fileType } = attachment;
  const { colors } = theme;
  return (
    <Fragment>
      {fileType === 'image' ? (
        <View style={styles.attachmentView}>
          <View style={styles.icon}>
            <Icon icon="image-outline" color={colors.text} size={14} />
          </View>
          <Text sm medium color={colors.text}>
            {i18n.t('CONVERSATION.PICTURE_CONTENT')}
          </Text>
        </View>
      ) : (
        <View style={styles.attachmentView}>
          <View style={styles.icon}>
            <Icon icon="document-outline" color={colors.text} size={14} />
          </View>
          <Text sm medium color={colors.text}>
            {i18n.t('CONVERSATION.ATTACHMENT_CONTENT')}
          </Text>
        </View>
      )}
    </Fragment>
  );
};

ConversationAttachmentItem.propTypes = propTypes;

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    attachmentView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.tiny,
    },
    icon: {
      marginRight: spacing.micro,
    },
  });
};

export default ConversationAttachmentItem;
