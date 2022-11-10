import { storiesOf } from '@storybook/react-native';
import React from 'react';
import BottomSheetHeader from './BottomSheetHeader';
import { action } from '@storybook/addon-actions';
import CenterView from 'components/StoryBookView';
import { useTheme } from '@react-navigation/native';

const BottomSheetHeaderStory = () => {
  const theme = useTheme();
  const { colors } = theme;
  return <BottomSheetHeader title="Header" colors={colors} closeModal={action('closeModal')} />;
};

storiesOf('Bottom sheet Header', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Header', () => <BottomSheetHeaderStory />);
