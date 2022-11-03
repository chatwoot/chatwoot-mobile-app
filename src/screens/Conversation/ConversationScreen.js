import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import createStyles from './ConversationScreen.style';
import i18n from 'i18n';
import Header from 'components/Header/Header';

const ConversationScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const headerText = i18n.t('CONVERSATION.DEFAULT_HEADER_TITLE');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Header headerText={headerText} />
    </SafeAreaView>
  );
};

export default ConversationScreen;
