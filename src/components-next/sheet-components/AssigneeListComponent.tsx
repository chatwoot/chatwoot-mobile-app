import React from 'react';
import { ImageSourcePropType, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useRefsContext } from '../../context';
import { tailwind } from '../../theme';
import { Agent } from '../../types';
import { Avatar, SearchBar } from '../common';

export const people: Agent[] = [
  {
    name: 'James Madisson',
    thumbnail: require('../../assets/local/avatars-small/avatar.png'),
  },
  {
    name: 'Sarah Yu',
    thumbnail: require('../../assets/local/avatars-small/avatar1.png'),
  },
  {
    name: 'Kimber Lee',
    thumbnail: require('../../assets/local/avatars-small/avatar3.png'),
  },
  {
    name: 'Nilan Roy',
    thumbnail: require('../../assets/local/avatars-small/avatar2.png'),
  },
  {
    name: 'James Jordan',
    thumbnail: require('../../assets/local/avatars-small/avatar4.png'),
  },
  {
    name: 'Alyssa Normandy',
    thumbnail: require('../../assets/local/avatars-small/avatar5.png'),
  },
  {
    name: 'Richard Grove',
    thumbnail: require('../../assets/local/avatars-small/avatar6.png'),
  },
  {
    name: 'Jay Prichett',
    thumbnail: require('../../assets/local/avatars-small/avatar4.png'),
  },
  {
    name: 'Claire Normandy',
    thumbnail: require('../../assets/local/avatars-small/avatar5.png'),
  },
  {
    name: 'Mitchell Grove',
    thumbnail: require('../../assets/local/avatars-small/avatar6.png'),
  },
  {
    name: 'Phil Dunphy',
    thumbnail: require('../../assets/local/avatars-small/avatar4.png'),
  },
  {
    name: 'Alex Turner',
    thumbnail: require('../../assets/local/avatars-small/avatar5.png'),
  },
  {
    name: 'Manny Delgado',
    thumbnail: require('../../assets/local/avatars-small/avatar6.png'),
  },
];

type AssigneeCellProps = {
  value: Agent;
  index: number;
};

const AssigneeCell = (props: AssigneeCellProps) => {
  const { value, index } = props;

  const { filtersModalSheetRef } = useRefsContext();

  const handleAssigneePress = () => {
    filtersModalSheetRef.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleAssigneePress} style={tailwind.style('flex flex-row items-center')}>
      <Avatar src={value.thumbnail as ImageSourcePropType} name={value.name} />
      <Animated.View
        style={tailwind.style(
          'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
          index !== people.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
        )}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            ),
          ]}>
          {value.name}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const AssigneeStack = () => {
  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={tailwind.style('my-1 pl-3')}>
      {people.map((value, index) => {
        return <AssigneeCell key={index} {...{ value, index }} />;
      })}
    </BottomSheetScrollView>
  );
};

export const AssigneeListComponent = () => {
  const { actionsModalSheetRef } = useRefsContext();
  const handleFocus = () => {
    actionsModalSheetRef.current?.expand();
  };
  const handleBlur = () => {
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
  };
  return (
    <React.Fragment>
      <SearchBar
        isInsideBottomsheet
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search people"
      />
      <AssigneeStack />
    </React.Fragment>
  );
};
