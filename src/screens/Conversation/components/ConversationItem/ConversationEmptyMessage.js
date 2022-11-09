import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import images from 'constants/images';
import Empty from 'components/Empty/Empty';
import i18n from 'i18n';
const createStyles = theme => ({
  tabContainer: {
    paddingBottom: 120,
    minHeight: 64,
  },
});

const ConversationEmptyMessage = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.tabContainer}>
      <Empty image={images.emptyConversations} title={i18n.t('CONVERSATION.EMPTY')} />
    </View>
  );
};
export default ConversationEmptyMessage;
